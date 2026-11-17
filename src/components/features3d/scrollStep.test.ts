import { describe, it, expect } from "vitest";
import {
  calculateStepFromSentinel,
  getFeatureIndexForStep,
  isIntroStep,
  STEP_COUNT,
  TOTAL_FEATURES,
} from "./scrollStep";

describe("scrollStep helper", () => {
  it("has 6 total steps (1 intro + 5 features)", () => {
    expect(STEP_COUNT).toBe(6);
    expect(TOTAL_FEATURES).toBe(5);
  });

  it("calculates step correctly with clamp between 0 and 5", () => {
    expect(calculateStepFromSentinel(-1)).toBe(0);
    expect(calculateStepFromSentinel(0)).toBe(0);
    expect(calculateStepFromSentinel(1)).toBe(1);
    expect(calculateStepFromSentinel(3)).toBe(3);
    expect(calculateStepFromSentinel(5)).toBe(5);
    expect(calculateStepFromSentinel(10)).toBe(5);
  });

  it("identifies intro step correctly", () => {
    expect(isIntroStep(0)).toBe(true);
    expect(isIntroStep(1)).toBe(false);
    expect(isIntroStep(5)).toBe(false);
  });

  it("maps step to feature index (0-based for 5 features)", () => {
    // Step 0 (Intro) displays first feature model (shield) at index 0
    expect(getFeatureIndexForStep(0)).toBe(0);
    // Step 1 displays feature 1 (shield) at index 0
    expect(getFeatureIndexForStep(1)).toBe(0);
    // Step 2 displays feature 2 (calendar) at index 1
    expect(getFeatureIndexForStep(2)).toBe(1);
    // Step 3 displays feature 3 (payment_card) at index 2
    expect(getFeatureIndexForStep(3)).toBe(2);
    // Step 4 displays feature 4 (whiteboard) at index 3
    expect(getFeatureIndexForStep(4)).toBe(3);
    // Step 5 displays feature 5 (anchor) at index 4
    expect(getFeatureIndexForStep(5)).toBe(4);
  });
});
