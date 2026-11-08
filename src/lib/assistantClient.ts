import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage, AssistantReply } from "../../supabase/functions/_shared/contracts";

export class AssistantError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "AssistantError";
  }
}

export interface AssistantClientDeps {
  invoke?: (
    functionName: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
    }
  ) => Promise<{
    data: unknown;
    error: {
      message?: string;
      context?: {
        status?: number;
      };
      status?: number;
    } | null;
  }>;
}

export async function sendMessage(
  history: ChatMessage[],
  deps: AssistantClientDeps = {}
): Promise<AssistantReply> {
  const invoke = deps.invoke || ((fn, opts) => supabase.functions.invoke(fn, opts));

  // Ambil hanya 20 pesan terakhir sebagai riwayat percakapan
  const trimmedHistory = history.slice(-20);

  try {
    const { data, error } = await invoke("juru-mudi", {
      body: { messages: trimmedHistory },
    });

    if (error) {
      const errorMsg = error.message || "";
      const status = error.context?.status || error.status;

      if (
        status === 429 ||
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("terlalu banyak")
      ) {
        throw new AssistantError(
          "Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi.",
          429
        );
      }

      if (
        status === 502 ||
        errorMsg.includes("502") ||
        errorMsg.toLowerCase().includes("tidak tersedia")
      ) {
        throw new AssistantError(
          "Asisten sedang tidak tersedia. Silakan coba beberapa saat lagi.",
          502
        );
      }

      throw new AssistantError(errorMsg || "Gagal menghubungi asisten Juru Mudi.");
    }

    if (!data || typeof data !== "object") {
      throw new AssistantError("Format balasan asisten tidak valid.");
    }

    const replyData = data as Partial<AssistantReply>;
    if (typeof replyData.text !== "string") {
      throw new AssistantError("Format balasan asisten tidak valid: teks tidak ditemukan.");
    }

    return {
      text: replyData.text,
      cards: Array.isArray(replyData.cards) ? replyData.cards : [],
    };
  } catch (err: unknown) {
    if (err instanceof AssistantError) {
      throw err;
    }

    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") || msg.toLowerCase().includes("terlalu banyak")) {
      throw new AssistantError(
        "Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi.",
        429
      );
    }

    if (msg.includes("502") || msg.toLowerCase().includes("tidak tersedia")) {
      throw new AssistantError(
        "Asisten sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        502
      );
    }

    throw new AssistantError(msg || "Gagal menghubungi asisten Juru Mudi.");
  }
}
