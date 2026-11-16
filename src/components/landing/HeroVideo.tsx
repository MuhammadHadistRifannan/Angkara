import React, { useRef } from "react";

interface HeroVideoProps {
  progress: number;
  isReducedMotion: boolean;
}

const INITIAL_SCALE = 1.25;
const MIN_SCALE = 1.0;

export const HeroVideo: React.FC<HeroVideoProps> = ({ progress, isReducedMotion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Skala responsif langsung mengikuti posisi dan kecepatan scroll user:
  // 1.25 (zoom dekat kapal saat di puncak) -> 1.00 (zoom out laut luas saat scroll ke bawah)
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const scale = isReducedMotion
    ? 1.0
    : INITIAL_SCALE - clampedProgress * (INITIAL_SCALE - MIN_SCALE);

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-900 select-none">
      <div
        className="w-full h-full will-change-transform transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "50% 65%",
        }}
      >
        {isReducedMotion ? (
          <img
            src="/hero/poster.webp"
            alt="Kapal Wisata di Perairan Cilacap"
            className="w-full h-full object-cover object-[50%_65%]"
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
            className="absolute inset-0 w-full h-full object-cover object-[50%_65%]"
          >
            <source src="/hero/hero.mp4" type="video/mp4" />
            <source src="/hero/hero.webm" type="video/webm" />
          </video>
        )}
      </div>

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
