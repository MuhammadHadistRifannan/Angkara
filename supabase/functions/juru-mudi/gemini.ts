import type { LlmClient, LlmResult, LlmTurn, ToolSpec } from "../_shared/contracts.ts";
import { UpstreamError } from "../_shared/weather/bmkg.ts";

interface GeminiFunctionCall {
  name: string;
  args?: Record<string, unknown>;
}

interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: {
    name: string;
    response: { output: unknown };
  };
}

interface GeminiContent {
  role: "user" | "model" | "function";
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      role: string;
      parts?: GeminiPart[];
    };
    finishReason?: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export function createGeminiClient(
  apiKey: string,
  model: string,
  f: typeof fetch = fetch
): LlmClient {
  return {
    async generate(req: {
      system: string;
      messages: LlmTurn[];
      tools: ToolSpec[];
    }): Promise<LlmResult> {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      const contents: GeminiContent[] = [];

      for (const turn of req.messages) {
        if (turn.role === "user") {
          contents.push({
            role: "user",
            parts: [{ text: turn.content }],
          });
        } else if (turn.role === "assistant") {
          const parts: GeminiPart[] = [];
          if (turn.content) {
            parts.push({ text: turn.content });
          }
          if (turn.toolCalls && turn.toolCalls.length > 0) {
            for (const call of turn.toolCalls) {
              parts.push({
                functionCall: {
                  name: call.name,
                  args: (call.args as Record<string, unknown>) || {},
                },
              });
            }
          }
          if (parts.length > 0) {
            contents.push({ role: "model", parts });
          }
        } else if (turn.role === "tool") {
          contents.push({
            role: "function",
            parts: [
              {
                functionResponse: {
                  name: turn.name,
                  response: { output: turn.response },
                },
              },
            ],
          });
        }
      }

      const requestPayload: Record<string, unknown> = { contents };

      if (req.system && req.system.trim().length > 0) {
        requestPayload.systemInstruction = {
          parts: [{ text: req.system }],
        };
      }

      if (req.tools && req.tools.length > 0) {
        requestPayload.tools = [
          {
            functionDeclarations: req.tools.map((t) => ({
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            })),
          },
        ];
      }

      // Retry up to 1 time for 429 or server errors
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await f(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify(requestPayload),
          });

          if (res.status === 429) {
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 500));
              continue;
            }
            throw new UpstreamError("Gemini rate limit exceeded (429)", 429);
          }

          if (!res.ok) {
            if (attempt === 0 && res.status >= 500) {
              await new Promise((r) => setTimeout(r, 500));
              continue;
            }
            const errText = await res.text();
            throw new UpstreamError(`Gemini API error (${res.status}): ${errText}`, res.status);
          }

          const data = (await res.json()) as GeminiResponse;
          const candidate = data.candidates?.[0];
          const parts = candidate?.content?.parts || [];

          const toolCalls: Array<{ name: string; args: unknown }> = [];
          let text = "";

          for (const part of parts) {
            if (part.functionCall) {
              toolCalls.push({
                name: part.functionCall.name,
                args: part.functionCall.args || {},
              });
            }
            if (part.text) {
              text += part.text;
            }
          }

          if (toolCalls.length > 0) {
            return { kind: "tool_calls", calls: toolCalls };
          }

          return { kind: "text", text };
        } catch (err: unknown) {
          if (attempt === 0 && !(err instanceof UpstreamError && err.status === 400)) {
            await new Promise((r) => setTimeout(r, 500));
            continue;
          }
          if (err instanceof UpstreamError) {
            throw err;
          }
          const msg = err instanceof Error ? err.message : String(err);
          throw new UpstreamError(`Gagal menghubungi Gemini API: ${msg}`);
        }
      }

      throw new UpstreamError("Gemini API call failed after retrying");
    },
  };
}
