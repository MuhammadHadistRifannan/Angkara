import React, { useState, useEffect, useRef } from "react";
import { HERO_TITLES, getTitleIndexForStep } from "./heroStep";
import { runHeroTypingAnimation, CancelAnimation } from "./heroTypingController";

interface HeroTitleProps {
  step: number;
  isReducedMotion: boolean;
  onFirstTitleComplete?: () => void;
}

export const HeroTitle: React.FC<HeroTitleProps> = ({
  step,
  isReducedMotion,
  onFirstTitleComplete,
}) => {
  const targetTitleIndex = getTitleIndexForStep(step);

  // Index judul yang sedang aktif dirender
  const [activeTitleIndex, setActiveTitleIndex] = useState<number | null>(() => {
    return isReducedMotion ? targetTitleIndex : null;
  });

  // Animasi fade in/out state
  const [fadeState, setFadeState] = useState<"visible" | "fading-in" | "fading-out" | "hidden">(
    targetTitleIndex === null ? "hidden" : "visible"
  );

  const [typedLine1, setTypedLine1] = useState("");
  const [typedLine2, setTypedLine2] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const [cursorLine, setCursorLine] = useState<1 | 2>(1);
  const [announcedText, setAnnouncedText] = useState("");

  const cancelTypingRef = useRef<CancelAnimation | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTitleIndexRef = useRef<number | null>(activeTitleIndex);

  useEffect(() => {
    activeTitleIndexRef.current = activeTitleIndex;
  }, [activeTitleIndex]);

  useEffect(() => {
    // Bersihkan semua animasi yang sedang berjalan saat step berubah
    if (cancelTypingRef.current) {
      cancelTypingRef.current();
      cancelTypingRef.current = null;
    }
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (cursorTimerRef.current) {
      clearTimeout(cursorTimerRef.current);
      cursorTimerRef.current = null;
    }

    if (isReducedMotion) {
      setActiveTitleIndex(targetTitleIndex);
      if (targetTitleIndex !== null) {
        const item = HERO_TITLES[targetTitleIndex];
        setTypedLine1(item.line1);
        setTypedLine2(item.line2);
        setFadeState("visible");
        setShowCursor(false);
        setAnnouncedText(`${item.line1} ${item.line2}`);
        if (targetTitleIndex === 0 && onFirstTitleComplete) {
          onFirstTitleComplete();
        }
      } else {
        setTypedLine1("");
        setTypedLine2("");
        setFadeState("hidden");
        setShowCursor(false);
      }
      return;
    }

    // Step 0: Kembali ke video bersih
    if (targetTitleIndex === null) {
      if (activeTitleIndexRef.current !== null) {
        setFadeState("fading-out");
        setShowCursor(false);
        exitTimerRef.current = setTimeout(() => {
          setActiveTitleIndex(null);
          setTypedLine1("");
          setTypedLine2("");
          setFadeState("hidden");
        }, 350);
      }
      return;
    }

    // Fungsi untuk memulai fade in dan typing judul target
    const startNewTitle = (index: number) => {
      setActiveTitleIndex(index);
      setFadeState("fading-in");
      setShowCursor(true);
      setCursorLine(1);

      const item = HERO_TITLES[index];
      setAnnouncedText(`${item.line1} ${item.line2}`);

      // Kecepatan: Judul 1 (40ms), Judul 2 & 3 (32ms) agar total pergantian < 2.2 detik
      const charDelay = index === 0 ? 40 : 32;

      cancelTypingRef.current = runHeroTypingAnimation({
        line1: item.line1,
        line2: item.line2,
        charDelay,
        lineDelay: 100,
        initialDelay: 120,
        onUpdate: ({ line1, line2 }) => {
          setTypedLine1(line1);
          setTypedLine2(line2);
          setCursorLine(line2.length > 0 ? 2 : 1);
        },
        onComplete: () => {
          if (index === 0 && onFirstTitleComplete) {
            onFirstTitleComplete();
          }
          // Kursor berkedip 1.2 detik lalu menghilang halus
          cursorTimerRef.current = setTimeout(() => {
            setShowCursor(false);
          }, 1200);
        },
      });
    };

    // Jika sudah ada judul yang tampil dan berbeda dengan target
    if (activeTitleIndexRef.current !== null && activeTitleIndexRef.current !== targetTitleIndex) {
      setFadeState("fading-out");
      setShowCursor(false);
      exitTimerRef.current = setTimeout(() => {
        startNewTitle(targetTitleIndex);
      }, 350);
    } else {
      // Judul pertama kali muncul dari Step 0
      startNewTitle(targetTitleIndex);
    }

    return () => {
      if (cancelTypingRef.current) {
        cancelTypingRef.current();
        cancelTypingRef.current = null;
      }
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      if (cursorTimerRef.current) {
        clearTimeout(cursorTimerRef.current);
        cursorTimerRef.current = null;
      }
    };
  }, [targetTitleIndex, isReducedMotion, onFirstTitleComplete]);

  // Styling transisi berbasis state
  let motionClasses = "opacity-0 blur-md translate-y-3 pointer-events-none";
  if (isReducedMotion) {
    motionClasses = activeTitleIndex !== null ? "opacity-100 transition-opacity duration-200" : "opacity-0 pointer-events-none";
  } else {
    if (fadeState === "visible" || fadeState === "fading-in") {
      motionClasses = "opacity-100 blur-0 translate-y-0 transition-all duration-600 ease-out";
    } else if (fadeState === "fading-out") {
      motionClasses = "opacity-0 blur-[10px] -translate-y-4 transition-all duration-350 ease-in pointer-events-none";
    } else {
      motionClasses = "opacity-0 blur-md translate-y-3 pointer-events-none";
    }
  }

  return (
    <>
      {/* Aksesibilitas: Satu-satunya h1 semantik di hero untuk SEO/Screen Reader */}
      <h1 className="sr-only">
        Angkara: reservasi kapal wisata Cilacap-Nusakambangan dengan asisten keselamatan AI
      </h1>

      {/* Pengumuman live region saat judul aktif berganti */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcedText}
      </div>

      {/* Kontainer visual judul di area langit (30-34% tinggi layar) */}
      <div
        aria-hidden="true"
        className={`absolute left-0 right-0 top-[22%] sm:top-[26%] md:top-[30%] z-20 flex justify-center px-4 pointer-events-none ${motionClasses}`}
      >
        <div className="relative text-center w-full max-w-5xl mx-auto">
          {/* Overlapping grid: Placeholder tak terlihat dari ketiga judul untuk menjamin ZERO layout shift */}
          <div className="invisible select-none leading-[1.1] tracking-[-0.03em] font-semibold text-[clamp(2rem,5.2vw,4.8rem)] font-display">
            <div className="sm:whitespace-nowrap">Berlayar lebih tenang.</div>
            <div className="sm:whitespace-nowrap font-medium text-white/70 mt-1 sm:mt-1.5">
              Cuaca sudah dihitung.
            </div>
          </div>

          {/* Teks animasi aktual yang sedang diketik */}
          <div className="absolute inset-0 select-none leading-[1.1] tracking-[-0.03em] font-semibold text-[clamp(2rem,5.2vw,4.8rem)] font-display drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]">
            {/* Baris 1: Pure White Solid */}
            <div className="sm:whitespace-nowrap text-white">
              {typedLine1}
              {showCursor && cursorLine === 1 && (
                <span className="inline-block w-[2.5px] sm:w-[3px] h-[0.85em] bg-cyan-300/95 shadow-[0_0_8px_rgba(34,211,238,0.7)] ml-1.5 align-middle animate-pulse" />
              )}
            </div>

            {/* Baris 2: White Opacity 0.7 */}
            <div className="sm:whitespace-nowrap text-white/70 font-medium tracking-tight mt-1 sm:mt-1.5">
              {typedLine2}
              {showCursor && cursorLine === 2 && (
                <span className="inline-block w-[2.5px] sm:w-[3px] h-[0.85em] bg-cyan-300/85 shadow-[0_0_8px_rgba(34,211,238,0.7)] ml-1.5 align-middle animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
