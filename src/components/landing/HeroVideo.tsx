import React, { useRef } from "react";
import { getVideoScaleForStep } from "./heroStep";

interface HeroVideoProps {
  step: number;
  isReducedMotion: boolean;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({ step, isReducedMotion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Skala bertahap per step (1.00 -> 1.03 -> 1.06 -> 1.09)
  const scale = isReducedMotion ? 1.0 : getVideoScaleForStep(step);

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-900 select-none">
      {isReducedMotion ? (
        <img
          src="/hero/poster.webp"
          alt="Kapal Wisata di Perairan Cilacap"
          className="w-full h-full object-cover object-[50%_75%]"
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
            transformOrigin: "50% 75%",
            transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          className="w-full h-full object-cover object-[50%_75%] will-change-transform"
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
