import { describe, it, expect } from "vitest";
import {
  calculateHeroStep,
  getVideoScaleForStep,
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

  it("returns smooth video scales for each step", () => {
    expect(getVideoScaleForStep(0)).toBe(1.00);
    expect(getVideoScaleForStep(1)).toBe(1.03);
    expect(getVideoScaleForStep(2)).toBe(1.06);
    expect(getVideoScaleForStep(3)).toBe(1.09);
  });

  it("returns dark overlay opacity preserving AA text contrast without exceeding 40%", () => {
    expect(getOverlayOpacityForStep(0)).toBeLessThanOrEqual(0.20);
    expect(getOverlayOpacityForStep(1)).toBeGreaterThanOrEqual(0.22);
    expect(getOverlayOpacityForStep(3)).toBeLessThanOrEqual(0.40);
  });
});
