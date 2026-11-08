import type { HourSample, Level } from "./safety/rules";
import type { CacheDb } from "./cache";

export type MarineSource = "official" | "model" | "unavailable";

export interface MarineSeries {
  pointId: string;
  samples: HourSample[];
  verdicts: Array<{ date: string; level: Level; reasons: string[] }>;
}

export interface MarineResponse {
  source: MarineSource;
  fetched_at: string;
  stale: boolean;
  series: MarineSeries[];
  attribution: string[];
}

export type MarineRequest =
  | { kind: "point"; pointId: string }
  | { kind: "user"; lat: number; lon: number };

export interface MarineDeps {
  fetch: typeof fetch;
  db: CacheDb;
  now: () => Date;
}
