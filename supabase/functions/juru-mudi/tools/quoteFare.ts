import { z } from "zod";
import type { ToolDef, ToolResult, ToolCtx } from "../../_shared/contracts.ts";

export const quoteFareSchema = z.object({
  boatId: z.string().uuid("ID kapal (boatId) harus berupa UUID yang valid"),
  passengers: z.number().int().positive("Jumlah penumpang harus lebih dari 0"),
});

export type QuoteFareInput = z.infer<typeof quoteFareSchema>;

export interface QuoteFareOutput {
  boatId: string;
  boatName: string;
  passengers: number;
  basePrice: number;
  totalPrice: number;
  dpPrice: number;
}

interface BoatRecord {
  id: string;
  name: string;
  capacity: number;
  base_price: number;
  available: boolean;
}

export const quoteFareTool: ToolDef<QuoteFareInput, QuoteFareOutput> = {
  name: "quote_fare",
  description: "Menghitung estimasi total tarif sewa kapal dan uang muka (DP 30%) berdasarkan jumlah penumpang.",
  schema: quoteFareSchema,
  async run(input: QuoteFareInput, ctx: ToolCtx): Promise<ToolResult<QuoteFareOutput>> {
    const parsed = quoteFareSchema.safeParse(input);
    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message || "Format argumen tidak valid";
      return { ok: false, reason: `Argumen tidak valid: ${err}` };
    }

    try {
      const fromBoats = ctx.supabase.from("boats") as unknown as {
        select: (cols: string) => {
          eq: (col: string, val: unknown) => {
            maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
          };
        };
      };

      const { data, error } = await fromBoats
        .select("id, name, capacity, base_price, available")
        .eq("id", parsed.data.boatId)
        .maybeSingle();

      if (error) {
        return { ok: false, reason: `Gagal mengambil data kapal: ${error.message}` };
      }

      if (!data) {
        return { ok: false, reason: "Kapal dengan ID tersebut tidak ditemukan" };
      }

      const boat = data as BoatRecord;
      if (parsed.data.passengers > boat.capacity) {
        return {
          ok: false,
          reason: `Jumlah penumpang (${parsed.data.passengers}) melebihi kapasitas kapal (${boat.capacity})`,
        };
      }

      const basePrice = Number(boat.base_price);
      const totalPrice = basePrice * parsed.data.passengers;
      const dpPrice = Math.round(totalPrice * 0.3);

      return {
        ok: true,
        data: {
          boatId: boat.id,
          boatName: boat.name,
          passengers: parsed.data.passengers,
          basePrice,
          totalPrice,
          dpPrice,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `Terjadi kesalahan saat menghitung tarif: ${msg}` };
    }
  },
};
