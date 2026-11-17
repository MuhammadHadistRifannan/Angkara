import { useEffect, useState, useRef } from "react";

export const HERO_STEP_COUNT = 5; // Step 0 (video), Step 1 (Title 1), Step 2 (Title 2), Step 3 (Title 3), Step 4 (Exit)
export const FEATURES_STEP_COUNT = 7; // Step 0 (Intro), Steps 1..5 (Features), Step 6 (Exit)

export interface StepFromScrollParams {
  scrollY: number;
  sentinelTops: number[];
  sentinelHeight: number;
  viewportHeight: number;
  prevStep: number;
  hysteresis?: number;
}

/**
 * Fungsi murni penentu langkah dari posisi scroll.
 * Menghitung perpotongan tengah layar (viewport center) dengan sentinel.
 * Ditambah hysteresis (+/- 8% tinggi sentinel) untuk mencegah getaran di batas ambang.
 */
export function stepFromScroll({
  scrollY,
  sentinelTops,
  sentinelHeight,
  viewportHeight,
  prevStep,
  hysteresis = 0,
}: StepFromScrollParams): number {
  if (sentinelTops.length === 0) return 0;

  const viewportCenter = scrollY + viewportHeight / 2;
  const count = sentinelTops.length;

  // Cek apakah posisi center masih valid di langkah sebelumnya dengan toleransi hysteresis
  const prevTop = sentinelTops[prevStep] ?? (prevStep * sentinelHeight);
  const prevBottom = prevTop + sentinelHeight;

  if (
    viewportCenter >= prevTop - hysteresis &&
    viewportCenter <= prevBottom + hysteresis
  ) {
    return Math.max(0, Math.min(count - 1, prevStep));
  }

  // Jika keluar dari batas toleransi langkah sebelumnya, cari sentinel terdekat
  for (let i = 0; i < count; i++) {
    const top = sentinelTops[i] ?? (i * sentinelHeight);
    const bottom = top + sentinelHeight;
    if (viewportCenter >= top && viewportCenter < bottom) {
      return i;
    }
  }

  if (viewportCenter < (sentinelTops[0] ?? 0)) {
    return 0;
  }

  return count - 1;
}

export interface HeroSceneState {
  titleVisible: boolean;
  activeTitleIndex: number | null;
  videoScale: number;
  overlayDarkness: number;
  isExit: boolean;
}

export function getHeroSceneState(step: number): HeroSceneState {
  const clamped = Math.max(0, Math.min(HERO_STEP_COUNT - 1, step));

  switch (clamped) {
    case 0:
      return {
        titleVisible: false,
        activeTitleIndex: null,
        videoScale: 1.90,
        overlayDarkness: 0.15,
        isExit: false,
      };
    case 1:
      return {
        titleVisible: true,
        activeTitleIndex: 0,
        videoScale: 1.60,
        overlayDarkness: 0.20,
        isExit: false,
      };
    case 2:
      return {
        titleVisible: true,
        activeTitleIndex: 1,
        videoScale: 1.30,
        overlayDarkness: 0.25,
        isExit: false,
      };
    case 3:
      return {
        titleVisible: true,
        activeTitleIndex: 2,
        videoScale: 1.00,
        overlayDarkness: 0.25,
        isExit: false,
      };
    case 4:
      return {
        titleVisible: false,
        activeTitleIndex: null,
        videoScale: 1.00,
        overlayDarkness: 0.70,
        isExit: true,
      };
    default:
      return {
        titleVisible: false,
        activeTitleIndex: null,
        videoScale: 1.00,
        overlayDarkness: 0.15,
        isExit: false,
      };
  }
}

export interface FeaturesSceneState {
  isIntro: boolean;
  modelIndex: number;
  modelActiveId: string;
  textActive: boolean;
  isExit: boolean;
}

const FEATURE_IDS = [
  "listing-terverifikasi",
  "kalender-booking",
  "pembayaran-online",
  "dashboard-analitik",
  "paket-wisata",
];

export function getFeaturesSceneState(step: number): FeaturesSceneState {
  const clamped = Math.max(0, Math.min(FEATURES_STEP_COUNT - 1, step));

  if (clamped === 0) {
    return {
      isIntro: true,
      modelIndex: 0,
      modelActiveId: FEATURE_IDS[0],
      textActive: false,
      isExit: false,
    };
  }

  if (clamped >= 1 && clamped <= 5) {
    const idx = clamped - 1;
    return {
      isIntro: false,
      modelIndex: idx,
      modelActiveId: FEATURE_IDS[idx],
      textActive: true,
      isExit: false,
    };
  }

  // Step 6: Exit Sentinel
  return {
    isIntro: false,
    modelIndex: 4,
    modelActiveId: FEATURE_IDS[4],
    textActive: false,
    isExit: true,
  };
}

/**
 * Hook pemantau langkah section dengan scroll observer stabil & hysteresis.
 */
export function useSectionStep(
  containerRef: React.RefObject<HTMLElement>,
  sentinelCount: number,
  options?: { hysteresisRatio?: number }
) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const prevStepRef = useRef(0);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        const currentDirection = scrollY >= lastScrollYRef.current ? "down" : "up";
        lastScrollYRef.current = scrollY;
        setDirection(currentDirection);

        const containerTop = scrollY + rect.top;
        const sentinelHeight = rect.height / sentinelCount;
        const sentinelTops = Array.from({ length: sentinelCount }).map(
          (_, i) => containerTop + i * sentinelHeight
        );

        const hysteresis = (options?.hysteresisRatio ?? 0.08) * sentinelHeight;

        const newStep = stepFromScroll({
          scrollY,
          sentinelTops,
          sentinelHeight,
          viewportHeight: vh,
          prevStep: prevStepRef.current,
          hysteresis,
        });

        if (newStep !== prevStepRef.current) {
          prevStepRef.current = newStep;
          setStep(newStep);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [containerRef, sentinelCount, options?.hysteresisRatio]);

  return { step, direction };
}
