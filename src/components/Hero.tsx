import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HeroVideo } from "./landing/HeroVideo";
import { HeroTitle } from "./landing/HeroTitle";
import { LiquidNav } from "./landing/LiquidNav";
import {
  useSectionStep,
  getHeroSceneState,
  HERO_STEP_COUNT,
} from "./landing/useSectionStep";
import { useSnapAssist } from "./landing/useSnapAssist";
import { updateDebugOverlay } from "./landing/debugStore";

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [showNavbar, setShowNavbar] = useState(false);
  const [isInHero, setIsInHero] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // 1. Single State Machine untuk Hero via useSectionStep (5 sentinel termasuk sentinel keluar)
  const { step: activeStep } = useSectionStep(containerRef, HERO_STEP_COUNT, {
    hysteresisRatio: 0.08,
  });

  // 2. Snap Assist halus khusus desktop
  useSnapAssist({
    containerRef,
    sentinelCount: HERO_STEP_COUNT,
    pauseMs: 140,
  });

  // Aksesibilitas: Cek preferensi reduced-motion & saveData
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isSaveData =
      typeof navigator !== "undefined" &&
      Boolean((navigator as { connection?: { saveData?: boolean } }).connection?.saveData);

    const updatePreferences = () => {
      const reduced = motionQuery.matches || isSaveData;
      setIsReducedMotion(reduced);
    };

    updatePreferences();
    motionQuery.addEventListener("change", updatePreferences);
    return () => motionQuery.removeEventListener("change", updatePreferences);
  }, []);

  // Update status isInHero & hitung scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        setIsInHero(rect.bottom > 70);

        const totalScrollable = rect.height - vh;
        const currentProgress =
          totalScrollable > 0
            ? Math.max(0, Math.min(1, -rect.top / totalScrollable))
            : 0;
        setScrollProgress(currentProgress);

        // Jika user scroll kembali ke paling atas halaman (Step 0)
        if (window.scrollY <= 15) {
          setShowNavbar(false);
        }

        // Sinkronisasi ke Debug Overlay
        updateDebugOverlay("hero", {
          step: activeStep,
          scrollProgress: currentProgress,
          typingStatus: activeStep >= 1 && activeStep <= 3 ? "typing" : "idle",
        });
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [activeStep]);

  // Callback saat TEKS KE-2 pada Title ("Cuaca sudah dihitung.") mulai muncul
  const handleLine2Start = useCallback(() => {
    if (activeStep >= 1) {
      setShowNavbar(true);
    }
  }, [activeStep]);

  // Jika user scroll ke Step 2, 3, atau 4, pastikan navbar tetap tampil
  useEffect(() => {
    if (activeStep >= 2) {
      setShowNavbar(true);
    } else if (activeStep === 0) {
      setShowNavbar(false);
    }
  }, [activeStep]);

  const sceneState = getHeroSceneState(activeStep);

  // Gradasi gelap (overlayDarkness) HANYA naik pada sentinel keluar (Step 4), BUKAN pada step 1-3 (Perbaikan H3)
  const overlayOpacity = isReducedMotion
    ? 0.35
    : sceneState.overlayDarkness;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[450svh] md:h-[500vh] bg-slate-950"
      aria-label="Hero Pelayaran Suar"
    >
      {/* 
        5 Scroll Sentinels:
        - Sentinel 0: Video saja
        - Sentinel 1: Judul 1
        - Sentinel 2: Judul 2
        - Sentinel 3: Judul 3
        - Sentinel 4: Sentinel Keluar (Exit Sentinel)
      */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        {Array.from({ length: HERO_STEP_COUNT }).map((_, stepIdx) => (
          <div
            key={stepIdx}
            data-hero-step={stepIdx}
            className="w-full flex-1"
          />
        ))}
      </div>

      {/* Sticky Viewport 100svh */}
      <div className="sticky top-0 w-full h-[100svh] overflow-hidden">
        {/* Background Video Laut & Kapal dengan Zoom-Out Dramatis yang Responsif */}
        <HeroVideo
          progress={scrollProgress}
          step={activeStep}
          isReducedMotion={isReducedMotion}
        />

        {/* Gradasi gelap adaptif di area langit untuk kontras teks WCAG AA */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-transparent transition-opacity duration-300 ease-out z-10"
          style={{ opacity: overlayOpacity }}
        />

        {/* Gradasi kabut laut halus di bagian bawah yang melebur mulus ke latar section berikutnya (hanya di exit step) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 sm:h-96 bg-gradient-to-t from-[hsl(var(--features-bg-top))] via-[hsl(var(--features-bg-top))]/80 to-transparent transition-opacity duration-500 ease-out z-10"
          style={{ opacity: sceneState.isExit ? 1 : 0 }}
        />

        {/* Judul & Animasi Typing di Area Langit (30-34% tinggi layar) */}
        <HeroTitle
          step={activeStep}
          isReducedMotion={isReducedMotion}
          onLine2Start={handleLine2Start}
          onFirstTitleComplete={() => {
            if (activeStep >= 1) setShowNavbar(true);
          }}
        />

        {/* Unified Liquid Glass Navbar dipancarkan ke body agar fixed stabil melintasi seluruh halaman */}
        {typeof document !== "undefined" &&
          createPortal(
            <LiquidNav
              show={showNavbar}
              isReducedMotion={isReducedMotion}
              isInHero={isInHero}
            />,
            document.body
          )}

        {/* 
          Indikator 3 Titik Hero Vertikal di Sisi Kanan Tengah Layar (Perbaikan H4)
          Tidak lagi menimpa lambung kapal di bawah tengah!
        */}
        <div
          className={`fixed right-6 sm:right-7 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2.5 pointer-events-none select-none transition-opacity duration-300 ${
            activeStep >= 1 && activeStep <= 3 && isInHero ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-2 bg-black/35 backdrop-blur-md px-2 py-3 rounded-full border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            {[0, 1, 2].map((idx) => {
              const isActive = activeStep > 0 && activeStep - 1 === idx;
              return (
                <span
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? "h-6 bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                      : "h-2 bg-white/35"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
