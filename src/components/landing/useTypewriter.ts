import { useState, useEffect, useRef } from "react";

export interface TypewriterText {
  line1: string;
  line2?: string;
}

export interface TypewriterOptions {
  active: boolean;
  msPerChar?: number;
  lineDelay?: number;
  fadeOutDuration?: number;
  onLine2Start?: () => void;
  onComplete?: () => void;
}

export interface TypewriterState {
  typedLine1: string;
  typedLine2: string;
  isTyping: boolean;
  showCursor: boolean;
  cursorLine: 1 | 2;
}

/**
 * Hook useTypewriter yang idempoten dan aman terhadap React 18 StrictMode.
 * Aturan tampilan:
 * 1. Kursor HANYA dirender bila teks sudah diketik > 0 karakter dan belum selesai,
 *    atau maksimal 1,2 dtk setelah selesai.
 * 2. TIDAK PERNAH ada kursor tanpa teks.
 * 3. Saat active berubah ke false, teks tetap tampil selama durasi fade-out (300ms)
 *    sebelum direset ke string kosong.
 */
export function useTypewriter(
  text: TypewriterText,
  options: TypewriterOptions
): TypewriterState {
  const {
    active,
    msPerChar = 30,
    lineDelay = 90,
    fadeOutDuration = 300,
    onLine2Start,
    onComplete,
  } = options;

  const [typedLine1, setTypedLine1] = useState("");
  const [typedLine2, setTypedLine2] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [cursorLine, setCursorLine] = useState<1 | 2>(1);

  // Simpan callback ke ref agar tidak memicu re-running effect bila referensi fungsi berganti
  const onLine2StartRef = useRef(onLine2Start);
  const onCompleteRef = useRef(onComplete);
  onLine2StartRef.current = onLine2Start;
  onCompleteRef.current = onComplete;

  const targetLine1 = text.line1;
  const targetLine2 = text.line2 ?? "";

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    if (!active) {
      // Saat dinonaktifkan: matikan kursor seketika, pertahankan teks sampai fade-out selesai
      setShowCursor(false);
      setIsTyping(false);

      timerId = setTimeout(() => {
        if (!isCancelled) {
          setTypedLine1("");
          setTypedLine2("");
        }
      }, fadeOutDuration);

      return () => {
        isCancelled = true;
        if (timerId !== null) clearTimeout(timerId);
      };
    }

    // Jika aktif: mulai proses pengetikan
    setIsTyping(true);
    setTypedLine1("");
    setTypedLine2("");
    setShowCursor(false); // Kursor mati sampai ada >= 1 karakter
    setCursorLine(1);

    let idx1 = 0;
    let idx2 = 0;
    let hasTriggeredLine2 = false;

    const stepType = () => {
      if (isCancelled) return;

      if (idx1 < targetLine1.length) {
        idx1++;
        const current1 = targetLine1.slice(0, idx1);
        setTypedLine1(current1);
        setShowCursor(true); // Muncul setelah karakter pertama masuk
        setCursorLine(1);
        timerId = setTimeout(stepType, msPerChar);
      } else if (targetLine2 && idx2 < targetLine2.length) {
        if (!hasTriggeredLine2) {
          hasTriggeredLine2 = true;
          if (onLine2StartRef.current) {
            onLine2StartRef.current();
          }
          // Delay jeda antar baris
          timerId = setTimeout(() => {
            stepType();
          }, lineDelay);
          return;
        }

        idx2++;
        const current2 = targetLine2.slice(0, idx2);
        setTypedLine2(current2);
        setShowCursor(true);
        setCursorLine(2);
        timerId = setTimeout(stepType, msPerChar);
      } else {
        // Pengetikan selesai
        setIsTyping(false);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }

        // Kursor bertahan 1.2 detik lalu mati
        timerId = setTimeout(() => {
          if (!isCancelled) {
            setShowCursor(false);
          }
        }, 1200);
      }
    };

    // Mulai tick pertama
    timerId = setTimeout(stepType, msPerChar);

    return () => {
      isCancelled = true;
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [active, targetLine1, targetLine2, msPerChar, lineDelay, fadeOutDuration]);

  return {
    typedLine1,
    typedLine2,
    isTyping,
    showCursor,
    cursorLine,
  };
}
