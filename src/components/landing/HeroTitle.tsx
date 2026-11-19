import React, { useState, useEffect, useRef } from "react";
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
  const targetIndex = sceneState.activeTitleIndex;
  const targetVisible = sceneState.titleVisible && targetIndex !== null;

  // Title yang sedang ditampilkan di DOM
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(
    targetVisible ? targetIndex : null
  );
  const [forceComplete, setForceComplete] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Refs untuk tracking state dalam timer async tanpa closure stale
  const targetIndexRef = useRef(targetIndex);
  const targetVisibleRef = useRef(targetVisible);
  const isTypingRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  targetIndexRef.current = targetIndex;
  targetVisibleRef.current = targetVisible;

  const currentItem =
    displayedIndex !== null
      ? HERO_TITLES[displayedIndex]
      : HERO_TITLES[0];

  const isCurrentActive = displayedIndex !== null && !isFadingOut;

  const {
    typedLine1,
    typedLine2,
    isTyping,
    showCursor,
    cursorLine,
  } = useTypewriter(
    {
      line1: currentItem.line1,
      line2: currentItem.line2,
    },
    {
      active: displayedIndex !== null,
      forceComplete,
      msPerChar: isReducedMotion ? 0 : 16, // 16ms per char: judul tampil cepat
      lineDelay: 60,
      fadeOutDuration: 300,
      onLine2Start: () => {
        if (displayedIndex === 0 && onLine2Start) {
          onLine2Start();
        }
      },
      onComplete: () => {
        if (displayedIndex === 0 && onFirstTitleComplete) {
          onFirstTitleComplete();
        }
      },
    }
  );

  isTypingRef.current = isTyping;

  // Watcher perubahan step scroll
  useEffect(() => {
    // Jika target sama dengan yang sedang ditampilkan, tidak perlu transisi
    if (targetIndex === displayedIndex) {
      return;
    }

    // Kasus 1: Belum ada title yang tampil (misal dari Step 0 -> Step 1)
    if (displayedIndex === null) {
      if (targetVisible && targetIndex !== null) {
        setDisplayedIndex(targetIndex);
        setForceComplete(false);
        setIsFadingOut(false);
      }
      return;
    }

    // Kasus 2: Ada perpindahan step saat title sedang ditampilkan
    // Batalkan timer transisi sebelumnya jika ada (agar langsung menuju step terbaru tanpa antrean)
    if (transitionTimerRef.current !== null) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    // Cek apakah animasi pengetikan title saat ini masih berjalan
    const wasTyping = isTypingRef.current;

    const performFadeAndSwitch = () => {
      // 1. Fade out title saat ini
      setIsFadingOut(true);

      transitionTimerRef.current = setTimeout(() => {
        const nextIndex = targetIndexRef.current;
        const nextVisible = targetVisibleRef.current;

        setDisplayedIndex(nextVisible ? nextIndex : null);
        setForceComplete(false);
        setIsFadingOut(false);
        transitionTimerRef.current = null;
      }, 300); // 300ms durasi fade-out
    };

    if (wasTyping) {
      // Sesuai permintaan pengguna:
      // "ketika discroll dan title teks belum muncul semua tetapi animasi typing masih berjalan,
      // aku ingin agar munculkan full teks title, lalu baru berganti ke title selanjutnya"
      setForceComplete(true);

      // Tahan teks penuh singkat (150ms) sebelum berganti
      transitionTimerRef.current = setTimeout(() => {
        performFadeAndSwitch();
      }, 150);
    } else {
      // Jika pengetikan sudah selesai sebelumnya, langsung lakukan fade out dan ganti title
      performFadeAndSwitch();
    }

    return () => {
      if (transitionTimerRef.current !== null) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [targetIndex, targetVisible, displayedIndex]);

  const displayLine1 = isReducedMotion ? (isCurrentActive ? currentItem.line1 : "") : typedLine1;
  const displayLine2 = isReducedMotion ? (isCurrentActive ? currentItem.line2 : "") : typedLine2;

  return (
    <>
      {/* Aksesibilitas: Satu-satunya h1 semantik di hero untuk SEO/Screen Reader */}
      <h1 className="sr-only">
        Suar: reservasi kapal wisata Cilacap-Nusakambangan dengan asisten keselamatan AI
      </h1>

      {/* Pengumuman live region saat judul aktif berganti */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isCurrentActive ? `${currentItem.line1} ${currentItem.line2}` : ""}
      </div>

      {/* Kontainer visual judul di hero (center aligned) */}
      <div
        aria-hidden="true"
        className={`relative z-20 flex justify-center w-full max-w-5xl mx-auto px-4 pointer-events-none transition-all duration-300 ease-out ${
          isCurrentActive
            ? "opacity-100 blur-0 translate-y-0"
            : "opacity-0 blur-[8px] -translate-y-4"
        }`}
      >
        <div className="relative text-center w-full mx-auto">
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
