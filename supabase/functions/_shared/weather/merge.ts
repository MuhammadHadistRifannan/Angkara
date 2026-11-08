import type { HourSample } from "../safety/rules";
import type { BmkgHour } from "./bmkg";

export interface MergeResult {
  samples: HourSample[];
  source: "official" | "model" | "unavailable";
}

function findMatchingWave(
  targetTime: string,
  waves: { time: string; waveM: number | null }[] | null | undefined
): number | null {
  if (!waves || waves.length === 0) {
    return null;
  }

  const exact = waves.find((w) => w.time === targetTime);
  if (exact !== undefined) {
    return exact.waveM;
  }

  const targetTimestamp = new Date(targetTime).getTime();
  const matched = waves.find(
    (w) => new Date(w.time).getTime() === targetTimestamp
  );
  return matched !== undefined ? matched.waveM : null;
}

export function mergeSamples(
  bmkg: BmkgHour[] | null | undefined,
  waves: { time: string; waveM: number | null }[] | null | undefined,
  fallbackWind?: Omit<HourSample, "waveM">[] | null | undefined
): MergeResult {
  if (bmkg && bmkg.length > 0) {
    const samples: HourSample[] = bmkg.map((b) => ({
      time: b.time,
      waveM: findMatchingWave(b.time, waves),
      windKn: b.windKn,
      rainMmH: b.rainMmH,
      thunder: b.thunder,
    }));

    return {
      samples,
      source: "official",
    };
  }

  if (fallbackWind && fallbackWind.length > 0) {
    const samples: HourSample[] = fallbackWind.map((f) => ({
      time: f.time,
      waveM: findMatchingWave(f.time, waves),
      windKn: f.windKn,
      rainMmH: f.rainMmH,
      thunder: f.thunder,
    }));

    return {
      samples,
      source: "model",
    };
  }

  return {
    samples: [],
    source: "unavailable",
  };
}
