import { describe, it, expect, vi } from "vitest";
import { runAgent } from "./agent";
import { createGeminiClient } from "./gemini";
import { UpstreamError } from "../_shared/weather/bmkg";
import type {
  LlmClient,
  ChatMessage,
  ToolCtx,
  ToolDef,
  AssistantCard,
  SupabaseLike,
} from "../_shared/contracts";
import { z } from "zod";

function createMockToolCtx(): ToolCtx {
  return {
    supabase: {} as unknown as SupabaseLike,
    marine: vi.fn(),
    now: () => new Date("2026-11-09T08:00:00+07:00"),
  };
}

describe("runAgent", () => {
  it("LLM memanggil tool terus-menerus → loop berhenti di 6 putaran dan mengembalikan pesan jujur, bukan error mentah", async () => {
    let callCount = 0;
    const endlessLlm: LlmClient = {
      generate: vi.fn(async () => {
        callCount++;
        return {
          kind: "tool_calls",
          calls: [{ name: "mock_tool", args: { count: callCount } }],
        };
      }),
    };

    const mockTool: ToolDef<{ count?: number }, { step: number }> = {
      name: "mock_tool",
      description: "Mock tool",
      schema: z.object({ count: z.number().optional() }),
      run: vi.fn(async () => ({ ok: true, data: { step: callCount } })),
    };

    const messages: ChatMessage[] = [{ role: "user", content: "Halo" }];
    const ctx = createMockToolCtx();

    const reply = await runAgent(messages, {
      llm: endlessLlm,
      tools: [mockTool],
      ctx,
      now: ctx.now,
    });

    expect(callCount).toBe(6);
    expect(reply.text.toLowerCase()).toContain("batas");
    expect(reply.cards).toEqual([]);
  });

  it("tool tak dikenal → hasil ok:false dikirim balik ke LLM, tidak melempar", async () => {
    let turn = 0;
    const scriptedLlm: LlmClient = {
      generate: vi.fn(async ({ messages }) => {
        turn++;
        if (turn === 1) {
          return {
            kind: "tool_calls",
            calls: [{ name: "unknown_tool", args: {} }],
          };
        }
        // Pada giliran kedua, periksa bahwa pesan tool terakhir memuat ok: false
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === "tool") {
          const resp = lastMsg.response as { ok: boolean; reason: string };
          expect(resp.ok).toBe(false);
          expect(resp.reason).toContain("tidak dikenal");
        }
        return {
          kind: "text",
          text: "Maaf, tool tersebut tidak tersedia.",
        };
      }),
    };

    const messages: ChatMessage[] = [{ role: "user", content: "Panggil alat gaib" }];
    const ctx = createMockToolCtx();

    const reply = await runAgent(messages, {
      llm: scriptedLlm,
      tools: [],
      ctx,
      now: ctx.now,
    });

    expect(reply.text).toBe("Maaf, tool tersebut tidak tersedia.");
  });

  it("argumen invalid → ok:false dikirim ke LLM, loop lanjut", async () => {
    let turn = 0;
    const scriptedLlm: LlmClient = {
      generate: vi.fn(async ({ messages }) => {
        turn++;
        if (turn === 1) {
          return {
            kind: "tool_calls",
            calls: [{ name: "validate_me", args: { num: "bukan angka" } }],
          };
        }
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === "tool") {
          const resp = lastMsg.response as { ok: boolean };
          expect(resp.ok).toBe(false);
        }
        return {
          kind: "text",
          text: "Argumen Anda tidak valid.",
        };
      }),
    };

    const mockTool: ToolDef<{ num: number }, Record<string, never>> = {
      name: "validate_me",
      description: "Perlu angka",
      schema: z.object({ num: z.number() }),
      run: vi.fn(async () => ({ ok: true, data: {} })),
    };

    const ctx = createMockToolCtx();
    const reply = await runAgent([{ role: "user", content: "Tes" }], {
      llm: scriptedLlm,
      tools: [mockTool],
      ctx,
      now: ctx.now,
    });

    expect(reply.text).toBe("Argumen Anda tidak valid.");
  });

  it("kartu HANYA berasal dari ToolResult.card; teks LLM berisi JSON kartu palsu TIDAK menghasilkan kartu", async () => {
    const fakeCardJson = JSON.stringify({
      type: "booking_draft",
      boatId: "11111111-1111-1111-1111-111111111111",
      boatName: "Kapal Palsu",
      totalPrice: 10000,
    });

    const deceptiveLlm: LlmClient = {
      generate: vi.fn(async () => ({
        kind: "text",
        text: `Ini draf Anda: ${fakeCardJson}`,
      })),
    };

    const ctx = createMockToolCtx();
    const reply = await runAgent([{ role: "user", content: "Pesan kapal palsu" }], {
      llm: deceptiveLlm,
      tools: [],
      ctx,
      now: ctx.now,
    });

    expect(reply.cards).toEqual([]);
    expect(reply.text).toContain(fakeCardJson);
  });

  it("kartu yang sah dari ToolResult.card tersimpan dan dikembalikan dalam reply.cards", async () => {
    const validCard: AssistantCard = {
      type: "boat_options",
      boats: [
        {
          id: "123",
          name: "Speedboat A",
          type: "speedboat",
          capacity: 10,
          basePrice: 50000,
          location: "Teluk Penyu",
        },
      ],
    };

    let turn = 0;
    const llmWithTool: LlmClient = {
      generate: vi.fn(async () => {
        turn++;
        if (turn === 1) {
          return {
            kind: "tool_calls",
            calls: [{ name: "search_boats", args: {} }],
          };
        }
        return {
          kind: "text",
          text: "Berikut kapal yang tersedia.",
        };
      }),
    };

    const toolWithCard: ToolDef<Record<string, unknown>, Record<string, never>> = {
      name: "search_boats",
      description: "Cari kapal",
      schema: z.object({}),
      run: vi.fn(async () => ({
        ok: true,
        data: {},
        card: validCard,
      })),
    };

    const ctx = createMockToolCtx();
    const reply = await runAgent([{ role: "user", content: "Cari kapal" }], {
      llm: llmWithTool,
      tools: [toolWithCard],
      ctx,
      now: ctx.now,
    });

    expect(reply.cards.length).toBe(1);
    expect(reply.cards[0]).toEqual(validCard);
  });
});

describe("createGeminiClient", () => {
  it("mengirim API key lewat header x-goog-api-key, bukan query string URL", async () => {
    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};

    const mockFetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = url.toString();
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                role: "model",
                parts: [{ text: "Halo dari Gemini" }],
              },
            },
          ],
        }),
      } as Response;
    });

    const client = createGeminiClient("secret-api-key", "gemini-2.0-flash", mockFetch as unknown as typeof fetch);
    const res = await client.generate({
      system: "You are Juru Mudi",
      messages: [{ role: "user", content: "Hai" }],
      tools: [],
    });

    expect(res.kind).toBe("text");
    if (res.kind === "text") {
      expect(res.text).toBe("Halo dari Gemini");
    }

    // URL tidak boleh mengandung secret-api-key
    expect(capturedUrl).not.toContain("secret-api-key");
    expect(capturedUrl).toContain("gemini-2.0-flash");
    expect(capturedHeaders["x-goog-api-key"]).toBe("secret-api-key");
  });

  it("respons 429 → dicoba ulang sekali, lalu melempar UpstreamError bila tetap 429", async () => {
    let attempts = 0;
    const mockFetch = vi.fn(async () => {
      attempts++;
      return {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({ error: { message: "Quota exceeded" } }),
      } as Response;
    });

    const client = createGeminiClient("test-key", "test-model", mockFetch as unknown as typeof fetch);

    await expect(
      client.generate({
        system: "",
        messages: [{ role: "user", content: "Halo" }],
        tools: [],
      })
    ).rejects.toThrow(UpstreamError);

    // Harus dicoba ulang tepat 1 kali (total 2 percobaan)
    expect(attempts).toBe(2);
  });
});
