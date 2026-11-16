import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { useHeroScroll } from "./landing/useHeroScroll";
import { HeroVideo } from "./landing/HeroVideo";
import { HeroTitle } from "./landing/HeroTitle";
import { LiquidNav } from "./landing/LiquidNav";
import { BrandLogo } from "./landing/BrandLogo";
import { ChevronDown } from "lucide-react";

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { progress, isTitleTriggered, showNavbar, isReducedMotion, isInHero } =
    useHeroScroll(containerRef);

  // Overlay kontras gelap di langit (maks 35%)
  let overlayOpacity = 0;
  let hintOpacity = 1;

  if (isReducedMotion) {
    overlayOpacity = 0.35;
    hintOpacity = 0;
  } else if (progress >= 0.12) {
    overlayOpacity = 0.35;
    hintOpacity = 0;
  } else if (progress > 0.06) {
    const factor = (progress - 0.06) / 0.06;
    overlayOpacity = factor * 0.35;
    hintOpacity = 1 - factor;
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

        {/* Judul & Animasi Typing di Area Langit (30-38% tinggi layar) */}
        <HeroTitle
          isTriggered={isTitleTriggered}
          isReducedMotion={isReducedMotion}
        />

        {/* Brand Logo & Liquid Glass Navbar dipancarkan ke body agar fixed stabil melintasi seluruh halaman */}
        {typeof document !== "undefined" &&
          createPortal(
            <>
              <BrandLogo isInHero={isInHero} />
              <LiquidNav
                show={showNavbar}
                isReducedMotion={isReducedMotion}
                isInHero={isInHero}
              />
            </>,
            document.body
          )}

        {/* Petunjuk Gulir Mungil & Halus di Awal Viewport */}
        {!isReducedMotion && (
          <div
            className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none transition-opacity duration-200"
            style={{ opacity: hintOpacity }}
          >
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] mb-1">
              Gulir
            </span>
            <ChevronDown className="w-4 h-4 text-white/60 animate-bounce" />
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;

