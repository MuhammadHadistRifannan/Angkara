import { describe, it, expect } from "vitest";
import {
  stepFromScroll,
  getHeroSceneState,
  getFeaturesSceneState,
  HERO_STEP_COUNT,
  FEATURES_STEP_COUNT,
} from "./useSectionStep";

describe("stepFromScroll", () => {
  it("determines active step based on sentinel closest to viewport center with hysteresis", () => {
    const sentinelTops = [0, 1000, 2000, 3000, 4000];
    const sentinelHeight = 1000;
    const viewportHeight = 800; // center = scrollY + 400

    // At scrollY = 0, center = 400 -> sentinel 0
    expect(stepFromScroll({ scrollY: 0, sentinelTops, sentinelHeight, viewportHeight, prevStep: 0 })).toBe(0);

    // At scrollY = 800, center = 1200 -> sentinel 1
    expect(stepFromScroll({ scrollY: 800, sentinelTops, sentinelHeight, viewportHeight, prevStep: 0 })).toBe(1);

    // Near boundary (center = 950 < 1000), hysteresis keeps step 0
    const hysteresis = 80;
    expect(
      stepFromScroll({
        scrollY: 550, // center = 950
        sentinelTops,
        sentinelHeight,
        viewportHeight,
        prevStep: 0,
        hysteresis,
      })
    ).toBe(0);
  });

  it("clamps step between 0 and sentinel count - 1", () => {
    const sentinelTops = [0, 1000, 2000];
    const sentinelHeight = 1000;
    const viewportHeight = 800;

    expect(stepFromScroll({ scrollY: -500, sentinelTops, sentinelHeight, viewportHeight, prevStep: 0 })).toBe(0);
    expect(stepFromScroll({ scrollY: 99999, sentinelTops, sentinelHeight, viewportHeight, prevStep: 0 })).toBe(2);
  });
});

describe("getHeroSceneState", () => {
  it("maps hero step to pure scene state", () => {
    expect(HERO_STEP_COUNT).toBe(5);

    // Step 0: judul + form pencarian + chip cuaca langsung tampil
    // (Opsi A, 2026-11-19: step 0 tidak lagi video saja).
    const s0 = getHeroSceneState(0);
    expect(s0.titleVisible).toBe(true);
    expect(s0.activeTitleIndex).toBe(0);
    expect(s0.videoScale).toBe(1.90);
    expect(s0.overlayDarkness).toBe(0.15);
    expect(s0.isExit).toBe(false);

    // Step 1: title 1
    const s1 = getHeroSceneState(1);
    expect(s1.titleVisible).toBe(true);
    expect(s1.activeTitleIndex).toBe(0);
    expect(s1.videoScale).toBe(1.60);
    expect(s1.overlayDarkness).toBe(0.20);
    expect(s1.isExit).toBe(false);

    // Step 2: title 2
    const s2 = getHeroSceneState(2);
    expect(s2.titleVisible).toBe(true);
    expect(s2.activeTitleIndex).toBe(1);
    expect(s2.videoScale).toBe(1.30);
    expect(s2.overlayDarkness).toBe(0.25);

    // Step 3: title 3
    const s3 = getHeroSceneState(3);
    expect(s3.titleVisible).toBe(true);
    expect(s3.activeTitleIndex).toBe(2);
    expect(s3.videoScale).toBe(1.00);
    expect(s3.overlayDarkness).toBe(0.25);
    expect(s3.isExit).toBe(false);

    // Step 4: Exit Sentinel
    const s4 = getHeroSceneState(4);
    expect(s4.titleVisible).toBe(false);
    expect(s4.activeTitleIndex).toBeNull();
    expect(s4.isExit).toBe(true);
    expect(s4.overlayDarkness).toBe(0.70);
  });
});

describe("getFeaturesSceneState", () => {
  it("maps features step to pure scene state correctly (step 0 = intro shield index 0)", () => {
    expect(FEATURES_STEP_COUNT).toBe(7);

    // Step 0: Intro (shield index 0)
    const f0 = getFeaturesSceneState(0);
    expect(f0.isIntro).toBe(true);
    expect(f0.modelIndex).toBe(0);
    expect(f0.modelActiveId).toBe("listing-terverifikasi");
    expect(f0.textActive).toBe(false);
    expect(f0.isExit).toBe(false);

    // Step 1: Fitur 1 (shield index 0)
    const f1 = getFeaturesSceneState(1);
    expect(f1.isIntro).toBe(false);
    expect(f1.modelIndex).toBe(0);
    expect(f1.modelActiveId).toBe("listing-terverifikasi");
    expect(f1.textActive).toBe(true);

    // Step 2: Fitur 2 (calendar index 1)
    const f2 = getFeaturesSceneState(2);
    expect(f2.modelIndex).toBe(1);
    expect(f2.modelActiveId).toBe("kalender-booking");
    expect(f2.textActive).toBe(true);

    // Step 3: Fitur 3 (payment_card index 2)
    const f3 = getFeaturesSceneState(3);
    expect(f3.modelIndex).toBe(2);
    expect(f3.modelActiveId).toBe("pembayaran-online");

    // Step 4: Fitur 4 (analitik index 3)
    const f4 = getFeaturesSceneState(4);
    expect(f4.modelIndex).toBe(3);
    expect(f4.modelActiveId).toBe("dashboard-analitik");

    // Step 5: Fitur 5 (anchor index 4)
    const f5 = getFeaturesSceneState(5);
    expect(f5.modelIndex).toBe(4);
    expect(f5.modelActiveId).toBe("paket-wisata");
    expect(f5.isExit).toBe(false);

    // Step 6: Exit Sentinel
    const f6 = getFeaturesSceneState(6);
    expect(f6.isExit).toBe(true);
    expect(f6.textActive).toBe(false);
  });
});
