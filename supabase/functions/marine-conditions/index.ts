import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors";
import { checkRateLimit } from "../_shared/rateLimit";
import { createSupabaseCacheDb } from "../_shared/cache";
import { handleMarine, BadRequest } from "./handler";
import { UpstreamError } from "../_shared/weather/bmkg";
import { isEvalForceUnavailable } from "../_shared/evalMode";
import type { MarineRequest } from "../_shared/contracts";

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
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Rate limit per IP
      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("cf-connecting-ip") ||
        "anon";

      const rateLimitResult = await checkRateLimit(supabase, clientIp, "marine-conditions");
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({
            error: "Batas permintaan terlampaui. Silakan coba beberapa saat lagi.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      let payload: MarineRequest;
      if (req.method === "GET") {
        const url = new URL(req.url);
        const pointId = url.searchParams.get("pointId");
        const lat = url.searchParams.get("lat");
        const lon = url.searchParams.get("lon");

        if (pointId) {
          payload = { kind: "point", pointId };
        } else if (lat && lon) {
          payload = { kind: "user", lat: parseFloat(lat), lon: parseFloat(lon) };
        } else {
          throw new BadRequest("Parameter 'pointId' atau 'lat' dan 'lon' harus disediakan");
        }
      } else {
        payload = await req.json();
      }

      const db = createSupabaseCacheDb(supabase);
      const evalMode = Deno.env.get("EVAL_MODE");
      const forceUnavailable = isEvalForceUnavailable(
        evalMode,
        req.headers.get("x-eval-force-unavailable")
      );

      const result = await handleMarine(payload, {
        fetch,
        db,
        now: () => new Date(),
        forceUnavailable,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      if (err instanceof BadRequest) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (err instanceof UpstreamError) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan internal server";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  });
}
