import type {
  ChatMessage,
  AssistantReply,
  AssistantCard,
  LlmClient,
  LlmTurn,
  ToolDef,
  ToolCtx,
  ToolSpec,
} from "../_shared/contracts.ts";
import { SYSTEM_PROMPT } from "./prompt.ts";

function convertToolToSpec(tool: ToolDef<unknown, unknown>): ToolSpec {
  let parameters: Record<string, unknown> = { type: "OBJECT", properties: {} };

  // Inspeksi struktur Zod schema tanpa dependensi eksternal
  const toolWithDef = tool.schema as unknown as {
    _def?: {
      shape?: () => Record<string, unknown>;
    };
  };

  if (toolWithDef._def && typeof toolWithDef._def.shape === "function") {
    const shape = toolWithDef._def.shape();
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, val] of Object.entries(shape)) {
      let current = val as { _def?: { typeName?: string; innerType?: unknown; values?: unknown[] } };
      let isOptional = false;

      while (
        current?._def?.typeName === "ZodOptional" ||
        current?._def?.typeName === "ZodNullable"
      ) {
        isOptional = true;
        current = current._def.innerType as typeof current;
      }

      if (!isOptional) {
        required.push(key);
      }

      const typeName = current?._def?.typeName;
      if (typeName === "ZodString") {
        properties[key] = { type: "STRING" };
      } else if (typeName === "ZodNumber") {
        properties[key] = { type: "NUMBER" };
      } else if (typeName === "ZodEnum" && Array.isArray(current._def?.values)) {
        properties[key] = { type: "STRING", enum: current._def.values };
      } else {
        properties[key] = { type: "STRING" };
      }
    }

    parameters = {
      type: "OBJECT",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  return {
    name: tool.name,
    description: tool.description,
    parameters,
  };
}

export async function runAgent(
  messages: ChatMessage[],
  deps: {
    llm: LlmClient;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: ToolDef<any, any>[];
    ctx: ToolCtx;
    now: () => Date;
  }
): Promise<AssistantReply> {
  const MAX_ROUNDS = 6;
  const TIMEOUT_MS = 25000;
  const startTime = deps.now().getTime();

  const turns: LlmTurn[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const collectedCards: AssistantCard[] = [];
  const toolSpecs: ToolSpec[] = deps.tools.map((t) => convertToolToSpec(t));

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    // Periksa batas waktu total 25 detik
    if (deps.now().getTime() - startTime >= TIMEOUT_MS) {
      return {
        text: "Waktu pemrosesan permintaan melebihi batas (25 detik). Silakan coba ajukan kembali.",
        cards: collectedCards,
      };
    }

    const res = await deps.llm.generate({
      system: SYSTEM_PROMPT,
      messages: turns,
      tools: toolSpecs,
    });

    if (res.kind === "text") {
      return {
        text: res.text,
        cards: collectedCards,
      };
    }

    // Model mengembalikan tool_calls
    turns.push({
      role: "assistant",
      toolCalls: res.calls,
    });

    for (const call of res.calls) {
      const tool = deps.tools.find((t) => t.name === call.name);

      if (!tool) {
        turns.push({
          role: "tool",
          name: call.name,
          response: {
            ok: false,
            reason: `Tool '${call.name}' tidak dikenal atau tidak tersedia`,
          },
        });
        continue;
      }

      const parsed = tool.schema.safeParse(call.args);
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message || "Format argumen tidak valid";
        turns.push({
          role: "tool",
          name: call.name,
          response: {
            ok: false,
            reason: `Argumen untuk tool '${call.name}' tidak valid: ${msg}`,
          },
        });
        continue;
      }

      const toolStart = deps.now().getTime();
      const toolResult = await tool.run(parsed.data, deps.ctx);
      const toolDuration = deps.now().getTime() - toolStart;

      // Log terstruktur: nama tool, durasi, status ok/reason (tanpa isi pesan pengguna)
      console.log(
        JSON.stringify({
          event: "tool_call",
          tool: call.name,
          duration_ms: toolDuration,
          ok: toolResult.ok,
          reason: !toolResult.ok ? toolResult.reason : undefined,
        })
      );

      if (toolResult.ok && toolResult.card) {
        collectedCards.push(toolResult.card);
      }

      turns.push({
        role: "tool",
        name: call.name,
        response: toolResult,
      });
    }
  }

  // Jika setelah 6 putaran model masih memanggil tool, kembalikan pesan jujur
  return {
    text: "Batas pemrosesan telah tercapai. Silakan coba tanyakan kembali atau persempit pertanyaan Anda.",
    cards: collectedCards,
  };
}
