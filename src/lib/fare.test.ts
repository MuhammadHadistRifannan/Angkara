import { describe, it, expect } from "vitest";
import { groupDiscountRate, estimateFare } from "./fare";

describe("Fare Calculation (src/lib/fare.ts)", () => {
  describe("groupDiscountRate", () => {
    it("penumpang 9 orang → tarif normal (rate 1)", () => {
      expect(groupDiscountRate(9)).toBe(1);
    });

    it("penumpang 10 orang → diskon 10% (rate 0.9)", () => {
      expect(groupDiscountRate(10)).toBe(0.9);
    });

    it("penumpang 19 orang → diskon 10% (rate 0.9)", () => {
      expect(groupDiscountRate(19)).toBe(0.9);
    });

    it("penumpang 20 orang → diskon 15% (rate 0.85)", () => {
      expect(groupDiscountRate(20)).toBe(0.85);
    });

    it("penumpang 40 orang → diskon 15% (rate 0.85)", () => {
      expect(groupDiscountRate(40)).toBe(0.85);
    });

    it("input tidak valid (0 atau negatif) → tidak ada diskon (rate 1)", () => {
      expect(groupDiscountRate(0)).toBe(1);
      expect(groupDiscountRate(-3)).toBe(1);
    });
  });

  describe("estimateFare", () => {
    it("basePrice 50000, 2 orang, 2 jam → 100000 (pengali durasi 2/2 = 1, tanpa diskon)", () => {
      expect(estimateFare(50000, 2, 2)).toBe(100000);
    });

    it("basePrice 50000, 20 orang, 2 jam → 850000 (diskon 15%)", () => {
      expect(estimateFare(50000, 20, 2)).toBe(850000);
    });

    it("basePrice 50000, 2 orang, 4 jam → 200000 (durasi 4 jam = pengali 2)", () => {
      expect(estimateFare(50000, 2, 4)).toBe(200000);
    });

    it("durasi 0 atau negatif dianggap minimal 0.5 jam, tidak NaN dan tidak negatif", () => {
      const fareZero = estimateFare(50000, 2, 0);
      const fareNegative = estimateFare(50000, 2, -1);
      expect(Number.isNaN(fareZero)).toBe(false);
      expect(fareZero).toBeGreaterThan(0);
      expect(Number.isNaN(fareNegative)).toBe(false);
      expect(fareNegative).toBeGreaterThan(0);
      // durasi < 0.5 dianggap 0.5 jam -> pengali 0.5 / 2 = 0.25 -> 50000 * 2 * 0.25 = 25000
      expect(fareZero).toBe(25000);
      expect(fareNegative).toBe(25000);
    });

    it("hasil selalu bilangan bulat (Math.round)", () => {
      // 35000 * 10 * (2.5 / 2) * 0.9 = 350000 * 1.25 * 0.9 = 393750
      const fare = estimateFare(35000, 10, 2.5);
      expect(Number.isInteger(fare)).toBe(true);
      expect(fare).toBe(Math.round(fare));
    });
  });
});
