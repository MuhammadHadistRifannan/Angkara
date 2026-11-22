import type { SupabaseLike } from "../_shared/contracts.ts";

export interface AiApiKeyRecord {
  id: string;
  name: string;
  provider: string;
  api_key: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE" | "DEPLETED" | "ERROR";
  tokens_used: number;
  tokens_limit: number | null;
  error_msg: string | null;
  updated_at?: string;
  last_used_at?: string;
}

export interface SelectedAiKey {
  id?: string;
  name?: string;
  apiKey: string;
  isPoolKey: boolean;
}

// Jeda waktu pemulihan otomatis untuk key yang depleted / error (30 menit)
const COOLDOWN_RECOVERY_MS = 30 * 60 * 1000;

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
} | undefined;

/**
 * Mengambil API key Gemini aktif terbaik berdasarkan prioritas.
 * Melakukan auto-recovery untuk key yang masa cooldown-nya sudah habis,
 * dan menyediakan fallback ke GEMINI_API_KEY dari environment jika pool kosong.
 */
export async function getAvailableAiApiKey(
  supabase?: SupabaseLike | null,
  provider = "GOOGLE"
): Promise<SelectedAiKey | null> {
  if (supabase) {
    try {
      const now = Date.now();
      const cutoffIso = new Date(now - COOLDOWN_RECOVERY_MS).toISOString();

      // 1. Auto-recovery: Pulihkan key DEPLETED atau ERROR yang sudah melewati masa cooldown
      try {
        await supabase
          .from("ai_api_keys")
          .update({
            status: "ACTIVE",
            error_msg: null,
            updated_at: new Date(now).toISOString(),
          })
          .eq("provider", provider)
          .in("status", ["DEPLETED", "ERROR"])
          .lt("updated_at", cutoffIso);
      } catch {
        // Abaikan jika database belum termigrasi atau query update gagal
      }

      // 2. Ambil semua key dengan status ACTIVE diurutkan berdasarkan priority ASC
      const { data: keys, error } = await supabase
        .from("ai_api_keys")
        .select("id, name, provider, api_key, priority, status, tokens_used, tokens_limit, error_msg")
        .eq("provider", provider)
        .eq("status", "ACTIVE")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: true });

      if (!error && Array.isArray(keys) && keys.length > 0) {
        for (const rawKey of keys as unknown as AiApiKeyRecord[]) {
          const used = Number(rawKey.tokens_used || 0);
          const limit = rawKey.tokens_limit !== null ? Number(rawKey.tokens_limit) : null;

          // Cek apakah kuota token terlewati
          if (limit !== null && used >= limit) {
            await supabase
              .from("ai_api_keys")
              .update({
                status: "DEPLETED",
                error_msg: "Batas kuota token terlampaui",
                updated_at: new Date(now).toISOString(),
              })
              .eq("id", rawKey.id);
            continue;
          }

          if (rawKey.api_key && rawKey.api_key.trim().length > 0) {
            return {
              id: rawKey.id,
              name: rawKey.name,
              apiKey: rawKey.api_key.trim(),
              isPoolKey: true,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Gagal membaca ai_api_keys dari Supabase, beralih ke env fallback:", err);
    }
  }

  // 3. Fallback ke Environment Variable jika pool DB kosong atau tidak tersedia
  const envKey = typeof Deno !== "undefined" && Deno?.env ? Deno.env.get("GEMINI_API_KEY") : undefined;
  if (envKey && envKey.trim().length > 0) {
    return {
      name: "Environment Key",
      apiKey: envKey.trim(),
      isPoolKey: false,
    };
  }

  return null;
}

/**
 * Menandai key sebagai DEPLETED (misal saat respon HTTP 429 / Rate Limit / Quota Exceeded).
 */
export async function markAiApiKeyDepleted(
  supabase: SupabaseLike,
  keyId: string,
  errorMsg = "Batas kuota terlampaui (429)"
): Promise<void> {
  try {
    await supabase
      .from("ai_api_keys")
      .update({
        status: "DEPLETED",
        error_msg: errorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", keyId);
  } catch (err) {
    console.error(`Gagal menandai key ${keyId} sebagai DEPLETED:`, err);
  }
}

/**
 * Menandai key sebagai ERROR (misal saat API key invalid / HTTP 400/401/403).
 */
export async function markAiApiKeyError(
  supabase: SupabaseLike,
  keyId: string,
  errorMsg: string
): Promise<void> {
  try {
    await supabase
      .from("ai_api_keys")
      .update({
        status: "ERROR",
        error_msg: errorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", keyId);
  } catch (err) {
    console.error(`Gagal menandai key ${keyId} sebagai ERROR:`, err);
  }
}

/**
 * Mencatat pemakaian token pada key yang aktif.
 */
export async function recordAiApiKeyUsage(
  supabase: SupabaseLike,
  keyId: string,
  estimatedTokens = 500
): Promise<void> {
  try {
    const { data } = await supabase
      .from("ai_api_keys")
      .select("tokens_used")
      .eq("id", keyId)
      .single();

    const currentUsed = Number((data as { tokens_used?: number })?.tokens_used || 0);

    await supabase
      .from("ai_api_keys")
      .update({
        tokens_used: currentUsed + estimatedTokens,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", keyId);
  } catch (err) {
    console.warn(`Gagal mencatat token usage untuk key ${keyId}:`, err);
  }
}
