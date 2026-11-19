import React, { useRef, useState, useEffect, useMemo } from "react";
import { buildWavePath } from "./waveMath";
import { Mascot } from "@/components/illustrations/Mascot";

export interface WaveDividerProps {
  /**
   * Warna lapisan depan utama (fallback jika 'to' tidak disediakan)
   */
  fill?: string;
  /**
   * Nama variabel CSS atau warna latar seksi asal di atasnya (mis. '--section-features-bg')
   */
  from?: string;
  /**
   * Nama variabel CSS atau warna latar seksi tujuan di bawahnya (mis. '--section-why-bg')
   */
  to?: string;
  /**
   * Warna dasar lapisan gelombang belakang & tengah (opsional, jika kosong dihitung otomatis via color-mix)
   */
  tone?: string;
  /**
   * Apakah pembatas dibalik menghadap ke atas
   */
  flip?: boolean;
  /**
   * Tinggi pembatas gelombang (default: clamp(80px, 12vw, 180px))
   */
  height?: string;
  /**
   * Menampilkan perahu kecil Si Suar yang bergoyang di atas ombak (bonus)
   */
  showBoat?: boolean;
  className?: string;
}

const SVG_WIDTH = 2880; // Lebar ganda 200% untuk seamless translateX(-50%)
const SVG_HEIGHT = 160;

function resolveCssColor(val?: string, fallback = "currentColor"): string {
  if (!val) return fallback;
  if (val.startsWith("--")) return `var(${val})`;
  return val;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({
  fill,
  from,
  to,
  tone,
  flip = false,
  height = "clamp(80px, 12vw, 180px)",
  showBoat = true,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Deteksi reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver untuk mematikan animasi saat di luar viewport (hemat daya GPU)
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "100px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 1. Lapisan Belakang (Amplitudo terbesar 24px, 2 periode per paruh, fase 0, durasi 26s)
  const pathBack = useMemo(
    () =>
      buildWavePath({
        width: SVG_WIDTH,
        height: SVG_HEIGHT,
        amplitude: 24,
        periods: 2,
        phase: 0,
        baseHeight: flip ? 65 : 75,
        flip,
      }),
    [flip]
  );

  // 2. Lapisan Tengah (Amplitudo 18px, 3 periode per paruh, fase 1.4, durasi 18s berlawanan arah)
  const pathMid = useMemo(
    () =>
      buildWavePath({
        width: SVG_WIDTH,
        height: SVG_HEIGHT,
        amplitude: 18,
        periods: 3,
        phase: 1.4,
        baseHeight: flip ? 80 : 90,
        flip,
      }),
    [flip]
  );

  // 3. Lapisan Depan (Amplitudo 14px, 2 periode per paruh, fase 2.8, warna fill persis seksi tujuan, durasi 11s)
  const pathFront = useMemo(
    () =>
      buildWavePath({
        width: SVG_WIDTH,
        height: SVG_HEIGHT,
        amplitude: 14,
        periods: 2,
        phase: 2.8,
        baseHeight: flip ? 95 : 105,
        flip,
      }),
    [flip]
  );

  const shouldAnimate = isInView && !isReducedMotion;

  const toColor = resolveCssColor(to || fill, "var(--section-to-bg, #F8FAFC)");
  const fromColor = resolveCssColor(from, "var(--section-from-bg, transparent)");
  const midColor = tone
    ? resolveCssColor(tone)
    : `color-mix(in srgb, ${toColor} 60%, ${fromColor} 40%)`;
  const backColor = tone
    ? resolveCssColor(tone)
    : `color-mix(in srgb, ${toColor} 35%, ${fromColor} 65%)`;

  return (
    <div
      ref={containerRef}
      role="presentation"
      aria-hidden="true"
      className={`relative w-full overflow-hidden leading-none select-none pointer-events-none -mb-px -mt-px ${className}`}
      style={{
        height,
      }}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* LAPISAN 1: GELOMBANG BELAKANG (26s, Lambat, Opacity 0.35, disembunyikan di layar < 768px untuk performa) */}
        <div
          className="hidden md:block absolute inset-0 w-[200%] h-full will-change-transform"
          style={{
            animation: shouldAnimate
              ? "suar-wave-flow-left 26s linear infinite, suar-wave-bob-1 6s ease-in-out infinite alternate"
              : "none",
            animationPlayState: shouldAnimate ? "running" : "paused",
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full block"
          >
            <path d={pathBack} fill={backColor} opacity={0.4} />
          </svg>
        </div>

        {/* LAPISAN 2: GELOMBANG TENGAH (18s, Arah Berlawanan, Opacity 0.6) */}
        <div
          className="absolute inset-0 w-[200%] h-full will-change-transform"
          style={{
            animation: shouldAnimate
              ? "suar-wave-flow-right 18s linear infinite, suar-wave-bob-2 5.5s ease-in-out infinite alternate"
              : "none",
            animationPlayState: shouldAnimate ? "running" : "paused",
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full block"
          >
            <path d={pathMid} fill={midColor} opacity={0.65} />
          </svg>
        </div>

        {/* BONUS: Perahu Kecil Si Suar yang Bergoyang di Gelombang Tengah (Posisi kiri ~18%) */}
        {showBoat && (
          <div
            className="absolute left-[16%] sm:left-[18%] bottom-[25%] sm:bottom-[30%] z-10 pointer-events-none transition-transform"
            style={{
              animation: shouldAnimate
                ? "suar-boat-rock 5s ease-in-out infinite alternate"
                : "none",
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Si Suar di atas perahu */}
              <div className="transform scale-75 -mb-2">
                <Mascot mood="wave" size={48} animate={shouldAnimate} />
              </div>
              {/* Perahu Kayu Kecil Mungil */}
              <svg width="44" height="16" viewBox="0 0 44 16" fill="none">
                <path
                  d="M2 3 L42 3 L34 14 L10 14 Z"
                  fill="#E76F51"
                  stroke="#0F172A"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <line x1="8" y1="3" x2="36" y2="3" stroke="#FFEAD0" strokeWidth="1.5" />
                <rect x="20" y="0" width="4" height="4" fill="#FBBF24" />
              </svg>
            </div>
          </div>
        )}

        {/* LAPISAN 3: GELOMBANG DEPAN (11s, Cepat, Opacity 1.0, Warna Persis Seksi Tujuan) */}
        <div
          className="absolute inset-0 w-[200%] h-full will-change-transform z-20"
          style={{
            animation: shouldAnimate
              ? "suar-wave-flow-left 11s linear infinite, suar-wave-bob-3 4.5s ease-in-out infinite alternate"
              : "none",
            animationPlayState: shouldAnimate ? "running" : "paused",
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-full block"
          >
            <path d={pathFront} fill={toColor} />
          </svg>
        </div>
      </div>

      {/* Global CSS Keyframes untuk Seamless Wave Loop & Bobbing */}
      <style>{`
        @keyframes suar-wave-flow-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes suar-wave-flow-right {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes suar-wave-bob-1 {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(6px);
          }
        }
        @keyframes suar-wave-bob-2 {
          0% {
            transform: translateY(4px);
          }
          100% {
            transform: translateY(-2px);
          }
        }
        @keyframes suar-wave-bob-3 {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(3px);
          }
        }
        @keyframes suar-boat-rock {
          0% {
            transform: translateY(-2px) rotate(-3deg);
          }
          50% {
            transform: translateY(2px) rotate(2deg);
          }
          100% {
            transform: translateY(-3px) rotate(-2deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .will-change-transform {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WaveDivider;
