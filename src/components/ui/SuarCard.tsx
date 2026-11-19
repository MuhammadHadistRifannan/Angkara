import React, { useState, useRef, useEffect } from "react";
import {
  type SuarCardColor,
  getContrastThemeForColor,
} from "./suarCardTheme";

export type { SuarCardColor, SuarCardContrastTheme } from "./suarCardTheme";

export interface SuarCardProps {
  color?: SuarCardColor;
  illustration?: React.ReactNode;
  title: string;
  blurb: string;
  chips?: string[];
  footer?: React.ReactNode;
  tilt?: number;
  scale?: number;
  opacity?: number;
  zIndex?: number;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children?: React.ReactNode;
}

export const SuarCard: React.FC<SuarCardProps> = ({
  color = "teal",
  illustration,
  title,
  blurb,
  chips = [],
  footer,
  tilt = 0,
  scale = 1,
  opacity = 1,
  zIndex = 2,
  isActive = false,
  onClick,
  className = "",
  children,
}) => {
  const [isPopped, setIsPopped] = useState(false);
  const startPointerRef = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, []);

  const theme = getContrastThemeForColor(color);

  // Gestur pointerdown
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Abaikan jika pointer mengenai tombol/link/input di dalam kartu
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) {
      return;
    }
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    setIsPopped(true);
  };

  // Gestur pointermove (Batalkan bila pergeseran > 8px)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startPointerRef.current) return;
    const dx = e.clientX - startPointerRef.current.x;
    const dy = e.clientY - startPointerRef.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 8) {
      setIsPopped(false);
      startPointerRef.current = null;
    }
  };

  const handlePointerUpOrCancel = () => {
    setIsPopped(false);
    startPointerRef.current = null;
  };

  // Aksesibilitas Keyboard: Enter / Spasi
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      setIsPopped(true);
      if (e.key === " ") e.preventDefault();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsPopped(false);
    }
  };

  // Efek Transformasi Pop Overshoot vs Posisi Normal
  const currentTransform = isPopped
    ? prefersReducedMotion
      ? "translateY(0) scale(1) rotate(0deg)"
      : "translateY(-12px) scale(1.08) rotate(0deg)"
    : `translateY(0) scale(${scale}) rotate(${tilt}deg)`;

  const currentZIndex = isPopped ? 50 : zIndex;
  const currentOpacity = isPopped ? 1 : opacity;

  // Maksimal 2 chips
  const displayedChips = (chips || []).slice(0, 2);

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      role="article"
      aria-label={title}
      data-popped={isPopped ? "true" : "false"}
      data-active={isActive ? "true" : "false"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerLeave={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onClick={onClick}
      style={{
        transform: currentTransform,
        zIndex: currentZIndex,
        opacity: currentOpacity,
        touchAction: "pan-y",
        transition: prefersReducedMotion
          ? "box-shadow 200ms ease"
          : "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 450ms ease, opacity 250ms ease",
      }}
      className={`relative w-full max-w-[340px] sm:max-w-[360px] md:max-w-[380px] shrink-0 rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 flex flex-col justify-between select-none cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
        theme.bgClass
      } ${
        isPopped
          ? "shadow-[0_28px_50px_-10px_rgba(11,21,40,0.45)] ring-2 ring-white/40"
          : isActive
          ? "shadow-[0_16px_36px_-8px_rgba(11,21,40,0.28)]"
          : "shadow-md"
      } ${className}`}
    >
      <div>
        {/* Karakter Ilustrasi Besar mengisi ~55% tinggi kartu */}
        {illustration && (
          <div className="relative w-full h-[180px] sm:h-[210px] rounded-[22px] sm:rounded-[24px] overflow-hidden bg-black/10 flex items-center justify-center mb-4">
            {illustration}
          </div>
        )}

        {/* Semua Teks Rata Tengah */}
        <div className="text-center px-1">
          {/* Judul Tebal Bergaya Membulat */}
          <h3
            className={`font-fredoka text-xl sm:text-2xl font-bold tracking-tight mb-1.5 leading-snug line-clamp-1 ${theme.textColor}`}
          >
            {title}
          </h3>

          {/* Deskripsi Pendek Rata Tengah (maks 60 karakter) */}
          <p
            className={`text-xs sm:text-sm font-medium leading-relaxed mb-3.5 line-clamp-2 ${theme.subtextColor}`}
          >
            {blurb}
          </p>

          {/* Chips (Maksimal 2 Chip) */}
          {displayedChips.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
              {displayedChips.map((chip, idx) => (
                <span
                  key={idx}
                  className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${theme.chipClass}`}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* Slot konten kustom opsional di tengah */}
          {children}
        </div>
      </div>

      {/* Footer Slot: Harga & CTA Rata Tengah */}
      {footer && (
        <div className="mt-4 pt-3.5 border-t border-black/10 flex flex-col items-center justify-center text-center">
          {footer}
        </div>
      )}
    </div>
  );
};

export default SuarCard;
