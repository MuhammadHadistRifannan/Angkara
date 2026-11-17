import React, { useRef, useState, useEffect } from "react";
import { calculateZoomOutScale, getVideoScaleForStep } from "./heroStep";

interface HeroVideoProps {
  progress?: number;
  step?: number;
  isReducedMotion: boolean;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({
  progress,
  step = 0,
  isReducedMotion,
}) => {
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

  // Default saat buka halaman (progress 0 / step 0): DEEP ZOOM IN (1.90 desktop / 1.50 mobile)
  // Saat digulir ke bawah: kamera mundur dramatis memperlihatkan bentang samudera luas hingga 1.00
  const scale =
    progress !== undefined
      ? calculateZoomOutScale(progress, isMobile, isReducedMotion)
      : isReducedMotion
      ? 1.0
      : getVideoScaleForStep(step, isMobile);

  const origin = isMobile ? "50% 70%" : "50% 74%";

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-900 select-none">
      {isReducedMotion ? (
        <img
          src="/hero/poster.webp"
          alt="Kapal Wisata di Perairan Cilacap"
          className="w-full h-full object-cover"
          style={{ objectPosition: origin }}
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
          className="w-full h-full object-cover will-change-transform transition-transform duration-100 ease-out"
        >
          <source src="/hero/hero.mp4" type="video/mp4" />
          <source src="/hero/hero.webm" type="video/webm" />
        </video>
      )}

      {/* Lapisan noise/grain halus (opacity 0.04) untuk menyamarkan upscaling video */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
