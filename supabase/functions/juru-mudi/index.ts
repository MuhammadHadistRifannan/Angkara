import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseCacheDb } from "../_shared/cache.ts";
import { handleMarine } from "../marine-conditions/handler.ts";
import { isEvalForceUnavailable } from "../_shared/evalMode.ts";
import type { MarineResponse, SupabaseLike } from "../_shared/contracts.ts";
import { TOOLS } from "./tools/index.ts";
import { createGeminiClient } from "./gemini.ts";
import { handleChat } from "./handler.ts";

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
      const apiKey = Deno.env.get("GEMINI_API_KEY");
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Konfigurasi server tidak lengkap: GEMINI_API_KEY belum disetel" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.0-flash";
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        supabase: supabase as unknown as SupabaseLike,
        marine,
        now: () => new Date(),
      };

      const llm = createGeminiClient(apiKey, model, fetch);

      const result = await handleChat(body, {
        llm,
        tools: TOOLS,
        ctx,
        now: () => new Date(),
        clientIp,
        supabase: supabase as unknown as SupabaseLike,
      });

      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(
        JSON.stringify({ error: `Terjadi kesalahan tak terduga: ${msg}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  });
}
