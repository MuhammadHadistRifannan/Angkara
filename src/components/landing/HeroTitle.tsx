import React, { useState, useEffect, useRef } from "react";

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
  const [isUntyping, setIsUntyping] = useState(false);

  // Ref untuk melacak teks aktual terkini agar terhindar dari stale state pada closure timer
  const currentLinesRef = useRef({
    line1: isReducedMotion ? LINE_1 : "",
    line2: isReducedMotion ? LINE_2 : "",
  });

  useEffect(() => {
    currentLinesRef.current = {
      line1: typedLine1,
      line2: typedLine2,
    };
  }, [typedLine1, typedLine2]);

  useEffect(() => {
    if (isReducedMotion) {
      setTypedLine1(isTriggered ? LINE_1 : "");
      setTypedLine2(isTriggered ? LINE_2 : "");
      setShowCursor(false);
      setIsUntyping(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    if (isTriggered) {
      // Mulai pengetikan maju (forward typing)
      setIsUntyping(false);
      setShowCursor(true);

      let idx1 = currentLinesRef.current.line1.length;
      let idx2 = currentLinesRef.current.line2.length;

      const typeForwardLine1 = () => {
        if (isCancelled) return;
        if (idx1 <= LINE_1.length) {
          const slice1 = LINE_1.slice(0, idx1);
          setTypedLine1(slice1);
          currentLinesRef.current.line1 = slice1;
          idx1++;
          timeoutId = setTimeout(typeForwardLine1, 40);
        } else {
          timeoutId = setTimeout(typeForwardLine2, 160);
        }
      };

      const typeForwardLine2 = () => {
        if (isCancelled) return;
        if (idx2 <= LINE_2.length) {
          const slice2 = LINE_2.slice(0, idx2);
          setTypedLine2(slice2);
          currentLinesRef.current.line2 = slice2;
          idx2++;
          timeoutId = setTimeout(typeForwardLine2, 40);
        } else {
          // Selesai pengetikan: sembunyikan kursor setelah 1.2 detik
          timeoutId = setTimeout(() => {
            if (!isCancelled) {
              setShowCursor(false);
            }
          }, 1200);
        }
      };

      if (idx1 < LINE_1.length) {
        timeoutId = setTimeout(typeForwardLine1, 200);
      } else if (idx2 < LINE_2.length) {
        timeoutId = setTimeout(typeForwardLine2, 100);
      } else {
        // Teks sudah lengkap, pastikan state sinkron
        setTypedLine1(LINE_1);
        setTypedLine2(LINE_2);
        setShowCursor(false);
      }
    } else {
      // User scroll ke atas: jalankan animasi pengetikan penutup (backspace / untyping)
      const hasText =
        currentLinesRef.current.line1.length > 0 ||
        currentLinesRef.current.line2.length > 0;

      if (!hasText) {
        setTypedLine1("");
        setTypedLine2("");
        setShowCursor(false);
        setIsUntyping(false);
        return;
      }

      setIsUntyping(true);
      setShowCursor(true);

      const untypeLine2 = () => {
        if (isCancelled) return;
        if (currentLinesRef.current.line2.length > 0) {
          const next = currentLinesRef.current.line2.slice(0, -1);
          setTypedLine2(next);
          currentLinesRef.current.line2 = next;
          timeoutId = setTimeout(untypeLine2, 22);
        } else {
          timeoutId = setTimeout(untypeLine1, 50);
        }
      };

      const untypeLine1 = () => {
        if (isCancelled) return;
        if (currentLinesRef.current.line1.length > 0) {
          const next = currentLinesRef.current.line1.slice(0, -1);
          setTypedLine1(next);
          currentLinesRef.current.line1 = next;
          timeoutId = setTimeout(untypeLine1, 22);
        } else {
          // Untyping selesai sempurna
          setIsUntyping(false);
          setShowCursor(false);
        }
      };

      if (currentLinesRef.current.line2.length > 0) {
        timeoutId = setTimeout(untypeLine2, 40);
      } else if (currentLinesRef.current.line1.length > 0) {
        timeoutId = setTimeout(untypeLine1, 40);
      } else {
        setIsUntyping(false);
        setShowCursor(false);
      }
    }

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isTriggered, isReducedMotion]);

  return (
    <div
      className={`absolute left-0 right-0 top-[26%] md:top-[30%] z-20 flex justify-center px-4 pointer-events-none transition-all duration-700 ease-out ${
        isTriggered || isUntyping || isReducedMotion
          ? "opacity-100 blur-0 translate-y-0"
          : "opacity-0 blur-md translate-y-3"
      }`}
      aria-label={`${LINE_1} ${LINE_2}`}
    >
      <div className="relative text-center w-full max-w-5xl mx-auto">
        {/* Placeholder tak terlihat untuk mencegah layout shift */}
        <div className="invisible select-none leading-[1.1] tracking-[-0.03em] font-semibold text-[clamp(2rem,5.2vw,4.8rem)] text-white font-display">
          <div className="sm:whitespace-nowrap">{LINE_1}</div>
          <div className="sm:whitespace-nowrap font-medium text-white/85 mt-1 sm:mt-1.5">{LINE_2}</div>
        </div>

        {/* Teks animasi aktual yang sedang diketik atau di-untype */}
        <div
          aria-hidden="true"
          className="absolute inset-0 select-none leading-[1.1] tracking-[-0.03em] font-semibold text-[clamp(2rem,5.2vw,4.8rem)] font-display drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]"
        >
          {/* Baris 1: Headline Promise (Solid Pure White) */}
          <div className="sm:whitespace-nowrap text-white">
            {typedLine1}
            {showCursor && typedLine2.length === 0 && (
              <span className="inline-block w-[3px] h-[0.85em] bg-white/95 ml-1.5 align-middle animate-pulse" />
            )}
          </div>

          {/* Baris 2: Functional Reassurance (Nuansa Lembut 85% White + Medium Weight) */}
          <div className="sm:whitespace-nowrap text-white/85 font-medium tracking-tight mt-1 sm:mt-1.5">
            {typedLine2}
            {showCursor && typedLine2.length > 0 && (
              <span className="inline-block w-[3px] h-[0.85em] bg-white/80 ml-1.5 align-middle animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
