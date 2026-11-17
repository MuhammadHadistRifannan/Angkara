import { useEffect, useRef } from "react";

export const SNAP_ASSIST = true;

interface SnapAssistOptions {
  enabled?: boolean;
  containerRef: React.RefObject<HTMLElement>;
  sentinelCount: number;
  pauseMs?: number;
}

/**
 * Snap Assist khusus desktop:
 * Bila scroll berhenti 140 ms di dalam area pin section,
 * lakukan scroll halus ke tengah sentinel terdekat.
 * Dibatalkan bila pengguna menggulir lagi.
 * Nonaktif di layar sentuh (touchscreen) dan prefers-reduced-motion.
 */
export function useSnapAssist({
  enabled = SNAP_ASSIST,
  containerRef,
  sentinelCount,
  pauseMs = 140,
}: SnapAssistOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProgrammaticScrollRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Cek apakah touchscreen atau prefers-reduced-motion
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouch || prefersReducedMotion) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) {
        return;
      }

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrollY = window.scrollY;

        // Hanya aktif jika viewport saat ini berada di dalam container pin
        if (rect.top > 0 || rect.bottom < vh) {
          return;
        }

        const containerTop = scrollY + rect.top;
        const sentinelHeight = rect.height / sentinelCount;
        const currentCenter = scrollY + vh / 2;

        // Cari sentinel yang paling dekat dengan viewport center
        const relativeCenter = currentCenter - containerTop;
        const closestIndex = Math.max(
          0,
          Math.min(
            sentinelCount - 1,
            Math.round((relativeCenter - sentinelHeight / 2) / sentinelHeight)
          )
        );

        // Posisi target agar sentinel berada tepat di tengah viewport
        const targetScrollY =
          containerTop +
          closestIndex * sentinelHeight +
          sentinelHeight / 2 -
          vh / 2;

        // Batasi jarak snap agar tidak menyentak jika sudah dekat (< 12px)
        if (Math.abs(scrollY - targetScrollY) > 12 && Math.abs(scrollY - targetScrollY) < sentinelHeight * 0.45) {
          isProgrammaticScrollRef.current = true;
          window.scrollTo({
            top: targetScrollY,
            behavior: "smooth",
          });

          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 450);
        }
      }, pauseMs);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, containerRef, sentinelCount, pauseMs]);
}
