import { describe, it, expect } from "vitest";

export function getActiveStep(visibleSteps: number[]): number {
  if (visibleSteps.length === 0) return 0;
  // Step paling awal yang sedang tampak di viewport
  return Math.min(...visibleSteps);
}

export function isStepCompleted(currentStep: number, stepIndex: number): boolean {
  return currentStep >= stepIndex;
}

describe("HowItWorks step calculation helper", () => {
  it("mengembalikan step 0 jika tidak ada step terlihat", () => {
    expect(getActiveStep([])).toBe(0);
  });

  it("memilih step terendah jika beberapa step tampak bersamaan", () => {
    expect(getActiveStep([1, 2])).toBe(1);
    expect(getActiveStep([3, 2])).toBe(2);
  });

  it("menentukan apakah step sudah selesai atau sedang aktif", () => {
    expect(isStepCompleted(2, 1)).toBe(true);
    expect(isStepCompleted(2, 2)).toBe(true);
    expect(isStepCompleted(2, 3)).toBe(false);
  });
});
