import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { useHeroScroll } from "./landing/useHeroScroll";
import { HeroVideo } from "./landing/HeroVideo";
import { HeroTitle } from "./landing/HeroTitle";
import { LiquidNav } from "./landing/LiquidNav";
import { ChevronDown } from "lucide-react";

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { progress, isTitleTriggered, showNavbar, isReducedMotion, isInHero } =
    useHeroScroll(containerRef);

  // Overlay kontras gelap di langit (maks 35%)
  let overlayOpacity = 0;
  let hintOpacity = 1;
  let bottomFadeOpacity = 0;

  if (isReducedMotion) {
    overlayOpacity = 0.35;
    hintOpacity = 0;
    bottomFadeOpacity = 1;
  } else {
    if (progress >= 0.12) {
      overlayOpacity = 0.35;
      hintOpacity = 0;
    } else if (progress > 0.06) {
      const factor = (progress - 0.06) / 0.06;
      overlayOpacity = factor * 0.35;
      hintOpacity = 1 - factor;
    }

    // Gradasi kabut laut halus di bagian bawah yang melebur mulus ke section berikutnya
    if (progress > 0.35) {
      bottomFadeOpacity = Math.min(1, (progress - 0.35) / 0.50);
    }
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[250vh] bg-slate-950"
      aria-label="Hero Pelayaran Angkara"
    >
      {/* Sticky Viewport 100svh */}
      <div className="sticky top-0 w-full h-[100svh] overflow-hidden">
        {/* Background Video Laut & Kapal */}
        <HeroVideo progress={progress} isReducedMotion={isReducedMotion} />

        {/* Gradasi gelap adaptif di area langit untuk kontras teks WCAG AA */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-transparent transition-opacity duration-150 ease-out z-10"
          style={{ opacity: overlayOpacity }}
        />

        {/* Gradasi kabut laut halus di bagian bawah yang melebur mulus ke latar section berikutnya */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 sm:h-96 bg-gradient-to-t from-[hsl(var(--features-bg-top))] via-[hsl(var(--features-bg-top))]/75 via-[hsl(var(--features-bg-top))]/20 to-transparent transition-opacity duration-200 ease-out z-10"
          style={{ opacity: bottomFadeOpacity }}
        />

        {/* Judul & Animasi Typing di Area Langit (30-38% tinggi layar) */}
        <HeroTitle
          isTriggered={isTitleTriggered}
          isReducedMotion={isReducedMotion}
        />

        {/* Unified Liquid Glass Navbar (termasuk Logo) dipancarkan ke body agar fixed stabil melintasi seluruh halaman */}
        {typeof document !== "undefined" &&
          createPortal(
            <LiquidNav
              show={showNavbar}
              isReducedMotion={isReducedMotion}
              isInHero={isInHero}
            />,
            document.body
          )}

        {/* Petunjuk Gulir Mungil & Halus di Awal Viewport */}
        {!isReducedMotion && (
          <div
            className="absolute bottom-5 sm:bottom-6 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none transition-opacity duration-200"
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

