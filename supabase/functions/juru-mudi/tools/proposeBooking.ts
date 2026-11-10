import { z } from "zod";
import type { ToolDef, ToolResult, ToolCtx, BookingDraftCard } from "../../_shared/contracts.ts";
import type { Level } from "../../_shared/safety/rules.ts";
import { findPointByBoatLocation } from "../../_shared/departurePoints.ts";
import { isPastWib } from "./dateUtils.ts";

export const proposeBookingSchema = z.object({
  boatId: z.string().uuid("ID kapal (boatId) harus berupa UUID yang valid"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
  passengers: z.number().int().positive("Jumlah penumpang harus lebih dari 0"),
});

export type ProposeBookingInput = z.infer<typeof proposeBookingSchema>;

export interface ProposeBookingOutput {
  boatId: string;
  boatName: string;
  boatType: "speedboat" | "kapal_kayu";
  date: string;
  time: string;
  passengers: number;
  basePrice: number;
  totalPrice: number;
  dpPrice: number;
  seatsLeft: number;
  verdict: Level;
  reasons: string[];
}

interface BoatRecord {
  id: string;
  name: string;
  type: string;
  capacity: number;
  base_price: number;
  location: string;
  description?: string | null;
  available: boolean;
}

export const proposeBookingTool: ToolDef<ProposeBookingInput, ProposeBookingOutput> = {
  name: "propose_booking",
  description: "Membuat draf pemesanan (booking draft) setelah memvalidasi ketersediaan kursi, menghitung ulang tarif, dan mengevaluasi status keselamatan cuaca maritim.",
  schema: proposeBookingSchema,
  async run(input: ProposeBookingInput, ctx: ToolCtx): Promise<ToolResult<ProposeBookingOutput>> {
    const parsed = proposeBookingSchema.safeParse(input);
    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message || "Format argumen tidak valid";
      return { ok: false, reason: `Argumen tidak valid: ${err}` };
    }

    if (isPastWib(parsed.data.date, ctx.now())) {
      return { ok: false, reason: "Tanggal pelayaran tidak boleh di masa lampau (WIB)" };
    }

    try {
      const fromBoats = ctx.supabase.from("boats") as unknown as {
        select: (cols: string) => {
          eq: (col: string, val: unknown) => {
            maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
          };
        };
      };

      const { data: boatData, error: boatErr } = await fromBoats
        .select("id, name, type, capacity, base_price, location, description, available")
        .eq("id", parsed.data.boatId)
        .maybeSingle();

      if (boatErr) {
        return { ok: false, reason: `Gagal mengambil data kapal: ${boatErr.message}` };
      }

      if (!boatData) {
        return { ok: false, reason: "Kapal dengan ID tersebut tidak ditemukan" };
      }

      const boat = boatData as BoatRecord;
      if (!boat.available) {
        return { ok: false, reason: "Kapal saat ini tidak tersedia untuk disewa" };
      }

      if (parsed.data.passengers > boat.capacity) {
        return {
          ok: false,
          reason: `Jumlah penumpang (${parsed.data.passengers}) melebihi kapasitas kapal (${boat.capacity})`,
        };
      }

      // Recompute seats_left deterministically from DB
      const { data: rpcData, error: rpcErr } = await ctx.supabase.rpc("seats_left", {
        p_boat_id: boat.id,
        p_date: parsed.data.date,
        p_time: parsed.data.time,
      });

      if (rpcErr) {
        return { ok: false, reason: `Gagal memeriksa sisa kursi: ${rpcErr.message}` };
      }

      const seatsLeft = typeof rpcData === "number" ? rpcData : Number(rpcData ?? 0);
      if (seatsLeft < parsed.data.passengers) {
        return {
          ok: false,
          reason: `Kursi tidak mencukupi untuk ${parsed.data.passengers} penumpang (sisa ${seatsLeft} kursi)`,
        };
      }

      // Recompute prices deterministically
      const basePrice = Number(boat.base_price);
      const totalPrice = basePrice * parsed.data.passengers;
      const dpPrice = Math.round(totalPrice * 0.3);

      // Recompute marine safety verdict
      const point = findPointByBoatLocation(boat.location);
      const pointId = point ? point.id : "teluk-penyu";

      const marineRes = await ctx.marine(pointId);
      const series = marineRes.series.find((s) => s.pointId === pointId) || marineRes.series[0];

      const dayVerdict = series?.verdicts?.find((v) => v.date === parsed.data.date);
      let verdictLevel: Level = dayVerdict ? dayVerdict.level : "aman";
      let verdictReasons: string[] = dayVerdict ? [...dayVerdict.reasons] : [];

      if (marineRes.source === "unavailable") {
        if (verdictLevel === "aman") {
          verdictLevel = "waspada";
          verdictReasons = verdictReasons.length > 0 ? verdictReasons : ["Data gelombang tidak tersedia"];
        }
      }

      const card: BookingDraftCard = {
        type: "booking_draft",
        boatId: boat.id,
        boatName: boat.name,
        boatType: boat.type as "speedboat" | "kapal_kayu",
        date: parsed.data.date,
        time: parsed.data.time,
        passengers: parsed.data.passengers,
        totalPrice,
        dpPrice,
        verdict: verdictLevel,
        reasons: verdictReasons,
        verdictReasons,
        source: marineRes.source,
        fetched_at: marineRes.fetched_at,
      };

      return {
        ok: true,
        data: {
          boatId: boat.id,
          boatName: boat.name,
          boatType: boat.type as "speedboat" | "kapal_kayu",
          date: parsed.data.date,
          time: parsed.data.time,
          passengers: parsed.data.passengers,
          basePrice,
          totalPrice,
          dpPrice,
          seatsLeft,
          verdict: verdictLevel,
          reasons: verdictReasons,
        },
        card,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `Terjadi kesalahan saat membuat draf pemesanan: ${msg}` };
    }
  },
};
