import React from "react";
import { HERO_TITLES } from "./heroStep";
import { getHeroSceneState } from "./useSectionStep";
import { useTypewriter } from "./useTypewriter";

interface HeroTitleProps {
  step: number;
  isReducedMotion: boolean;
  onLine2Start?: () => void;
  onFirstTitleComplete?: () => void;
}

export const HeroTitle: React.FC<HeroTitleProps> = ({
  step,
  isReducedMotion,
  onLine2Start,
  onFirstTitleComplete,
}) => {
  const sceneState = getHeroSceneState(step);
  const activeTitleIndex = sceneState.activeTitleIndex;
  const isTitleActive = sceneState.titleVisible && activeTitleIndex !== null;

  const currentItem =
    activeTitleIndex !== null
      ? HERO_TITLES[activeTitleIndex]
      : HERO_TITLES[0];

  const {
    typedLine1,
    typedLine2,
    showCursor,
    cursorLine,
  } = useTypewriter(
    {
      line1: currentItem.line1,
      line2: currentItem.line2,
    },
    {
      active: isTitleActive,
      msPerChar: isReducedMotion ? 0 : 30, // 30ms per char untuk Hero
      lineDelay: 90,
      fadeOutDuration: 300,
      onLine2Start: () => {
        if (activeTitleIndex === 0 && onLine2Start) {
          onLine2Start();
        }
      },
      onComplete: () => {
        if (activeTitleIndex === 0 && onFirstTitleComplete) {
          onFirstTitleComplete();
        }
      },
    }
  );

  const displayLine1 = isReducedMotion ? (isTitleActive ? currentItem.line1 : "") : typedLine1;
  const displayLine2 = isReducedMotion ? (isTitleActive ? currentItem.line2 : "") : typedLine2;

  return (
    <>
      {/* Aksesibilitas: Satu-satunya h1 semantik di hero untuk SEO/Screen Reader */}
      <h1 className="sr-only">
        Angkara: reservasi kapal wisata Cilacap-Nusakambangan dengan asisten keselamatan AI
      </h1>

      {/* Pengumuman live region saat judul aktif berganti */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isTitleActive ? `${currentItem.line1} ${currentItem.line2}` : ""}
      </div>

      {/* Kontainer visual judul di area langit (tepat di pusat 30-34% tinggi layar) */}
      <div
        aria-hidden="true"
        className={`absolute left-0 right-0 top-[32%] -translate-y-1/2 z-20 flex justify-center px-4 pointer-events-none transition-all duration-300 ease-out ${
          isTitleActive
            ? "opacity-100 blur-0 translate-y-[-50%]"
            : "opacity-0 blur-[8px] translate-y-[-60%]"
        }`}
      >
        <div className="relative text-center w-full max-w-5xl mx-auto">
          {/* Overlapping grid: Placeholder tak terlihat dari ketiga judul untuk menjamin ZERO layout shift */}
          <div className="invisible select-none leading-[1.08] tracking-[-0.035em] font-semibold text-[clamp(2.25rem,5.5vw,5rem)] font-display">
            <div className="sm:whitespace-nowrap">Berlayar lebih tenang.</div>
            <div className="sm:whitespace-nowrap font-medium text-white/70 mt-1 sm:mt-2">
              Cuaca sudah dihitung.
            </div>
          </div>

          {/* Teks animasi aktual yang sedang diketik */}
          <div className="absolute inset-0 select-none leading-[1.08] tracking-[-0.035em] font-semibold text-[clamp(2.25rem,5.5vw,5rem)] font-display drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]">
            {/* Baris 1: Pure White Solid */}
            <div className="sm:whitespace-nowrap text-white">
              {displayLine1}
              {showCursor && cursorLine === 1 && displayLine1.length > 0 && (
                <span className="inline-block w-[2.5px] sm:w-[3px] h-[0.85em] bg-cyan-300/95 shadow-[0_0_8px_rgba(34,211,238,0.7)] ml-1.5 align-middle animate-pulse" />
              )}
            </div>

            {/* Baris 2: White Opacity 0.7 */}
            <div className="sm:whitespace-nowrap text-white/70 font-medium tracking-tight mt-1 sm:mt-2">
              {displayLine2}
              {showCursor && cursorLine === 2 && displayLine2.length > 0 && (
                <span className="inline-block w-[2.5px] sm:w-[3px] h-[0.85em] bg-cyan-300/85 shadow-[0_0_8px_rgba(34,211,238,0.7)] ml-1.5 align-middle animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
