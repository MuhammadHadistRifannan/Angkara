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
          preload="metadata"
          poster="/hero/poster.webp"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: origin,
          }}
          className="w-full h-full object-cover will-change-transform transition-transform duration-100 ease-out"
        >
          <source src="/hero/hero.webm" type="video/webm" />
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
};
