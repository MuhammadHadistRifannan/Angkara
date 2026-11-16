import { describe, it, expect } from "vitest";
import {
  calculateProgress,
  shouldTriggerTitle,
  shouldShowNavbar,
  checkIfInHero,
} from "./useHeroScroll";

describe("useHeroScroll - pure helper logic", () => {
  describe("calculateProgress", () => {
    it("mengembalikan 0 jika scrollY sebelum elemen atau di posisi awal", () => {
      expect(calculateProgress(0, 0, 1000)).toBe(0);
      expect(calculateProgress(-50, 0, 1000)).toBe(0);
    });

    it("menghitung progres linier 0 hingga 1", () => {
      expect(calculateProgress(500, 0, 1000)).toBe(0.5);
      expect(calculateProgress(250, 0, 1000)).toBe(0.25);
    });

    it("mengembalikan 1 jika scroll melewati batas total scrollable height", () => {
      expect(calculateProgress(1200, 0, 1000)).toBe(1);
    });
  });

  describe("shouldTriggerTitle", () => {
    it("memicu typing ketika progres >= 0.12", () => {
      expect(shouldTriggerTitle(false, 0.11)).toBe(false);
      expect(shouldTriggerTitle(false, 0.12)).toBe(true);
      expect(shouldTriggerTitle(false, 0.25)).toBe(true);
    });

    it("mempertahankan state aktif selama progres >= 0.08 (hysteresis)", () => {
      expect(shouldTriggerTitle(true, 0.10)).toBe(true);
      expect(shouldTriggerTitle(true, 0.08)).toBe(true);
    });

    it("mereset typing jika scroll mundur di bawah ambang 0.08", () => {
      expect(shouldTriggerTitle(true, 0.079)).toBe(false);
      expect(shouldTriggerTitle(true, 0.02)).toBe(false);
    });
  });

  describe("shouldShowNavbar", () => {
    it("menampilkan navbar hanya ketika progres >= 0.30", () => {
      expect(shouldShowNavbar(0.29)).toBe(false);
      expect(shouldShowNavbar(0.30)).toBe(true);
      expect(shouldShowNavbar(0.50)).toBe(true);
    });
  });

  describe("checkIfInHero", () => {
    it("mengembalikan true jika batas bawah hero masih di atas threshold (70px)", () => {
      expect(checkIfInHero(1000)).toBe(true);
      expect(checkIfInHero(71)).toBe(true);
    });

    it("mengembalikan false jika batas bawah hero sudah melewati threshold (keluar dari hero)", () => {
      expect(checkIfInHero(70)).toBe(false);
      expect(checkIfInHero(0)).toBe(false);
      expect(checkIfInHero(-200)).toBe(false);
    });
  });
});
