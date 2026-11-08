import { describe, it, expect, vi } from "vitest";
import { sendMessage, AssistantError, type AssistantClientDeps } from "./assistantClient";
import type { ChatMessage } from "../../../supabase/functions/_shared/contracts";

describe("assistantClient", () => {
  it("sendMessage: respons error 429 → AssistantError berpesan 'terlalu banyak'", async () => {
    const mockInvoke: AssistantClientDeps["invoke"] = vi.fn(async () => ({
      data: null,
      error: {
        message: "FunctionsHttpError: 429 Too Many Requests",
        context: { status: 429 },
      },
    }));

    const messages: ChatMessage[] = [{ role: "user", content: "Halo" }];

    await expect(sendMessage(messages, { invoke: mockInvoke })).rejects.toThrow(
      AssistantError
    );

    try {
      await sendMessage(messages, { invoke: mockInvoke });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AssistantError);
      if (err instanceof AssistantError) {
        expect(err.message.toLowerCase()).toContain("terlalu banyak");
      }
    }
  });

  it("tidak pernah mengirim header Authorization secara manual (memakai sesi Supabase bawaan)", async () => {
    let capturedOptions: { body?: unknown; headers?: Record<string, string> } | undefined;
    const mockInvoke: AssistantClientDeps["invoke"] = vi.fn(
      async (_fn: string, options?: { body?: unknown; headers?: Record<string, string> }) => {
        capturedOptions = options;
        return {
          data: { text: "Halo, ada yang bisa dibantu?", cards: [] },
          error: null,
        };
      }
    );

    const messages: ChatMessage[] = [{ role: "user", content: "Halo" }];
    await sendMessage(messages, { invoke: mockInvoke });

    expect(capturedOptions?.headers).toBeUndefined();
  });

  it("respons 502 / jaringan gagal → AssistantError berpesan bahasa Indonesia yang jelas", async () => {
    const mockInvoke: AssistantClientDeps["invoke"] = vi.fn(async () => ({
      data: null,
      error: {
        message: "FunctionsHttpError: 502 Bad Gateway",
        context: { status: 502 },
      },
    }));

    const messages: ChatMessage[] = [{ role: "user", content: "Halo" }];

    try {
      await sendMessage(messages, { invoke: mockInvoke });
      expect.fail("Harusnya melempar error");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AssistantError);
      if (err instanceof AssistantError) {
        expect(err.message).toContain("Asisten sedang tidak tersedia");
      }
    }
  });

  it("memotong riwayat menjadi 20 pesan terakhir jika pesan melebihi 20", async () => {
    let capturedBody: { messages?: ChatMessage[] } | undefined;
    const mockInvoke: AssistantClientDeps["invoke"] = vi.fn(
      async (_fn: string, options?: { body?: unknown; headers?: Record<string, string> }) => {
        capturedBody = options?.body as { messages?: ChatMessage[] };
        return {
          data: { text: "Jawaban", cards: [] },
          error: null,
        };
      }
    );

    const history: ChatMessage[] = Array.from({ length: 25 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `Pesan ${i}`,
    }));
    // Pastikan pesan terakhir adalah user
    history[24] = { role: "user", content: "Pesan 24" };

    await sendMessage(history, { invoke: mockInvoke });

    expect(capturedBody?.messages?.length).toBe(20);
    expect(capturedBody?.messages?.[0].content).toBe("Pesan 5");
    expect(capturedBody?.messages?.[19].content).toBe("Pesan 24");
  });
});
