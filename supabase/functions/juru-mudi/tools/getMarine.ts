import { z } from "zod";
import type { ToolDef, ToolResult, ToolCtx, MarineResponse, WeatherVerdictCard } from "../../_shared/contracts.ts";
import { getTodayWib, isPastWib } from "./dateUtils.ts";

export const getMarineSchema = z.object({
  pointId: z.string().min(1, "ID titik keberangkatan harus diisi"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional(),
});

export type GetMarineInput = z.infer<typeof getMarineSchema>;
export type GetMarineOutput = MarineResponse;

export const getMarineTool: ToolDef<GetMarineInput, GetMarineOutput> = {
  name: "get_marine_conditions",
  description: "Melihat kondisi cuaca maritim (tinggi gelombang, angin, hujan, petir, status keselamatan) untuk titik keberangkatan tertentu.",
  schema: getMarineSchema,
  async run(input: GetMarineInput, ctx: ToolCtx): Promise<ToolResult<GetMarineOutput>> {
    const parsed = getMarineSchema.safeParse(input);
    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message || "Format argumen tidak valid";
      return { ok: false, reason: `Argumen tidak valid: ${err}` };
    }

    if (parsed.data.date && isPastWib(parsed.data.date, ctx.now())) {
      return { ok: false, reason: "Tanggal tidak boleh di masa lampau (WIB)" };
    }

    try {
      const marineRes = await ctx.marine(parsed.data.pointId);
      const series = marineRes.series.find((s) => s.pointId === parsed.data.pointId) || marineRes.series[0];

      const targetDate = parsed.data.date || series?.verdicts?.[0]?.date || getTodayWib(ctx.now());
      const dayVerdict = series?.verdicts?.find((v) => v.date === targetDate);

      let level = dayVerdict ? dayVerdict.level : "aman";
      let reasons = dayVerdict ? [...dayVerdict.reasons] : [];

      if (marineRes.source === "unavailable") {
        if (level === "aman") {
          level = "waspada";
          reasons = reasons.length > 0 ? reasons : ["Data gelombang tidak tersedia"];
        }
      }

      // Hitung metrik dari sampel hari tersebut jika ada
      const dateSamples = (series?.samples || []).filter((s) => s.time.startsWith(targetDate));
      let waveHeightMax: number | null = null;
      let windSpeedMax = 0;
      let rainAccumulation = 0;
      let thunder = false;

      for (const sample of dateSamples) {
        if (sample.wave_height_m !== null && sample.wave_height_m !== undefined) {
          waveHeightMax = waveHeightMax === null ? sample.wave_height_m : Math.max(waveHeightMax, sample.wave_height_m);
        }
        if (sample.wind_speed_knots !== undefined) {
          windSpeedMax = Math.max(windSpeedMax, sample.wind_speed_knots);
        }
        if (sample.rain_mm !== undefined) {
          rainAccumulation += sample.rain_mm;
        }
        if (sample.thunder) {
          thunder = true;
        }
      }

      const card: WeatherVerdictCard = {
        type: "weather_verdict",
        pointId: parsed.data.pointId,
        date: targetDate,
        verdict: level,
        reasons,
        metrics: {
          waveHeightMax,
          windSpeedMax,
          rainAccumulation: Math.round(rainAccumulation * 10) / 10,
          thunder,
        },
        source: marineRes.source,
      };

      return {
        ok: true,
        data: marineRes,
        card,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `Gagal mendapatkan kondisi maritim: ${msg}` };
    }
  },
};
