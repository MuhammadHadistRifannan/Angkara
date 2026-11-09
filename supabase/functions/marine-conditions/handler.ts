import type {
  MarineRequest,
  MarineResponse,
  MarineDeps,
  MarineSource,
} from "../_shared/contracts";
import { DEPARTURE_POINTS } from "../_shared/departurePoints";
import { fetchBmkg } from "../_shared/weather/bmkg";
import { fetchWaves, fetchOpenMeteoForecast } from "../_shared/weather/openmeteo";
import { mergeSamples } from "../_shared/weather/merge";
import { evaluateDay } from "../_shared/safety/rules";
import thresholdsData from "../_shared/safety/thresholds.json";

export class BadRequest extends Error {
  readonly status = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequest";
  }
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 menit
const OPENMETEO_DAILY_BUDGET = 8000;

export async function handleMarine(
  req: MarineRequest,
  deps: MarineDeps
): Promise<MarineResponse> {
  const now = deps.now();
  const todayStr = now.toISOString().substring(0, 10);

  // 1. Validasi permintaan dan pembentukan kunci cache
  let cacheKey: string;
  let pointId: string;
  let isUserLocation = false;
  let userLat = 0;
  let userLon = 0;

  if (req.kind === "point") {
    const point = DEPARTURE_POINTS.find((p) => p.id === req.pointId);
    if (!point) {
      throw new BadRequest(`Titik keberangkatan '${req.pointId}' tidak ditemukan`);
    }
    pointId = point.id;
    cacheKey = `point:${pointId}`;
  } else if (req.kind === "user") {
    // Validasi area layanan Indonesia:
    // Lintang: -12.0 s/d 8.0, Bujur: 94.0 s/d 142.0
    if (
      typeof req.lat !== "number" ||
      typeof req.lon !== "number" ||
      req.lat < -12 ||
      req.lat > 8 ||
      req.lon < 94 ||
      req.lon > 142
    ) {
      throw new BadRequest("Koordinat di luar area layanan Indonesia");
    }

    // Pembulatan ke 0.1 derajat untuk privasi dan efisiensi cache
    userLat = Math.round(req.lat * 10) / 10;
    userLon = Math.round(req.lon * 10) / 10;
    pointId = `user:${userLat}:${userLon}`;
    cacheKey = pointId;
    isUserLocation = true;
  } else {
    throw new BadRequest("Tipe permintaan tidak valid");
  }

  // 2. Cek cache yang sudah ada
  const cached = await deps.db.get<MarineResponse>(cacheKey);
  if (cached) {
    const cacheAgeMs = now.getTime() - new Date(cached.fetched_at).getTime();
    if (cacheAgeMs < CACHE_TTL_MS) {
      return {
        ...cached.payload,
        stale: false,
      };
    }
  }

  // 3. Cek anggaran harian Open-Meteo (8.000 panggilan/hari)
  const openMeteoCallsToday = deps.db.getDailyCount
    ? await deps.db.getDailyCount(todayStr, "openmeteo")
    : 0;

  if (openMeteoCallsToday >= OPENMETEO_DAILY_BUDGET) {
    if (cached) {
      return {
        ...cached.payload,
        stale: true,
      };
    }
    // Jika tidak ada cache dan kuota habis
    return {
      source: "unavailable",
      fetched_at: now.toISOString(),
      stale: false,
      series: [
        {
          pointId,
          samples: [],
          verdicts: [
            {
              date: todayStr,
              level: "waspada",
              reasons: ["Anggaran kuota prakiraan cuaca model harian telah tercapai"],
            },
          ],
        },
      ],
      attribution: [
        "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)",
        "Open-Meteo Marine API (CC BY 4.0)",
      ],
    };
  }

  // 4. Pengambilan data dari upstream
  try {
    let source: MarineSource;
    let samples: ReturnType<typeof mergeSamples>["samples"];
    const attribution: string[] = [];

    if (!isUserLocation) {
      const point = DEPARTURE_POINTS.find((p) => p.id === req.pointId)!;

      const [bmkgHours, waves] = await Promise.all([
        fetchBmkg(point.adm4, deps.fetch),
        fetchWaves([{ lat: point.lat, lon: point.lon }], deps.fetch).then(
          (res) => res[0] || []
        ),
      ]);

      if (deps.db.incrementDailyCount) {
        await deps.db.incrementDailyCount(todayStr, "openmeteo");
      }

      const merged = mergeSamples(bmkgHours, waves);
      source = merged.source;
      samples = merged.samples;
      attribution.push(
        "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)",
        "Open-Meteo Marine API (CC BY 4.0)"
      );
    } else {
      const [forecasts, waves] = await Promise.all([
        fetchOpenMeteoForecast(
          [{ lat: userLat, lon: userLon }],
          deps.fetch
        ).then((res) => res[0] || []),
        fetchWaves([{ lat: userLat, lon: userLon }], deps.fetch).then(
          (res) => res[0] || []
        ),
      ]);

      if (deps.db.incrementDailyCount) {
        await deps.db.incrementDailyCount(todayStr, "openmeteo");
        await deps.db.incrementDailyCount(todayStr, "openmeteo");
      }

      const merged = mergeSamples(null, waves, forecasts);
      source = merged.source;
      samples = merged.samples;
      attribution.push(
        "Open-Meteo Forecast & Marine API (CC BY 4.0)",
        "OpenStreetMap"
      );
    }

    // Evaluasi ringkasan keselamatan harian (jam 07.00–15.00 WIB)
    const dates = Array.from(
      new Set(samples.map((s) => s.time.substring(0, 10)))
    );
    const verdicts = dates.map((date) => {
      const day = evaluateDay(date, samples, "speedboat");
      return {
        date: day.date,
        level: day.level,
        reasons: day.reasons,
      };
    });

    const response: MarineResponse = {
      source,
      fetched_at: now.toISOString(),
      stale: false,
      series: [
        {
          pointId,
          samples,
          verdicts,
        },
      ],
      attribution,
      thresholds: {
        maxWaveM: thresholdsData.boats.speedboat.maxWaveM,
        maxWindKn: thresholdsData.boats.speedboat.maxWindKn,
        waspadaMmH: thresholdsData.rain.waspadaMmH,
        tundaMmH: thresholdsData.rain.tundaMmH,
      },
    };

    // Simpan ke cache
    await deps.db.set(cacheKey, response, response.fetched_at);
    return response;
  } catch (err: unknown) {
    // 5. Penanganan kegagalan sumber upstream
    if (cached) {
      return {
        ...cached.payload,
        stale: true,
      };
    }

    const defaultAttribution = isUserLocation
      ? ["Open-Meteo Forecast & Marine API (CC BY 4.0)"]
      : [
          "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)",
          "Open-Meteo Marine API (CC BY 4.0)",
        ];

    return {
      source: "unavailable",
      fetched_at: now.toISOString(),
      stale: false,
      series: [
        {
          pointId,
          samples: [],
          verdicts: [
            {
              date: todayStr,
              level: "waspada",
              reasons: [
                "Data prakiraan cuaca tidak dapat diakses dari sumber resmi maupun model",
              ],
            },
          ],
        },
      ],
      attribution: defaultAttribution,
      thresholds: {
        maxWaveM: thresholdsData.boats.speedboat.maxWaveM,
        maxWindKn: thresholdsData.boats.speedboat.maxWindKn,
        waspadaMmH: thresholdsData.rain.waspadaMmH,
        tundaMmH: thresholdsData.rain.tundaMmH,
      },
    };
  }
}
