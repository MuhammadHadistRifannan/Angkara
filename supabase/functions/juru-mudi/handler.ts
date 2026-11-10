import { z } from "zod";
import type { ChatDeps, AssistantReply } from "../_shared/contracts.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { UpstreamError } from "../_shared/weather/bmkg.ts";
import { runAgent } from "./agent.ts";

const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z
            .string()
            .min(1, "Pesan tidak boleh kosong")
            .max(1000, "Pesan maksimal 1.000 karakter"),
        })
      )
      .min(1, "Minimal harus ada 1 pesan")
      .max(20, "Maksimal riwayat percakapan adalah 20 pesan"),
  })
  .refine((data) => data.messages[data.messages.length - 1]?.role === "user", {
    message: "Pesan terakhir harus dari user",
    path: ["messages"],
  });

export async function handleChat(
  body: unknown,
  deps: ChatDeps
): Promise<{ status: number; body: AssistantReply | { error: string } }> {
  // 1. Validasi skema permintaan
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const err = parsed.error.issues[0]?.message || "Format permintaan tidak valid";
    return {
      status: 400,
      body: { error: `Format permintaan tidak valid: ${err}` },
    };
  }

  // 2. Pemeriksaan batas frekuensi (rate limit: 8/menit dan 60/jam per IP)
  if (deps.clientIp && deps.supabase) {
    try {
      const rl = await checkRateLimit(
        deps.supabase,
        deps.clientIp,
        "juru-mudi",
        { minuteLimit: 8, hourLimit: 60 }
      );

      if (!rl.allowed) {
        return {
          status: 429,
          body: { error: "Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi." },
        };
      }
    } catch (err: unknown) {
      console.error("Rate limit check error:", err);
    }
  }

  // 3. Jalankan agent loop
  try {
    const reply = await runAgent(parsed.data.messages, {
      llm: deps.llm,
      tools: deps.tools,
      ctx: deps.ctx,
      now: deps.now,
    });

    return {
      status: 200,
      body: reply,
    };
  } catch (err: unknown) {
    if (err instanceof UpstreamError) {
      return {
        status: 502,
        body: { error: "Asisten sedang tidak tersedia. Silakan coba beberapa saat lagi." },
      };
    }

    const msg = err instanceof Error ? err.message : String(err);
    console.error("Unhandled error in agent:", msg);

    return {
      status: 500,
      body: { error: "Terjadi kesalahan internal pada server." },
    };
  }
}
