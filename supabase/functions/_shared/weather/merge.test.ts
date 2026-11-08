import { describe, it, expect } from "vitest";
import { mergeSamples } from "./merge";
import { findPointByBoatLocation } from "../departurePoints";
import type { BmkgHour } from "./bmkg";

describe("Weather Merge & Departure Points", () => {
  it("findPointByBoatLocation('Teluk Penyu') ≠ null; ('Antah Berantah') → null", () => {
    expect(findPointByBoatLocation("Teluk Penyu")).not.toBeNull();
    expect(findPointByBoatLocation("Pelabuhan Tanjung Intan")).not.toBeNull();
    expect(findPointByBoatLocation("Antah Berantah")).toBeNull();
  });

  it("mergeSamples: BMKG + gelombang → source 'official' dan sampel berisi keduanya", () => {
    const bmkg: BmkgHour[] = [
      {
        time: "2026-11-09T08:00:00+07:00",
        windKn: 10,
        rainMmH: 2,
        thunder: false,
        weatherDesc: "Berawan",
      },
    ];
    const waves = [
      {
        time: "2026-11-09T08:00:00+07:00",
        waveM: 1.1,
      },
    ];
    const res = mergeSamples(bmkg, waves);
    expect(res.source).toBe("official");
    expect(res.samples.length).toBe(1);
    expect(res.samples[0].windKn).toBe(10);
    expect(res.samples[0].waveM).toBe(1.1);
  });

  it("mergeSamples: BMKG saja → waveM null", () => {
    const bmkg: BmkgHour[] = [
      {
        time: "2026-11-09T08:00:00+07:00",
        windKn: 10,
        rainMmH: 2,
        thunder: false,
        weatherDesc: "Berawan",
      },
    ];
    const res = mergeSamples(bmkg, null);
    expect(res.source).toBe("official");
    expect(res.samples[0].waveM).toBeNull();
  });

  it("mergeSamples: gelombang saja tanpa BMKG dan tanpa fallbackWind → source 'unavailable'", () => {
    const waves = [
      {
        time: "2026-11-09T08:00:00+07:00",
        waveM: 1.1,
      },
    ];
    const res = mergeSamples(null, waves, null);
    expect(res.source).toBe("unavailable");
    expect(res.samples).toEqual([]);
  });

  it("mergeSamples: semua null → samples [], unavailable", () => {
    const res = mergeSamples(null, null, null);
    expect(res.source).toBe("unavailable");
    expect(res.samples).toEqual([]);
  });

  it("mergeSamples: fallbackWind + gelombang → source 'model'", () => {
    const fallbackWind = [
      {
        time: "2026-11-09T08:00:00+07:00",
        windKn: 8,
        rainMmH: 0,
        thunder: false,
      },
    ];
    const waves = [
      {
        time: "2026-11-09T08:00:00+07:00",
        waveM: 0.9,
      },
    ];
    const res = mergeSamples(null, waves, fallbackWind);
    expect(res.source).toBe("model");
    expect(res.samples[0].windKn).toBe(8);
    expect(res.samples[0].waveM).toBe(0.9);
  });
});
