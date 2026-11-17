import { describe, it, expect } from "vitest";
import { calculateModelFit, calculateActiveFeatureIndex } from "./modelMath";

describe("modelMath - calculateModelFit", () => {
  it("menghitung skala dan offset untuk bounding box simetris", () => {
    // Model kubus berukuran 2x2x2 dari [-1, -1, -1] ke [1, 1, 1]
    const fit = calculateModelFit([-1, -1, -1], [1, 1, 1], 1.6);
    // maxDimension = 2, targetHeight = 1.6 -> scale = 0.8
    expect(fit.scale).toBeCloseTo(0.8);
    // Center X & Z = 0 -> offsetX & offsetZ = 0
    expect(fit.offset[0]).toBeCloseTo(0);
    expect(fit.offset[2]).toBeCloseTo(0);
    // min.y = -1 -> offsetY = -(-1) * 0.8 = 0.8 (sehingga dasar kubus berada di y = 0)
    expect(fit.offset[1]).toBeCloseTo(0.8);
  });

  it("menghitung skala untuk model asimetris tinggi", () => {
    // Model tiang 1 x 4 x 1 dari [0, 0, 0] ke [1, 4, 1]
    const fit = calculateModelFit([0, 0, 0], [1, 4, 1], 2.0);
    // maxDimension = 4, targetHeight = 2.0 -> scale = 0.5
    expect(fit.scale).toBeCloseTo(0.5);
    // Center X = 0.5 -> offsetX = -0.5 * 0.5 = -0.25
    expect(fit.offset[0]).toBeCloseTo(-0.25);
    // min.y = 0 -> offsetY = 0
    expect(fit.offset[1]).toBeCloseTo(0);
    // Center Z = 0.5 -> offsetZ = -0.25
    expect(fit.offset[2]).toBeCloseTo(-0.25);
  });

  it("menghindari pembagian nol jika bounding box berdimensi 0", () => {
    const fit = calculateModelFit([0, 0, 0], [0, 0, 0], 1.6);
    expect(fit.scale).toBe(1);
    expect(fit.offset).toEqual([0, 0, 0]);
  });
});

describe("modelMath - calculateActiveFeatureIndex", () => {
  it("memetakan progres scroll 0 sampai 1 ke indeks 0..5", () => {
    expect(calculateActiveFeatureIndex(0, 6)).toBe(0);
    expect(calculateActiveFeatureIndex(0.1, 6)).toBe(0);
    expect(calculateActiveFeatureIndex(0.2, 6)).toBe(1);
    expect(calculateActiveFeatureIndex(0.5, 6)).toBe(3);
    expect(calculateActiveFeatureIndex(0.99, 6)).toBe(5);
    expect(calculateActiveFeatureIndex(1.0, 6)).toBe(5);
  });

  it("menjaga batas batas indeks jika progres di luar [0, 1]", () => {
    expect(calculateActiveFeatureIndex(-0.5, 6)).toBe(0);
    expect(calculateActiveFeatureIndex(1.5, 6)).toBe(5);
  });
});

describe("MODEL_CONFIG - Validasi Konfigurasi Revisi 2", () => {
  it("memiliki konfigurasi untuk kelima model utama", async () => {
    const { MODEL_CONFIG } = await import("./modelConfig");
    const keys = Object.keys(MODEL_CONFIG);
    expect(keys).toContain("listing-terverifikasi");
    expect(keys).toContain("kalender-booking");
    expect(keys).toContain("pembayaran-online");
    expect(keys).toContain("dashboard-analitik");
    expect(keys).toContain("paket-wisata");
  });

  it("model anchor memiliki rotasi koreksi tegak [90, 0, 0]", async () => {
    const { MODEL_CONFIG } = await import("./modelConfig");
    expect(MODEL_CONFIG["paket-wisata"].rotation).toEqual([90, 0, 0]);
  });

  it("semua model memiliki targetHeight yang proporsional (< 1.6)", async () => {
    const { MODEL_CONFIG } = await import("./modelConfig");
    for (const item of Object.values(MODEL_CONFIG)) {
      expect(item.targetHeight).toBeGreaterThan(1.0);
      expect(item.targetHeight).toBeLessThanOrEqual(1.55);
    }
  });
});
