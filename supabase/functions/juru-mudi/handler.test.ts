import { describe, it, expect, vi } from "vitest";
import { handleChat } from "./handler";
import { UpstreamError } from "../_shared/weather/bmkg";
import type { ChatDeps, LlmClient, ToolCtx, SupabaseLike } from "../_shared/contracts";

function createMockDeps(overrides?: Partial<ChatDeps>): ChatDeps {
  const llm: LlmClient = {
    generate: vi.fn(async () => ({ kind: "text", text: "Jawaban sukses" })),
  };

  const supabaseMock = {
    rpc: vi.fn(async (func: string) => {
      if (func === "hit_rate_limit") {
        return { data: true, error: null };
      }
      return { data: null, error: null };
    }),
  };

  const ctx: ToolCtx = {
    supabase: supabaseMock as unknown as SupabaseLike,
    marine: vi.fn(),
    now: () => new Date("2026-11-09T08:00:00+07:00"),
  };

  return {
    llm,
    tools: [],
    ctx,
    now: ctx.now,
    clientIp: "127.0.0.1",
    supabase: supabaseMock as unknown as SupabaseLike,
    ...overrides,
  };
}

describe("handleChat", () => {
  it("validasi: 21 pesan → status 400", async () => {
    const deps = createMockDeps();
    const messages = Array.from({ length: 21 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `Pesan ${i}`,
    }));
    // Pastikan pesan terakhir adalah user
    messages[20] = { role: "user", content: "Pesan 20" };

    const res = await handleChat({ messages }, deps);
    expect(res.status).toBe(400);
    expect("error" in res.body).toBe(true);
  });

  it("validasi: pesan 1.001 karakter → status 400", async () => {
    const deps = createMockDeps();
    const longMessage = "a".repeat(1001);
    const messages = [{ role: "user", content: longMessage }];

    const res = await handleChat({ messages }, deps);
    expect(res.status).toBe(400);
    expect("error" in res.body).toBe(true);
  });

  it("validasi: role selain user/assistant → status 400", async () => {
    const deps = createMockDeps();
    const messages = [{ role: "admin", content: "Halo" }];

    const res = await handleChat({ messages }, deps);
    expect(res.status).toBe(400);
    expect("error" in res.body).toBe(true);
  });

  it("validasi: pesan terakhir bukan user → status 400", async () => {
    const deps = createMockDeps();
    const messages = [
      { role: "user", content: "Halo" },
      { role: "assistant", content: "Halo juga" },
    ];

    const res = await handleChat({ messages }, deps);
    expect(res.status).toBe(400);
    expect("error" in res.body).toBe(true);
  });

  it("rate limit terlampaui → status 429 dengan pesan bahasa Indonesia", async () => {
    const rateLimitedSupabase = {
      rpc: vi.fn(async (func: string) => {
        if (func === "hit_rate_limit") {
          return { data: false, error: null }; // Ditolak rate limit
        }
        return { data: null, error: null };
      }),
    };

    const deps = createMockDeps({
      supabase: rateLimitedSupabase as unknown as SupabaseLike,
    });

    const messages = [{ role: "user", content: "Halo" }];
    const res = await handleChat({ messages }, deps);

    expect(res.status).toBe(429);
    expect("error" in res.body).toBe(true);
    if ("error" in res.body) {
      expect(res.body.error.toLowerCase()).toContain("terlalu banyak");
    }
  });

  it("Gemini gagal (UpstreamError) → status 502 dengan pesan 'Asisten sedang tidak tersedia', tanpa jawaban tebakan", async () => {
    const failingLlm: LlmClient = {
      generate: vi.fn(async () => {
        throw new UpstreamError("Gemini error 500");
      }),
    };

    const deps = createMockDeps({ llm: failingLlm });
    const messages = [{ role: "user", content: "Halo" }];
    const res = await handleChat({ messages }, deps);

    expect(res.status).toBe(502);
    expect("error" in res.body).toBe(true);
    if ("error" in res.body) {
      expect(res.body.error).toContain("Asisten sedang tidak tersedia");
    }
  });

  it("permintaan valid → status 200 dan mengembalikan AssistantReply", async () => {
    const deps = createMockDeps();
    const messages = [{ role: "user", content: "Halo Juru Mudi" }];

    const res = await handleChat({ messages }, deps);
    expect(res.status).toBe(200);
    expect("text" in res.body).toBe(true);
    if ("text" in res.body) {
      expect(res.body.text).toBe("Jawaban sukses");
      expect(res.body.cards).toEqual([]);
    }
  });
});
