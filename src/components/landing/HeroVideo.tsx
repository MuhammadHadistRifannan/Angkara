import React, { useRef } from "react";

interface HeroVideoProps {
  progress: number;
  isReducedMotion: boolean;
}

// Skala diperdalam secara sinematik:
// - Zoom in 1.90: sangat dekat dengan badan kapal, detail kemudi dan deburan ombak terlihat jelas
// - Zoom out 1.00: kamera mundur dramatis memperlihatkan bentang samudera luas 100% full-bleed tanpa letterbox
const INITIAL_SCALE = 1.90;
const MIN_SCALE = 1.00;

export const HeroVideo: React.FC<HeroVideoProps> = ({ progress, isReducedMotion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Skala responsif langsung mengikuti posisi dan kecepatan scroll user:
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const scale = isReducedMotion
    ? 1.0
    : INITIAL_SCALE - clampedProgress * (INITIAL_SCALE - MIN_SCALE);

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
            transformOrigin: "50% 74%",
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
