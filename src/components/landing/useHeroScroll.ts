import { useState, useEffect } from "react";

export function calculateProgress(
  scrollY: number,
  containerTop: number,
  totalScrollableHeight: number
): number {
  if (totalScrollableHeight <= 0) return 0;
  const raw = (scrollY - containerTop) / totalScrollableHeight;
  return Math.max(0, Math.min(1, raw));
}

export function shouldTriggerTitle(
  currentTriggered: boolean,
  progress: number
): boolean {
  if (!currentTriggered) {
    return progress >= 0.12;
  }
  return progress >= 0.08;
}

export function shouldShowNavbar(progress: number): boolean {
  return progress >= 0.30;
}

export function checkIfInHero(bottom: number, threshold = 70): boolean {
  return bottom > threshold;
}

export interface HeroScrollState {
  progress: number;
  isTitleTriggered: boolean;
  showNavbar: boolean;
  isReducedMotion: boolean;
  isInHero: boolean;
}

export function useHeroScroll(
  containerRef: React.RefObject<HTMLElement>
): HeroScrollState {
  const [state, setState] = useState<HeroScrollState>({
    progress: 0,
    isTitleTriggered: false,
    showNavbar: false,
    isReducedMotion: false,
    isInHero: true,
  });

  useEffect(() => {
    // Cek preferensi aksesibilitas
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isSaveData =
      typeof navigator !== "undefined" &&
      Boolean((navigator as { connection?: { saveData?: boolean } }).connection?.saveData);

    if (motionQuery.matches || isSaveData) {
      setState({
        progress: 1,
        isTitleTriggered: true,
        showNavbar: true,
        isReducedMotion: true,
        isInHero: true,
      });
      return;
    }

    let rafId: number | null = null;
    let currentTriggered = false;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const containerTop = window.scrollY + rect.top;
        const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;

        const p = calculateProgress(window.scrollY, containerTop, totalScrollable);
        const triggered = shouldTriggerTitle(currentTriggered, p);
        currentTriggered = triggered;
        const nav = shouldShowNavbar(p);
        const inHero = checkIfInHero(rect.bottom);

        setState({
          progress: p,
          isTitleTriggered: triggered,
          showNavbar: nav,
          isReducedMotion: false,
          isInHero: inHero,
        });
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef]);

  return state;
}
