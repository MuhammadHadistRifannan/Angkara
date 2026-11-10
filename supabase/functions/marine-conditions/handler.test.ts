import { describe, it, expect, vi } from "vitest";
import { handleMarine, BadRequest } from "./handler";
import type { CacheDb, CacheEntry } from "../_shared/cache";
import type { MarineRequest } from "../_shared/contracts";
import fixtureCilacap from "../_shared/weather/fixtures/bmkg-33.01.21.1002.json";
import marineFixture from "../_shared/weather/fixtures/openmeteo-marine.json";

function createMockDb(initialEntries: Record<string, CacheEntry> = {}): CacheDb & {
  entries: Record<string, CacheEntry>;
  dailyCounts: Record<string, number>;
} {
  const entries = { ...initialEntries };
  const dailyCounts: Record<string, number> = {};

  return {
    entries,
    dailyCounts,
    async get<T>(key: string): Promise<CacheEntry<T> | null> {
      return (entries[key] as CacheEntry<T>) || null;
    },
    async set<T>(key: string, payload: T, fetched_at = new Date().toISOString()): Promise<void> {
      entries[key] = { key, payload, fetched_at };
    },
    async getDailyCount(dateStr: string, service: string): Promise<number> {
      return dailyCounts[`${dateStr}:${service}`] || 0;
    },
    async incrementDailyCount(dateStr: string, service: string): Promise<number> {
      const k = `${dateStr}:${service}`;
      dailyCounts[k] = (dailyCounts[k] || 0) + 1;
      return dailyCounts[k];
    },
  };
}

describe("marine-conditions handler", () => {
  const now = () => new Date("2026-11-09T08:00:00+07:00");

  it("point valid → series[0].pointId sama, fetched_at terisi, attribution memuat BMKG dan Open-Meteo", async () => {
    const db = createMockDb();
    const mockFetch = vi.fn(async (url: string) => {
      if (url.includes("api.bmkg.go.id")) {
        return new Response(JSON.stringify(fixtureCilacap), { status: 200 });
      }
      if (url.includes("marine-api.open-meteo.com")) {
        return new Response(JSON.stringify(marineFixture[0]), { status: 200 });
      }
      return new Response("Not Found", { status: 404 });
    });

    const req: MarineRequest = { kind: "point", pointId: "teluk-penyu" };
    const res = await handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now });

    expect(res.series[0].pointId).toBe("teluk-penyu");
    expect(res.fetched_at).toBeDefined();
    expect(res.stale).toBe(false);
    expect(res.attribution.some((a) => a.includes("BMKG"))).toBe(true);
    expect(res.attribution.some((a) => a.includes("Open-Meteo"))).toBe(true);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("pointId tak dikenal → melempar BadRequest", async () => {
    const db = createMockDb();
    const mockFetch = vi.fn();
    const req: MarineRequest = { kind: "point", pointId: "antah-berantah" };

    await expect(
      handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now })
    ).rejects.toThrow(BadRequest);
  });

  it("cache segar (< 30 menit) → fetch tidak dipanggil; cache 31 menit → fetch dipanggil dan cache ditulis", async () => {
    const db = createMockDb();
    const mockFetch = vi.fn(async (url: string) => {
      if (url.includes("api.bmkg.go.id")) {
        return new Response(JSON.stringify(fixtureCilacap), { status: 200 });
      }
      if (url.includes("marine-api.open-meteo.com")) {
        return new Response(JSON.stringify(marineFixture[0]), { status: 200 });
      }
      return new Response("Not Found", { status: 404 });
    });

    // 1. Set cache segar (10 menit lalu)
    const tenMinutesAgo = new Date(now().getTime() - 10 * 60 * 1000).toISOString();
    await db.set(
      "point:teluk-penyu",
      {
        source: "official",
        fetched_at: tenMinutesAgo,
        stale: false,
        series: [{ pointId: "teluk-penyu", samples: [], verdicts: [] }],
        attribution: ["BMKG", "Open-Meteo"],
      },
      tenMinutesAgo
    );

    const req: MarineRequest = { kind: "point", pointId: "teluk-penyu" };
    const resFresh = await handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(resFresh.stale).toBe(false);

    // 2. Set cache kadaluarsa (31 menit lalu)
    const thirtyOneMinutesAgo = new Date(now().getTime() - 31 * 60 * 1000).toISOString();
    await db.set(
      "point:teluk-penyu",
      {
        source: "official",
        fetched_at: thirtyOneMinutesAgo,
        stale: false,
        series: [{ pointId: "teluk-penyu", samples: [], verdicts: [] }],
        attribution: ["BMKG", "Open-Meteo"],
      },
      thirtyOneMinutesAgo
    );

    const resExpired = await handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now });
    expect(mockFetch).toHaveBeenCalled();
    expect(resExpired.stale).toBe(false);
  });

  it("sumber gagal + cache lama ada → respons stale: true dengan data cache", async () => {
    const db = createMockDb();
    const oneHourAgo = new Date(now().getTime() - 60 * 60 * 1000).toISOString();
    await db.set(
      "point:teluk-penyu",
      {
        source: "official",
        fetched_at: oneHourAgo,
        stale: false,
        series: [
          {
            pointId: "teluk-penyu",
            samples: [],
            verdicts: [{ date: "2026-11-09", level: "aman", reasons: [] }],
          },
        ],
        attribution: ["BMKG", "Open-Meteo"],
      },
      oneHourAgo
    );

    const mockFetch = vi.fn(async () => {
      throw new Error("Upstream timeout");
    });

    const req: MarineRequest = { kind: "point", pointId: "teluk-penyu" };
    const res = await handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now });

    expect(res.stale).toBe(true);
    expect(res.series[0].pointId).toBe("teluk-penyu");
  });

  it("sumber gagal + tanpa cache → source 'unavailable', series[0].verdicts tidak ada yang 'aman'", async () => {
    const db = createMockDb();
    const mockFetch = vi.fn(async () => {
      throw new Error("Koneksi gagal");
    });

    const req: MarineRequest = { kind: "point", pointId: "teluk-penyu" };
    const res = await handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now });

    expect(res.source).toBe("unavailable");
    expect(res.series[0].verdicts.every((v) => v.level !== "aman")).toBe(true);
  });

  it("user dengan lat 7.7312, lon 109.0123 → koordinat dibulatkan (7.7, 109.0) pada kunci cache dan pemanggilan fetch; gelombang null bila titik darat", async () => {
    const db = createMockDb();
    let calledMarineUrl = "";

    const mockFetch = vi.fn(async (url: string) => {
      if (url.includes("api.open-meteo.com/v1/forecast")) {
        return new Response(
          JSON.stringify({
            hourly: {
              time: ["2026-11-09T08:00"],
              wind_speed_10m: [10],
              precipitation: [0],
              weather_code: [1],
            },
          }),
          { status: 200 }
        );
      }
      if (url.includes("marine-api.open-meteo.com/v1/marine")) {
        calledMarineUrl = url;
        // Titik darat: wave_height adalah [null]
        return new Response(
          JSON.stringify({
            hourly: {
              time: ["2026-11-09T08:00"],
              wave_height: [null],
            },
          }),
          { status: 200 }
        );
      }
      return new Response("Not Found", { status: 404 });
    });

    // Perhatikan koordinat Indonesia: lat -7.7312, lon 109.0123
    const req: MarineRequest = { kind: "user", lat: -7.7312, lon: 109.0123 };
    const res = await handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now });

    // Koordinat dibulatkan ke 0.1
    expect(calledMarineUrl).toContain("latitude=-7.7");
    expect(calledMarineUrl).toContain("longitude=109");

    // Kunci cache harus memakai nilai bulatan
    expect(db.entries["user:-7.7:109"]).toBeDefined();

    // Gelombang pada titik darat harus null
    expect(res.series[0].samples[0].waveM).toBeNull();
  });

  it("user dengan lat 60, lon 10 (luar Indonesia) → melempar BadRequest ('di luar area layanan')", async () => {
    const db = createMockDb();
    const mockFetch = vi.fn();
    const req: MarineRequest = { kind: "user", lat: 60, lon: 10 };

    await expect(
      handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now })
    ).rejects.toThrow(BadRequest);
  });

  it("anggaran harian Open-Meteo habis → memakai cache terakhir bertanda stale; tidak memanggil fetch", async () => {
    const db = createMockDb();
    const dateStr = "2026-11-09";
    // Set daily count mencapai 8000
    db.dailyCounts[`${dateStr}:openmeteo`] = 8000;

    const twoHoursAgo = new Date(now().getTime() - 120 * 60 * 1000).toISOString();
    await db.set(
      "point:teluk-penyu",
      {
        source: "official",
        fetched_at: twoHoursAgo,
        stale: false,
        series: [{ pointId: "teluk-penyu", samples: [], verdicts: [] }],
        attribution: ["BMKG", "Open-Meteo"],
      },
      twoHoursAgo
    );

    const mockFetch = vi.fn();
    const req: MarineRequest = { kind: "point", pointId: "teluk-penyu" };
    const res = await handleMarine(req, { fetch: mockFetch as unknown as typeof fetch, db, now });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(res.stale).toBe(true);
  });

  it("deps.forceUnavailable = true → mengembalikan source: unavailable, tanpa memanggil fetch dan tanpa menulis cache", async () => {
    const db = createMockDb();
    const mockFetch = vi.fn();
    const setSpy = vi.spyOn(db, "set");

    const req: MarineRequest = { kind: "point", pointId: "teluk-penyu" };
    const res = await handleMarine(req, {
      fetch: mockFetch as unknown as typeof fetch,
      db,
      now,
      forceUnavailable: true,
    });

    expect(res.source).toBe("unavailable");
    expect(res.series[0].verdicts[0].level).toBe("waspada");
    expect(mockFetch).not.toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
    expect(db.entries["point:teluk-penyu"]).toBeUndefined();
  });
});
