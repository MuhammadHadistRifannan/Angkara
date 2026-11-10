import { z } from "zod";
import type { ToolDef, ToolResult, ToolCtx, BoatOptionsCard } from "../../_shared/contracts.ts";

export const searchBoatsSchema = z.object({
  passengers: z.number().int().positive().optional(),
  boatType: z.enum(["speedboat", "kapal_kayu"]).optional(),
  location: z.string().optional(),
});

export type SearchBoatsInput = z.infer<typeof searchBoatsSchema>;

export interface SearchBoatsOutput {
  boats: Array<{
    id: string;
    name: string;
    type: "speedboat" | "kapal_kayu";
    capacity: number;
    basePrice: number;
    location: string;
    description?: string;
    imageUrl?: string;
  }>;
}

interface BoatRecord {
  id: string;
  name: string;
  type: string;
  capacity: number;
  base_price: number;
  location: string;
  description?: string | null;
  image_url?: string | null;
  available: boolean;
}

export const searchBoatsTool: ToolDef<SearchBoatsInput, SearchBoatsOutput> = {
  name: "search_boats",
  description: "Mencari daftar kapal wisata yang tersedia berdasarkan kapasitas penumpang, jenis kapal, dan lokasi keberangkatan.",
  schema: searchBoatsSchema,
  async run(input: SearchBoatsInput, ctx: ToolCtx): Promise<ToolResult<SearchBoatsOutput>> {
    const parsed = searchBoatsSchema.safeParse(input);
    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message || "Format argumen tidak valid";
      return { ok: false, reason: `Argumen pencarian kapal tidak valid: ${err}` };
    }

    try {
      const fromBoats = ctx.supabase.from("boats") as unknown as {
        select: (cols: string) => {
          eq: (col: string, val: unknown) => unknown;
        };
      };

      let query = fromBoats
        .select("id, name, type, capacity, base_price, location, description, image_url, available")
        .eq("available", true) as Record<string, unknown>;

      if (parsed.data.passengers !== undefined && typeof query.gte === "function") {
        query = query.gte("capacity", parsed.data.passengers) as Record<string, unknown>;
      }
      if (parsed.data.boatType !== undefined && typeof query.eq === "function") {
        query = query.eq("type", parsed.data.boatType) as Record<string, unknown>;
      }
      if (parsed.data.location !== undefined && typeof query.eq === "function") {
        query = query.eq("location", parsed.data.location) as Record<string, unknown>;
      }

      if (typeof query.order === "function") {
        query = query.order("base_price", { ascending: true }) as Record<string, unknown>;
      }

      const res = (await query) as { data: unknown; error: { message: string } | null };
      if (res?.error) {
        return { ok: false, reason: `Gagal mencari kapal di database: ${res.error.message}` };
      }

      const rawBoats = Array.isArray(res?.data) ? (res.data as BoatRecord[]) : [];
      const boats = rawBoats.map((b) => ({
        id: String(b.id),
        name: String(b.name),
        type: b.type as "speedboat" | "kapal_kayu",
        capacity: Number(b.capacity),
        basePrice: Number(b.base_price),
        location: String(b.location),
        description: b.description ? String(b.description) : undefined,
        imageUrl: b.image_url ? String(b.image_url) : undefined,
      }));

      const card: BoatOptionsCard = {
        type: "boat_options",
        boats,
      };

      return {
        ok: true,
        data: { boats },
        card,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `Terjadi kesalahan saat mencari kapal: ${msg}` };
    }
  },
};
