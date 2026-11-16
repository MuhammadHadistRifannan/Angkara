import React, { useRef, useState, useEffect } from "react";

interface HeroVideoProps {
  progress: number;
  isReducedMotion: boolean;
}

const INITIAL_SCALE = 1.25;
const MIN_SCALE = 1.0;

export const HeroVideo: React.FC<HeroVideoProps> = ({ progress, isReducedMotion }) => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);

  // Skala responsif langsung mengikuti posisi dan kecepatan scroll user:
  // 1.25 (zoom dekat kapal saat di puncak) -> 1.00 (zoom out laut luas saat scroll ke bawah)
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const scale = isReducedMotion
    ? 1.0
    : INITIAL_SCALE - clampedProgress * (INITIAL_SCALE - MIN_SCALE);

  // Crossfade bergantian 600ms sebelum klip berakhir
  useEffect(() => {
    if (isReducedMotion) return;

    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    const CROSSFADE_THRESHOLD = 0.65; // detik sebelum akhir

    const handleTime1 = () => {
      if (v1.duration && v1.currentTime >= v1.duration - CROSSFADE_THRESHOLD) {
        if (activeVideo === 1) {
          v2.currentTime = 0;
          v2.play().catch(() => {});
          setActiveVideo(2);
        }
      }
    };

    const handleTime2 = () => {
      if (v2.duration && v2.currentTime >= v2.duration - CROSSFADE_THRESHOLD) {
        if (activeVideo === 2) {
          v1.currentTime = 0;
          v1.play().catch(() => {});
          setActiveVideo(1);
        }
      }
    };

    v1.addEventListener("timeupdate", handleTime1);
    v2.addEventListener("timeupdate", handleTime2);

    return () => {
      v1.removeEventListener("timeupdate", handleTime1);
      v2.removeEventListener("timeupdate", handleTime2);
    };
  }, [activeVideo, isReducedMotion]);

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
          <>
            <video
              ref={video1Ref}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/hero/poster.webp"
              className={`absolute inset-0 w-full h-full object-cover object-[50%_65%] transition-opacity duration-700 ease-in-out ${
                activeVideo === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <source src="/hero/hero.mp4" type="video/mp4" />
              <source src="/hero/hero.webm" type="video/webm" />
            </video>

            <video
              ref={video2Ref}
              muted
              playsInline
              preload="auto"
              poster="/hero/poster.webp"
              className={`absolute inset-0 w-full h-full object-cover object-[50%_65%] transition-opacity duration-700 ease-in-out ${
                activeVideo === 2 ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <source src="/hero/hero.mp4" type="video/mp4" />
              <source src="/hero/hero.webm" type="video/webm" />
            </video>
          </>
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
