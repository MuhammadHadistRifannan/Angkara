import { describe, it, expect } from "vitest";
import { generateWaveSegments, buildWavePath } from "./waveMath";

describe("buildWavePath & waveMath math helper", () => {
  it("memiliki nilai y di titik awal yang sama persis dengan y di titik akhir (seamless loop)", () => {
    const res = generateWaveSegments({
      width: 2880,
      height: 120,
      amplitude: 18,
      periods: 2,
      phase: 0.5,
      baseHeight: 50,
    });

    expect(res.startY).toBeCloseTo(res.endY, 2);
  });

  it("memiliki paruh pertama yang identik bentuknya dengan paruh kedua (tergeser width / 2)", () => {
    const width = 2880;
    const halfWidth = width / 2;
    const res = generateWaveSegments({
      width,
      height: 120,
      amplitude: 24,
      periods: 3,
      phase: 0.2,
      baseHeight: 60,
    });

    const totalSegs = res.segments.length;
    const halfSegs = totalSegs / 2;

    for (let i = 0; i < halfSegs; i++) {
      const segFirst = res.segments[i];
      const segSecond = res.segments[i + halfSegs];

      // Nilai Y harus sama persis
      expect(segFirst.y).toBeCloseTo(segSecond.y, 2);
      expect(segFirst.cp1y).toBeCloseTo(segSecond.cp1y, 2);
      expect(segFirst.cp2y).toBeCloseTo(segSecond.cp2y, 2);

      // Nilai X harus tergeser tepat halfWidth
      expect(segSecond.x - segFirst.x).toBeCloseTo(halfWidth, 2);
      expect(segSecond.cp1x - segFirst.cp1x).toBeCloseTo(halfWidth, 2);
      expect(segSecond.cp2x - segFirst.cp2x).toBeCloseTo(halfWidth, 2);
    }
  });

  it("menghasilkan path SVG yang valid dan tertutup (Z)", () => {
    const pathNormal = buildWavePath({
      width: 2880,
      height: 120,
      amplitude: 15,
      periods: 2,
      flip: false,
    });

    expect(pathNormal.startsWith("M 0")).toBe(true);
    expect(pathNormal.endsWith("L 0 120 Z")).toBe(true);

    const pathFlipped = buildWavePath({
      width: 2880,
      height: 120,
      amplitude: 15,
      periods: 2,
      flip: true,
    });

    expect(pathFlipped.startsWith("M 0")).toBe(true);
    expect(pathFlipped.endsWith("L 0 0 Z")).toBe(true);
  });
});
