import { describe, it, expect } from "vitest";
import {
  calculateHeroStep,
  getVideoScaleForStep,
  calculateZoomOutScale,
  getOverlayOpacityForStep,
  getTitleIndexForStep,
  HERO_STEP_COUNT,
  HERO_TITLES,
} from "./heroStep";

describe("heroStep logic", () => {
  it("defines exactly 3 titles with line1 and line2 under 24 characters", () => {
    expect(HERO_TITLES.length).toBe(3);
    HERO_TITLES.forEach(({ line1, line2 }) => {
      expect(line1.length).toBeLessThanOrEqual(24);
      expect(line2.length).toBeLessThanOrEqual(24);
    });
  });

  it("has 4 steps: step 0 (video) + steps 1-3 (titles 1-3)", () => {
    expect(HERO_STEP_COUNT).toBe(4);
  });

  it("calculates hero step with clamp between 0 and 3", () => {
    expect(calculateHeroStep(-1)).toBe(0);
    expect(calculateHeroStep(0)).toBe(0);
    expect(calculateHeroStep(1)).toBe(1);
    expect(calculateHeroStep(2)).toBe(2);
    expect(calculateHeroStep(3)).toBe(3);
    expect(calculateHeroStep(99)).toBe(3);
  });

  it("maps step to title index or null for step 0", () => {
    expect(getTitleIndexForStep(0)).toBeNull();
    expect(getTitleIndexForStep(1)).toBe(0);
    expect(getTitleIndexForStep(2)).toBe(1);
    expect(getTitleIndexForStep(3)).toBe(2);
  });

  it("returns deep zoom-in on step 0 and zooms out to 1.00 on step 3", () => {
    // Desktop: default 1.90 zoom in -> 1.00
    expect(getVideoScaleForStep(0, false)).toBe(1.90);
    expect(getVideoScaleForStep(1, false)).toBeLessThan(1.90);
    expect(getVideoScaleForStep(2, false)).toBeLessThan(getVideoScaleForStep(1, false));
    expect(getVideoScaleForStep(3, false)).toBe(1.00);

    // Mobile: default 1.50 zoom in -> 1.00
    expect(getVideoScaleForStep(0, true)).toBe(1.50);
    expect(getVideoScaleForStep(3, true)).toBe(1.00);
  });

  it("calculates continuous zoom-out scale from scroll progress (1.90 down to 1.00)", () => {
    expect(calculateZoomOutScale(0, false)).toBe(1.90);
    expect(calculateZoomOutScale(0.5, false)).toBe(1.45);
    expect(calculateZoomOutScale(1.0, false)).toBe(1.00);

    // Mobile
    expect(calculateZoomOutScale(0, true)).toBe(1.50);
    expect(calculateZoomOutScale(1.0, true)).toBe(1.00);

    // Reduced motion
    expect(calculateZoomOutScale(0, false, true)).toBe(1.00);
  });

  it("returns dark overlay opacity preserving AA text contrast without exceeding 40%", () => {
    expect(getOverlayOpacityForStep(0)).toBeLessThanOrEqual(0.20);
    expect(getOverlayOpacityForStep(1)).toBeGreaterThanOrEqual(0.22);
    expect(getOverlayOpacityForStep(3)).toBeLessThanOrEqual(0.40);
  });
});
