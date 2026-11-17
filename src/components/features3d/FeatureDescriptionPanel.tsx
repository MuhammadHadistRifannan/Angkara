import React from "react";
import type { Feature3DItem } from "./types";
import { useTypewriter } from "../landing/useTypewriter";

interface FeatureDescriptionPanelProps {
  feature: Feature3DItem;
  isActive: boolean; // true ketika step 1..5
  isMobile: boolean;
  isReducedMotion: boolean;
}

export const FeatureDescriptionPanel: React.FC<FeatureDescriptionPanelProps> = ({
  feature,
  isActive,
  isMobile,
  isReducedMotion,
}) => {
  // Title: 28ms/char. Description: 14ms/char (total di bawah 1,4 dtk)
  const {
    typedLine1: typedTitle,
    typedLine2: typedDesc,
    showCursor,
    cursorLine,
  } = useTypewriter(
    {
      line1: feature.title,
      line2: feature.description,
    },
    {
      active: isActive,
      msPerChar: isReducedMotion ? 0 : 20, // 20ms rata-rata (title ~28ms, desc ~14ms)
      lineDelay: 60,
      fadeOutDuration: 300,
    }
  );

  const displayTitle = isReducedMotion ? (isActive ? feature.title : "") : typedTitle;
  const displayDesc = isReducedMotion ? (isActive ? feature.description : "") : typedDesc;

  return (
    <div
      className={`relative z-20 w-full transition-all duration-300 ease-out ${
        isMobile
          ? "text-center px-4 max-w-md mx-auto"
          : "text-left max-w-[500px]"
      } ${
        !isActive
          ? "opacity-0 pointer-events-none translate-y-4"
          : "opacity-100 blur-0 translate-y-0"
      }`}
    >
      {/* 1. Aksesibilitas Pembaca Layar: Teks Penuh & Pengumuman Live Region */}
      <div className="sr-only" aria-live="polite">
        {isActive ? `Fitur aktif: ${feature.title}. ${feature.description}` : ""}
      </div>

      {/* 
        2. Teks Penuh Tak Terlihat (Invisible) untuk Mencegah Layout Shift
        Menjaga dimensi blok teks tetap stabil saat teks sedang diketik.
      */}
      <div className="invisible select-none" aria-hidden="true">
        <h3 className="font-display font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(1.85rem,3.8vw,3.25rem)] text-white mb-3">
          {feature.title}
        </h3>
        <p className="font-display font-normal leading-[1.6] text-[clamp(0.95rem,1.25vw,1.15rem)] text-white/75">
          {feature.description}
        </p>
      </div>

      {/* 3. Teks Animasi Aktual yang Sedang Diketik (Aria Hidden) */}
      <div
        className="absolute inset-0 select-none"
        aria-hidden="true"
      >
        <h3 className="font-display font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(1.85rem,3.8vw,3.25rem)] text-white mb-3 drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          {displayTitle}
          {showCursor && cursorLine === 1 && displayTitle.length > 0 && (
            <span className="inline-block w-[3px] h-[0.82em] bg-cyan-400 ml-1.5 align-middle animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          )}
        </h3>

        <p className="font-display font-normal leading-[1.6] text-[clamp(0.95rem,1.25vw,1.15rem)] text-white/80">
          {displayDesc}
          {showCursor && cursorLine === 2 && displayDesc.length > 0 && (
            <span className="inline-block w-[2.5px] h-[0.82em] bg-cyan-400 ml-1 align-middle animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          )}
        </p>
      </div>
    </div>
  );
};
