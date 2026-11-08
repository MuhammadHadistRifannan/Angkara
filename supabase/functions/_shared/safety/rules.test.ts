import { describe, it, expect } from "vitest";
import {
  evaluateHour,
  severityIndex,
  evaluateDay,
  rankDays,
  type HourSample,
  type DayWindow,
} from "./rules";
import thresholds from "./thresholds.json";

describe("rules safety engine", () => {
  it("wave 1.25 → waspada", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 1.25,
      windKn: 0,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("waspada");
  });

  it("wave 1.26 → tunda", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 1.26,
      windKn: 0,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("tunda");
  });

  it("wave 1.0 → waspada", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 1.0,
      windKn: 0,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("waspada");
  });

  it("wave 0.99 → aman", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0.99,
      windKn: 0,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("aman");
  });

  it("wind 15.0 → waspada", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0,
      windKn: 15.0,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("waspada");
  });

  it("wind 15.1 → tunda", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0,
      windKn: 15.1,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("tunda");
  });

  it("wind 12.0 → waspada", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0,
      windKn: 12.0,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("waspada");
  });

  it("wind 11.9 → aman", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0,
      windKn: 11.9,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("aman");
  });

  it("thunder true → tunda", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0,
      windKn: 0,
      rainMmH: 0,
      thunder: true,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("tunda");
  });

  it("rain 4.9 → aman", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0,
      windKn: 0,
      rainMmH: 4.9,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("aman");
  });

  it("rain 5 → waspada", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0,
      windKn: 0,
      rainMmH: 5.0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("waspada");
  });

  it("rain = tundaMmH → tunda", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: 0,
      windKn: 0,
      rainMmH: thresholds.rain.tundaMmH,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("tunda");
  });

  it("waveM null → level bukan 'aman' dan reasons memuat 'data gelombang tidak tersedia'", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: null,
      windKn: 5,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).not.toBe("aman");
    expect(verdict.level).toBe("waspada");
    expect(
      verdict.reasons.some((r) => r.toLowerCase().includes("data gelombang tidak tersedia"))
    ).toBe(true);
  });

  it("waveM null dengan angin 20 → tunda", () => {
    const sample: HourSample = {
      time: "2026-11-09T08:00:00+07:00",
      waveM: null,
      windKn: 20,
      rainMmH: 0,
      thunder: false,
    };
    const verdict = evaluateHour(sample, "speedboat");
    expect(verdict.level).toBe("tunda");
    expect(
      verdict.reasons.some((r) => r.toLowerCase().includes("data gelombang tidak tersedia"))
    ).toBe(true);
  });

  it("evaluateDay: level terburuk dalam jam 7–15; sampel jam 6 dan 16 diabaikan", () => {
    const hours: HourSample[] = [
      // Jam 6: tunda (seharusnya diabaikan)
      { time: "2026-11-09T06:00:00+07:00", waveM: 2.0, windKn: 25, rainMmH: 0, thunder: false },
      // Jam 7: aman
      { time: "2026-11-09T07:00:00+07:00", waveM: 0.5, windKn: 5, rainMmH: 0, thunder: false },
      // Jam 8: waspada
      { time: "2026-11-09T08:00:00+07:00", waveM: 1.0, windKn: 5, rainMmH: 0, thunder: false },
      // Jam 15: aman
      { time: "2026-11-09T15:00:00+07:00", waveM: 0.5, windKn: 5, rainMmH: 0, thunder: false },
      // Jam 16: tunda (seharusnya diabaikan)
      { time: "2026-11-09T16:00:00+07:00", waveM: 2.0, windKn: 25, rainMmH: 0, thunder: false },
    ];
    const dayWindow = evaluateDay("2026-11-09", hours, "speedboat");
    expect(dayWindow.level).toBe("waspada");
    expect(dayWindow.worstHour).toBe("2026-11-09T08:00:00+07:00");
  });

  it("evaluateDay: tanpa sampel di jendela → waspada", () => {
    const hours: HourSample[] = [
      { time: "2026-11-09T05:00:00+07:00", waveM: 0.5, windKn: 5, rainMmH: 0, thunder: false },
      { time: "2026-11-09T17:00:00+07:00", waveM: 0.5, windKn: 5, rainMmH: 0, thunder: false },
    ];
    const dayWindow = evaluateDay("2026-11-09", hours, "speedboat");
    expect(dayWindow.level).toBe("waspada");
    expect(dayWindow.worstHour).toBeNull();
    expect(
      dayWindow.reasons.some((r) => r.toLowerCase().includes("tidak tersedia"))
    ).toBe(true);
  });

  it("rankDays: urutan aman > waspada > tunda, lalu tanggal lebih awal", () => {
    const days: DayWindow[] = [
      { date: "2026-11-12", level: "tunda", worstHour: null, reasons: [] },
      { date: "2026-11-11", level: "waspada", worstHour: null, reasons: [] },
      { date: "2026-11-13", level: "aman", worstHour: null, reasons: [] },
      { date: "2026-11-09", level: "aman", worstHour: null, reasons: [] },
      { date: "2026-11-10", level: "waspada", worstHour: null, reasons: [] },
    ];
    const ranked = rankDays(days);
    expect(ranked.map((d) => d.date)).toEqual([
      "2026-11-09", // aman, tanggal lebih awal
      "2026-11-13", // aman, tanggal belakangan
      "2026-11-10", // waspada, tanggal lebih awal
      "2026-11-11", // waspada, tanggal belakangan
      "2026-11-12", // tunda
    ]);
  });

  it("severityIndex: skor rasio angin (0.79 ≤ 33, 0.8 = 34, 1.0 = 66, 1.01 ≥ 67, ≥ 1.5 = 100)", () => {
    const maxWind = thresholds.boats.speedboat.maxWindKn;
    // rasio 0.79 → ≤ 33
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 0.79 * maxWind, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBeLessThanOrEqual(33);

    // 0.8 → 34
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 0.8 * maxWind, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBe(34);

    // 1.0 → 66
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 1.0 * maxWind, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBe(66);

    // 1.01 → ≥ 67
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 1.01 * maxWind, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBeGreaterThanOrEqual(67);

    // ≥ 1.5 → 100
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 1.5 * maxWind, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBe(100);
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 2.0 * maxWind, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBe(100);
  });

  it("severityIndex: skor rasio gelombang", () => {
    const maxWave = thresholds.boats.speedboat.maxWaveM;
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0.79 * maxWave, windKn: 0, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBeLessThanOrEqual(33);

    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0.8 * maxWave, windKn: 0, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBe(34);

    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 1.0 * maxWave, windKn: 0, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBe(66);

    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 1.01 * maxWave, windKn: 0, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBeGreaterThanOrEqual(67);

    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 1.5 * maxWave, windKn: 0, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBe(100);
  });

  it("severityIndex: hujan waspadaMmH → 34, tundaMmH → 67", () => {
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 0, rainMmH: thresholds.rain.waspadaMmH, thunder: false },
        "speedboat"
      )
    ).toBe(34);

    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 0, rainMmH: thresholds.rain.tundaMmH, thunder: false },
        "speedboat"
      )
    ).toBe(67);
  });

  it("severityIndex: petir → 100", () => {
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: 0, windKn: 0, rainMmH: 0, thunder: true },
        "speedboat"
      )
    ).toBe(100);
  });

  it("severityIndex: waveM null tidak ikut dihitung", () => {
    const maxWind = thresholds.boats.speedboat.maxWindKn;
    expect(
      severityIndex(
        { time: "2026-11-09T08:00:00+07:00", waveM: null, windKn: 0.8 * maxWind, rainMmH: 0, thunder: false },
        "speedboat"
      )
    ).toBe(34);
  });

  it("severityIndex: nilai tertinggi dari variabel gabungan", () => {
    const maxWind = thresholds.boats.speedboat.maxWindKn;
    expect(
      severityIndex(
        {
          time: "2026-11-09T08:00:00+07:00",
          waveM: 0,
          windKn: 0.8 * maxWind,
          rainMmH: thresholds.rain.tundaMmH,
          thunder: false,
        },
        "speedboat"
      )
    ).toBe(67);
  });
});
