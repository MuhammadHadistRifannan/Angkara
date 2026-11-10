import { UpstreamError } from "./bmkg.ts";
import type { HourSample } from "../safety/rules.ts";

function formatJakartaIsoTime(rawTime: string): string {
  if (rawTime.includes("+") || rawTime.endsWith("Z")) {
    return rawTime;
  }
  if (rawTime.length === 16) {
    return `${rawTime}:00+07:00`;
  }
  return `${rawTime}+07:00`;
}

interface RawMarineItem {
  hourly?: {
    time?: string[];
    wave_height?: Array<number | null>;
  };
}

interface RawForecastItem {
  hourly?: {
    time?: string[];
    wind_speed_10m?: number[];
    precipitation?: number[];
    weather_code?: number[];
  };
}

export async function fetchWaves(
  coords: { lat: number; lon: number }[],
  f: typeof fetch = fetch
): Promise<Array<{ time: string; waveM: number | null }[]>> {
  if (coords.length === 0) {
    return [];
  }

  const lats = coords.map((c) => c.lat).join(",");
  const lons = coords.map((c) => c.lon).join(",");
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}&hourly=wave_height&timezone=Asia%2FJakarta`;

  let res: Response;
  try {
    res = await f(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new UpstreamError(`Gagal menghubungi Open-Meteo Marine API: ${msg}`);
  }

  if (!res.ok) {
    throw new UpstreamError(
      `Open-Meteo Marine API merespons dengan status ${res.status}`,
      res.status
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new UpstreamError(`Gagal membaca respons JSON dari Open-Meteo Marine: ${msg}`);
  }

  const list: RawMarineItem[] = Array.isArray(json)
    ? (json as RawMarineItem[])
    : [json as RawMarineItem];

  return list.map((item) => {
    const times = item.hourly?.time ?? [];
    const waveHeights = item.hourly?.wave_height ?? [];

    return times.map((t, idx) => {
      const rawWave = waveHeights[idx];
      const waveM =
        rawWave !== null && rawWave !== undefined ? Number(rawWave) : null;

      return {
        time: formatJakartaIsoTime(t),
        waveM,
      };
    });
  });
}

export async function fetchOpenMeteoForecast(
  coords: { lat: number; lon: number }[],
  f: typeof fetch = fetch
): Promise<Array<Omit<HourSample, "waveM">[]>> {
  if (coords.length === 0) {
    return [];
  }

  const lats = coords.map((c) => c.lat).join(",");
  const lons = coords.map((c) => c.lon).join(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&hourly=wind_speed_10m,precipitation,weather_code&timezone=Asia%2FJakarta`;

  let res: Response;
  try {
    res = await f(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new UpstreamError(`Gagal menghubungi Open-Meteo Forecast API: ${msg}`);
  }

  if (!res.ok) {
    throw new UpstreamError(
      `Open-Meteo Forecast API merespons dengan status ${res.status}`,
      res.status
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new UpstreamError(`Gagal membaca respons JSON dari Open-Meteo Forecast: ${msg}`);
  }

  const list: RawForecastItem[] = Array.isArray(json)
    ? (json as RawForecastItem[])
    : [json as RawForecastItem];

  return list.map((item) => {
    const times = item.hourly?.time ?? [];
    const windSpeeds = item.hourly?.wind_speed_10m ?? [];
    const precipitations = item.hourly?.precipitation ?? [];
    const weatherCodes = item.hourly?.weather_code ?? [];

    return times.map((t, idx) => {
      const windSpeedKmH = Number(windSpeeds[idx] ?? 0);
      const windKn = Math.round((windSpeedKmH / 1.852) * 100) / 100;
      const rainMmH = Number(precipitations[idx] ?? 0);
      const code = Number(weatherCodes[idx] ?? 0);
      const thunder = code === 95 || code === 96 || code === 99;

      return {
        time: formatJakartaIsoTime(t),
        windKn,
        rainMmH,
        thunder,
      };
    });
  });
}
