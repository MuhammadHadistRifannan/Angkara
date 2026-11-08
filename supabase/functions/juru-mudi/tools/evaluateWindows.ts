import { z } from "zod";
import type { ToolDef, ToolResult, ToolCtx, SafestWindowCard } from "../../_shared/contracts";
import { rankDays, type DayWindow, type Level } from "../../_shared/safety/rules";

export const evaluateWindowsSchema = z.object({
  pointId: z.string().min(1, "ID titik keberangkatan harus diisi"),
  boatType: z.enum(["speedboat", "kapal_kayu"]).optional(),
});

export type EvaluateWindowsInput = z.infer<typeof evaluateWindowsSchema>;

export interface EvaluateWindowsOutput {
  pointId: string;
  days: Array<{
    date: string;
    level: Level;
    reasons: string[];
  }>;
}

export const evaluateWindowsTool: ToolDef<EvaluateWindowsInput, EvaluateWindowsOutput> = {
  name: "evaluate_departure_windows",
  description: "Mengevaluasi dan mengurutkan jendela hari keberangkatan teraman dalam 3 hari ke depan berdasarkan kondisi maritim.",
  schema: evaluateWindowsSchema,
  async run(input: EvaluateWindowsInput, ctx: ToolCtx): Promise<ToolResult<EvaluateWindowsOutput>> {
    const parsed = evaluateWindowsSchema.safeParse(input);
    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message || "Format argumen tidak valid";
      return { ok: false, reason: `Argumen tidak valid: ${err}` };
    }

    try {
      const marineRes = await ctx.marine(parsed.data.pointId);
      const series = marineRes.series.find((s) => s.pointId === parsed.data.pointId) || marineRes.series[0];

      const rawDays: DayWindow[] = (series?.verdicts || []).map((v) => {
        let level = v.level;
        let reasons = [...v.reasons];

        // Jika data sumber tidak lengkap / unavailable, tidak boleh ada status aman
        if (marineRes.source === "unavailable" && level === "aman") {
          level = "waspada";
          reasons = reasons.length > 0 ? reasons : ["Data gelombang tidak tersedia"];
        }

        return {
          date: v.date,
          level,
          worstHour: null,
          reasons,
        };
      });

      const ranked = rankDays(rawDays);

      const rankedDaysForCard = ranked.map((d) => {
        let recommendation = "";
        if (d.level === "aman") {
          recommendation = "Kondisi laut aman untuk berlayar.";
        } else if (d.level === "waspada") {
          recommendation = "Perlu kewaspadaan; pantau terus kondisi cuaca.";
        } else {
          recommendation = "Sebaiknya tunda keberangkatan demi keselamatan.";
        }

        return {
          date: d.date,
          level: d.level,
          recommendation,
        };
      });

      const card: SafestWindowCard = {
        type: "safest_window",
        pointId: parsed.data.pointId,
        rankedDays: rankedDaysForCard,
      };

      const days = ranked.map((d) => ({
        date: d.date,
        level: d.level,
        reasons: d.reasons,
      }));

      return {
        ok: true,
        data: {
          pointId: parsed.data.pointId,
          days,
        },
        card,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `Gagal mengevaluasi jendela keberangkatan: ${msg}` };
    }
  },
};
