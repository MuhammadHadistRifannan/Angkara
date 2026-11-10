import { z } from "zod";
import type { ToolDef, ToolResult, ToolCtx } from "../../_shared/contracts.ts";
import { isPastWib } from "./dateUtils.ts";

export const checkAvailabilitySchema = z.object({
  boatId: z.string().uuid("ID kapal (boatId) harus berupa UUID yang valid"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
});

export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;

export interface CheckAvailabilityOutput {
  boatId: string;
  date: string;
  time: string;
  seatsLeft: number;
}

export const checkAvailabilityTool: ToolDef<CheckAvailabilityInput, CheckAvailabilityOutput> = {
  name: "check_availability",
  description: "Memeriksa sisa kapasitas kursi kapal yang tersedia untuk tanggal dan jam keberangkatan tertentu.",
  schema: checkAvailabilitySchema,
  async run(input: CheckAvailabilityInput, ctx: ToolCtx): Promise<ToolResult<CheckAvailabilityOutput>> {
    const parsed = checkAvailabilitySchema.safeParse(input);
    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message || "Format argumen tidak valid";
      return { ok: false, reason: `Argumen tidak valid: ${err}` };
    }

    if (isPastWib(parsed.data.date, ctx.now())) {
      return { ok: false, reason: "Tanggal pelayaran tidak boleh di masa lampau (WIB)" };
    }

    try {
      const { data, error } = await ctx.supabase.rpc("seats_left", {
        p_boat_id: parsed.data.boatId,
        p_date: parsed.data.date,
        p_time: parsed.data.time,
      });

      if (error) {
        return { ok: false, reason: `Gagal memeriksa sisa kursi: ${error.message}` };
      }

      const seatsLeft = typeof data === "number" ? data : Number(data ?? 0);
      return {
        ok: true,
        data: {
          boatId: parsed.data.boatId,
          date: parsed.data.date,
          time: parsed.data.time,
          seatsLeft,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `Terjadi kesalahan saat memeriksa ketersediaan kursi: ${msg}` };
    }
  },
};
