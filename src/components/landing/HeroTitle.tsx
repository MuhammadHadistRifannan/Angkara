import React, { useState, useEffect } from "react";

interface HeroTitleProps {
  isTriggered: boolean;
  isReducedMotion: boolean;
}

const LINE_1 = "Berlayar lebih tenang.";
const LINE_2 = "Cuaca sudah dihitung.";

export const HeroTitle: React.FC<HeroTitleProps> = ({ isTriggered, isReducedMotion }) => {
  const [typedLine1, setTypedLine1] = useState(isReducedMotion ? LINE_1 : "");
  const [typedLine2, setTypedLine2] = useState(isReducedMotion ? LINE_2 : "");
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (isReducedMotion) {
      setTypedLine1(LINE_1);
      setTypedLine2(LINE_2);
      setShowCursor(false);
      return;
    }

    if (!isTriggered) {
      // Reset saat user scroll mundur
      setTypedLine1("");
      setTypedLine2("");
      setShowCursor(false);
      return;
    }

    setShowCursor(true);
    let index1 = 0;
    let index2 = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeLine1 = () => {
      if (index1 <= LINE_1.length) {
        setTypedLine1(LINE_1.slice(0, index1));
        index1++;
        timeoutId = setTimeout(typeLine1, 45);
      } else {
        // Jeda singkat sebelum baris kedua
        timeoutId = setTimeout(typeLine2, 180);
      }
    };

    const typeLine2 = () => {
      if (index2 <= LINE_2.length) {
        setTypedLine2(LINE_2.slice(0, index2));
        index2++;
        timeoutId = setTimeout(typeLine2, 45);
      } else {
        // Hilangkan kursor 1.2 detik setelah selesai
        timeoutId = setTimeout(() => {
          setShowCursor(false);
        }, 1200);
      }
    };

    // Mulai pengetikan setelah kontainer selesai fade-in (sekitar 250ms)
    timeoutId = setTimeout(typeLine1, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isTriggered, isReducedMotion]);

  return (
    <div
      className={`absolute left-0 right-0 top-[28%] md:top-[33%] z-20 flex justify-center px-4 pointer-events-none transition-all duration-700 ease-out ${
        isTriggered || isReducedMotion
          ? "opacity-100 blur-0 translate-y-0"
          : "opacity-0 blur-md translate-y-3"
      }`}
      aria-label={`${LINE_1} ${LINE_2}`}
    >
      <div className="relative text-center max-w-4xl mx-auto">
        {/* Placeholder tak terlihat untuk mencegah layout shift */}
        <div className="invisible select-none leading-[1.08] tracking-[-0.03em] font-semibold text-[clamp(2.2rem,6.5vw,5.5rem)] text-white font-display">
          <div>{LINE_1}</div>
          <div>{LINE_2}</div>
        </div>

        {/* Teks animasi aktual yang sedang diketik */}
        <div
          aria-hidden="true"
          className="absolute inset-0 select-none leading-[1.08] tracking-[-0.03em] font-semibold text-[clamp(2.2rem,6.5vw,5.5rem)] text-white font-display drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
        >
          <div>
            {typedLine1}
            {showCursor && typedLine2.length === 0 && (
              <span className="inline-block w-[3px] h-[0.85em] bg-white/90 ml-1.5 align-middle animate-pulse" />
            )}
          </div>
          <div>
            {typedLine2}
            {showCursor && typedLine2.length > 0 && (
              <span className="inline-block w-[3px] h-[0.85em] bg-white/90 ml-1.5 align-middle animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
