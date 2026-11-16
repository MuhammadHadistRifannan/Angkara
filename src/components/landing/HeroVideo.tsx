import React, { useRef, useState, useEffect } from "react";

interface HeroVideoProps {
  progress: number;
  isReducedMotion: boolean;
}

// Skala diperdalam secara sinematik dengan skala adaptif layar:
// - Desktop (>= 768px): 1.90 (close-up intim pada perahu dan kabin kemudi)
// - Mobile (< 768px): 1.50 (proporsional untuk rasio potret sempit agar kapal tidak tercekik)
// - Akhir zoom-out: 1.00 (100% full-bleed cakrawala laut lepas tanpa letterbox)
const DESKTOP_INITIAL_SCALE = 1.90;
const MOBILE_INITIAL_SCALE = 1.50;
const MIN_SCALE = 1.00;

export const HeroVideo: React.FC<HeroVideoProps> = ({ progress, isReducedMotion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const initialScale = isMobile ? MOBILE_INITIAL_SCALE : DESKTOP_INITIAL_SCALE;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const scale = isReducedMotion
    ? 1.0
    : initialScale - clampedProgress * (initialScale - MIN_SCALE);

  const origin = isMobile ? "50% 70%" : "50% 74%";

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-900 select-none">
      {isReducedMotion ? (
        <img
          src="/hero/poster.webp"
          alt="Kapal Wisata di Perairan Cilacap"
          className="w-full h-full object-cover object-[50%_74%]"
          fetchPriority="high"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero/poster.webp"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: origin,
          }}
          className="w-full h-full object-cover object-[50%_74%] will-change-transform transition-transform duration-100 ease-out"
        >
          <source src="/hero/hero.mp4" type="video/mp4" />
          <source src="/hero/hero.webm" type="video/webm" />
        </video>
      )}

      {/* Lapisan noise/grain halus (opacity 0.04) untuk menyamarkan upscaling video 720p */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
