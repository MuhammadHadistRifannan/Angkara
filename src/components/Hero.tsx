import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HeroVideo } from "./landing/HeroVideo";
import { HeroTitle } from "./landing/HeroTitle";
import { LiquidNav } from "./landing/LiquidNav";
import {
  calculateHeroStep,
  getOverlayOpacityForStep,
  HERO_STEP_COUNT,
} from "./landing/heroStep";
import { ChevronDown } from "lucide-react";

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeStep, setActiveStep] = useState(0);
  const [hasNavbarShown, setHasNavbarShown] = useState(false);
  const [isInHero, setIsInHero] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Aksesibilitas: Cek preferensi reduced-motion & saveData
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isSaveData =
      typeof navigator !== "undefined" &&
      Boolean((navigator as { connection?: { saveData?: boolean } }).connection?.saveData);

    const updatePreferences = () => {
      const reduced = motionQuery.matches || isSaveData;
      setIsReducedMotion(reduced);
      if (reduced) {
        setHasNavbarShown(true);
      }
    };

    updatePreferences();
    motionQuery.addEventListener("change", updatePreferences);
    return () => motionQuery.removeEventListener("change", updatePreferences);
  }, []);

  // IntersectionObserver untuk 4 Sentinel Scrollcraft (rootMargin: "-48% 0px -48% 0px")
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepAttr = entry.target.getAttribute("data-hero-step");
            if (stepAttr !== null) {
              const stepNum = parseInt(stepAttr, 10);
              setActiveStep(calculateHeroStep(stepNum));
            }
          }
        });
      },
      {
        rootMargin: "-48% 0px -48% 0px",
        threshold: 0,
      }
    );

    sentinelRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Status isInHero untuk tampilan LiquidNav
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setIsInHero(rect.bottom > 70);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tampilkan LiquidNav setelah batas waktu 800ms sejak masuk Step 1
  useEffect(() => {
    if (activeStep >= 1 && !hasNavbarShown) {
      const timer = setTimeout(() => {
        setHasNavbarShown(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeStep, hasNavbarShown]);

  // Callback saat pengetikan judul pertama selesai sempurna
  const handleFirstTitleComplete = useCallback(() => {
    setHasNavbarShown(true);
  }, []);

  // Lapisan gradasi gelap adaptif di atas video (~15% di step 0 -> ~25% -> ~32% -> ~40%)
  const overlayOpacity = isReducedMotion ? 0.35 : getOverlayOpacityForStep(activeStep);

  // Gradasi kabut laut halus di bagian bawah yang melebur mulus ke Section Fitur 3D
  const bottomFadeOpacity = isReducedMotion
    ? 1
    : activeStep === 0
    ? 0
    : activeStep === 1
    ? 0.25
    : activeStep === 2
    ? 0.65
    : 1;

  // Petunjuk scroll: jelas di step 0, redup di step 1-3
  const hintOpacity = isReducedMotion ? 0 : activeStep === 0 ? 1 : 0.35;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[280svh] md:h-[300vh] bg-slate-950"
      aria-label="Hero Pelayaran Angkara"
    >
      {/* 4 Scroll Sentinels (Step 0: Video, Step 1-3: Judul 1-3) */}
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex flex-col">
        {Array.from({ length: HERO_STEP_COUNT }).map((_, stepIdx) => (
          <div
            key={stepIdx}
            ref={(el) => {
              sentinelRefs.current[stepIdx] = el;
            }}
            data-hero-step={stepIdx}
            className="w-full flex-1 min-h-[70vh] md:min-h-[75vh]"
          />
        ))}
      </div>

      {/* Sticky Viewport 100svh */}
      <div className="sticky top-0 w-full h-[100svh] overflow-hidden">
        {/* Background Video Laut & Kapal */}
        <HeroVideo step={activeStep} isReducedMotion={isReducedMotion} />

        {/* Gradasi gelap adaptif di area langit untuk kontras teks WCAG AA */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent transition-opacity duration-500 ease-out z-10"
          style={{ opacity: overlayOpacity }}
        />

        {/* Gradasi kabut laut halus di bagian bawah yang melebur mulus ke latar section berikutnya */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 sm:h-96 bg-gradient-to-t from-[hsl(var(--features-bg-top))] via-[hsl(var(--features-bg-top))]/75 via-[hsl(var(--features-bg-top))]/20 to-transparent transition-opacity duration-500 ease-out z-10"
          style={{ opacity: bottomFadeOpacity }}
        />

        {/* Judul & Animasi Typing di Area Langit (30-34% tinggi layar) */}
        <HeroTitle
          step={activeStep}
          isReducedMotion={isReducedMotion}
          onFirstTitleComplete={handleFirstTitleComplete}
        />

        {/* Unified Liquid Glass Navbar dipancarkan ke body agar fixed stabil melintasi seluruh halaman */}
        {typeof document !== "undefined" &&
          createPortal(
            <LiquidNav
              show={hasNavbarShown}
              isReducedMotion={isReducedMotion}
              isInHero={isInHero}
            />,
            document.body
          )}

        {/* Indikator 3 Titik Judul di Bagian Bawah Tengah (Di atas petunjuk scroll) */}
        <div
          className={`absolute bottom-16 sm:bottom-18 left-0 right-0 z-20 flex justify-center pointer-events-none select-none transition-opacity duration-300 ${
            activeStep === 0 ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            {[0, 1, 2].map((idx) => {
              const isActive = activeStep > 0 && activeStep - 1 === idx;
              return (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? "w-6 bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                      : "w-2 bg-white/35"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Petunjuk Gulir Mungil & Halus di Bagian Bawah Viewport */}
        {!isReducedMotion && (
          <div
            className="absolute bottom-5 sm:bottom-6 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none transition-opacity duration-300"
            style={{ opacity: hintOpacity }}
          >
            <div className="flex flex-col items-center justify-center bg-black/25 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
              <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.22em] uppercase text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] mb-0.5">
                Gulir
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/75 animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
