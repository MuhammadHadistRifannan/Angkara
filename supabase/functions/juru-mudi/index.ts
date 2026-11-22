import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseCacheDb } from "../_shared/cache.ts";
import { handleMarine } from "../marine-conditions/handler.ts";
import { isEvalForceUnavailable } from "../_shared/evalMode.ts";
import type { MarineResponse, SupabaseLike } from "../_shared/contracts.ts";
import { TOOLS } from "./tools/index.ts";
import { createGeminiClient } from "./gemini.ts";
import { handleChat } from "./handler.ts";
import {
  getAvailableAiApiKey,
  markAiApiKeyDepleted,
  markAiApiKeyError,
  recordAiApiKeyUsage,
} from "./aiApiKeyManager.ts";
import { UpstreamError } from "../_shared/weather/bmkg.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

if (typeof Deno !== "undefined" && Deno.serve) {
  Deno.serve(async (req: Request) => {
    // Tangani preflight CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const supabaseLike = supabase as unknown as SupabaseLike;

      let keyInfo = await getAvailableAiApiKey(supabaseLike);
      if (!keyInfo) {
        return new Response(
          JSON.stringify({
            error:
              "Konfigurasi server tidak lengkap: Kunci API Gemini tidak ditemukan di database maupun environment.",
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("cf-connecting-ip") ||
        "anon";

      let body: unknown = {};
      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: "Format body bukan JSON yang valid" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const evalMode = Deno.env.get("EVAL_MODE");
      const forceUnavailable = isEvalForceUnavailable(
        evalMode,
        req.headers.get("x-eval-force-unavailable")
      );

      const cacheDb = createSupabaseCacheDb(supabase);
      const marine = async (pointId: string): Promise<MarineResponse> => {
        return await handleMarine(
          { kind: "point", pointId },
          { db: cacheDb, fetch, now: () => new Date(), forceUnavailable }
        );
      };

      const ctx = {
        supabase: supabaseLike,
        marine,
        now: () => new Date(),
      };

      // Failover Loop: jika key aktif terkena 429 atau 401, rotasi otomatis ke key berikutnya (maksimal 3 percobaan)
      let lastResult: { body: unknown; status: number } | null = null;
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        if (!keyInfo) {
          break;
        }

        const llm = createGeminiClient(keyInfo.apiKey, model, fetch);

        try {
          const result = await handleChat(body, {
            llm,
            tools: TOOLS,
            ctx,
            now: () => new Date(),
            clientIp,
            supabase: supabaseLike,
          });

          lastResult = result;

          // Catat pemakaian token jika sukses dan menggunakan key dari pool database
          if (keyInfo.id && keyInfo.isPoolKey) {
            await recordAiApiKeyUsage(supabaseLike, keyInfo.id, 500);
          }
          break;
        } catch (err: unknown) {
          lastError = err;
          if (err instanceof UpstreamError && keyInfo.id && keyInfo.isPoolKey) {
            if (err.status === 429) {
              await markAiApiKeyDepleted(supabaseLike, keyInfo.id, err.message);
              // Ambil key cadangan berikutnya
              keyInfo = await getAvailableAiApiKey(supabaseLike);
              continue;
            }
            if (err.status === 400 || err.status === 401 || err.status === 403) {
              await markAiApiKeyError(supabaseLike, keyInfo.id, err.message);
              // Ambil key cadangan berikutnya
              keyInfo = await getAvailableAiApiKey(supabaseLike);
              continue;
            }
          }
          // Error selain rate limit/auth dilempar langsung
          throw err;
        }
      }

      if (lastResult) {
        return new Response(JSON.stringify(lastResult.body), {
          status: lastResult.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      throw lastError || new Error("Gagal memproses pesan dengan semua kunci API yang tersedia.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(
        JSON.stringify({ error: `Terjadi kesalahan tak terduga: ${msg}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  });
}
