import React from "react";
import { SUAR_PALETTE } from "./palette";

export type MascotAccessoryType = "umbrella" | "snorkel" | "fishing";

export interface MascotStickerProps {
  type: MascotAccessoryType;
  size?: number;
  className?: string;
}

const P = SUAR_PALETTE;

/**
 * Stiker Maskot "Si Suar" Aksesori Ramah untuk Kartu Paket Tour.
 * Berupa lencana lingkaran hangat dengan Si Suar memakai perlengkapan tematik:
 * - umbrella (payung pantai warna-warni untuk wisata pantai)
 * - snorkel (masker & selang selam untuk susur mangrove & terumbu)
 * - fishing (joran & ikan melompat ceria untuk mancing mercusuar)
 */
export const MascotSticker: React.FC<MascotStickerProps> = ({
  type,
  size = 56,
  className = "",
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-md border-2 border-white select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Lingkaran Dasar Hangat */}
        <circle cx="40" cy="40" r="38" fill={type === "umbrella" ? P.sun.light : type === "snorkel" ? P.seafoam.light : P.teal.light} />

        {/* 1. Badan Si Suar Kecil */}
        <g transform="translate(18, 22)">
          {/* Badan Suar */}
          <path
            d="M14 18 C14 10, 30 10, 30 18 C33 28, 35 38, 22 40 C9 38, 11 28, 14 18 Z"
            fill={P.white}
            stroke={P.ink.dark}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Sabuk Pelampung Koral */}
          <path
            d="M12 28 C16 30, 28 30, 32 28 C33 34, 32 37, 22 38 C12 37, 11 34, 12 28 Z"
            fill={P.coral.deep}
            stroke={P.ink.dark}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Lentera Kepala */}
          <rect x="18" y="8" width="8" height="6" rx="2" fill={P.sun.base} stroke={P.ink.dark} strokeWidth="1.6" />
          <path d="M16 8 C16 3, 28 3, 28 8 Z" fill={P.coral.deep} stroke={P.ink.dark} strokeWidth="1.6" />
          <circle cx="22" cy="3" r="1.5" fill={P.sun.base} />

          {/* Mata Ceria & Pipi */}
          <circle cx="18" cy="21" r="1.8" fill={P.ink.dark} />
          <circle cx="26" cy="21" r="1.8" fill={P.ink.dark} />
          <ellipse cx="16" cy="23" rx="2" ry="1.2" fill={P.blush} />
          <ellipse cx="28" cy="23" rx="2" ry="1.2" fill={P.blush} />
          <path d="M20 24 Q22 26 24 24" stroke={P.ink.dark} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>

        {/* 2. Aksesori Tematik */}
        {type === "umbrella" && (
          // Payung Pantai Warna-warni
          <g transform="translate(42, 10)">
            {/* Tongkat Payung */}
            <line x1="10" y1="8" x2="6" y2="40" stroke={P.ink.dark} strokeWidth="2.2" strokeLinecap="round" />
            {/* Kanopi Payung */}
            <path
              d="M-4 18 C-4 6, 24 6, 24 18 Q17 19 10 18 Q3 19 -4 18 Z"
              fill={P.coral.base}
              stroke={P.ink.dark}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Garis-garis Payung */}
            <path d="M10 7 C10 11, 10 15, 10 18" stroke={P.sun.base} strokeWidth="2.5" />
            <path d="M10 7 C5 10, 0 14, -2 18" stroke={P.sun.base} strokeWidth="1.8" />
            <path d="M10 7 C15 10, 20 14, 22 18" stroke={P.sun.base} strokeWidth="1.8" />
            <circle cx="10" cy="6" r="1.5" fill={P.ink.dark} />
          </g>
        )}

        {type === "snorkel" && (
          // Masker Selam & Pipa Snorkel
          <g transform="translate(32, 38)">
            {/* Kacamata Goggle Kaca */}
            <rect x="0" y="0" width="18" height="9" rx="4.5" fill={P.water.light} stroke={P.ink.dark} strokeWidth="2" />
            <line x1="9" y1="1" x2="9" y2="8" stroke={P.ink.dark} strokeWidth="1.5" />
            {/* Tali Goggle */}
            <path d="M-4 4 L0 4 M18 4 L22 4" stroke={P.teal.dark} strokeWidth="1.8" />
            {/* Pipa Snorkel Hijau Toska */}
            <path
              d="M17 6 C24 6, 25 15, 23 20 L21 21 C20 16, 18 10, 15 8"
              fill={P.seafoam.base}
              stroke={P.ink.dark}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Ujung Pipa Oranye Terang */}
            <rect x="21" y="2" width="4" height="6" rx="2" fill={P.coral.base} stroke={P.ink.dark} strokeWidth="1.4" />
          </g>
        )}

        {type === "fishing" && (
          // Joran Pancing & Tali Pancing
          <g transform="translate(10, 8)">
            {/* Batang Joran Melengkung */}
            <path
              d="M18 48 C20 32, 32 16, 52 14"
              stroke={P.ink.dark}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tali Pancing Turun */}
            <path d="M52 14 Q56 26 56 38" stroke={P.ink.base} strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
            {/* Pelampung Pancing Bulat Merah-Putih */}
            <circle cx="56" cy="38" r="4.5" fill={P.coral.deep} stroke={P.ink.dark} strokeWidth="1.4" />
            <path d="M51.5 38 A4.5 4.5 0 0 0 60.5 38 Z" fill={P.white} />
            {/* Ikan Lompat Ceria */}
            <g transform="translate(54, 44)">
              <ellipse cx="6" cy="5" rx="6" ry="3.5" fill={P.sun.base} stroke={P.ink.dark} strokeWidth="1.2" />
              <polygon points="12,5 16,2 16,8" fill={P.coral.base} stroke={P.ink.dark} strokeWidth="1.2" />
              <circle cx="3" cy="4" r="0.8" fill={P.ink.dark} />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default MascotSticker;
