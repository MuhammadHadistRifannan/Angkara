import React from "react";
import { Mascot } from "../Mascot";
import { SUAR_PALETTE } from "../palette";

interface StepSceneProps {
  className?: string;
}

export const StepDepart: React.FC<StepSceneProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-3xl bg-gradient-to-b from-[#E0F2FE] via-[#BAE6FD]/40 to-[#7DD3FC]/50 p-4 flex items-center justify-center overflow-hidden border border-sky-200 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {/* 1. Latar Belakang Laut & Haluan Kapal */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Langit Biru Cerah & Awan Jauh */}
        <path
          d="M40 50 C45 42, 60 42, 65 50 C70 45, 85 45, 90 52 C95 50, 105 55, 102 62 C98 66, 45 66, 40 50 Z"
          fill={SUAR_PALETTE.white}
          opacity="0.8"
        />

        {/* Garis Pantai Nusakambangan Hijau di Kejauhan */}
        <path
          d="M0 135 Q80 120 160 130 T320 125 L320 170 L0 170 Z"
          fill="#10B981"
          opacity="0.25"
        />

        {/* Ombak Laut Berbuih */}
        <path
          d="M0 165 C60 155, 120 175, 180 165 C240 155, 280 170, 320 162 L320 240 L0 240 Z"
          fill="#38BDF8"
          opacity="0.7"
        />
        <path
          d="M0 185 C80 178, 160 192, 240 184 C280 180, 300 188, 320 185 L320 240 L0 240 Z"
          fill="#0284C7"
          opacity="0.8"
        />

        {/* Haluan Kapal Putih & Koral Tempat Si Suar Berlayar */}
        <g id="boat-hull">
          <path
            d="M40 215 C90 215, 150 200, 260 155 L280 185 C180 230, 90 245, 30 235 Z"
            fill={SUAR_PALETTE.white}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Garis Aksen Koral di Lambung Kapal */}
          <path
            d="M60 220 C120 218, 180 198, 268 167"
            stroke={SUAR_PALETTE.coral.deep}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Pagar Haluan Kapal */}
          <line x1="200" y1="178" x2="200" y2="152" stroke={SUAR_PALETTE.ink.base} strokeWidth="2.5" />
          <line x1="235" y1="165" x2="235" y2="142" stroke={SUAR_PALETTE.ink.base} strokeWidth="2.5" />
          <path d="M190 154 L255 138" stroke={SUAR_PALETTE.ink.base} strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Percikan Buih Haluan (Bow Splash) */}
        <path
          d="M265 170 Q280 165 290 150 Q285 170 275 180"
          fill={SUAR_PALETTE.white}
          opacity="0.9"
        />
      </svg>

      {/* 2. Si Suar dengan Jaket Pelampung & Tiket di Tangan */}
      <div className="relative z-10 flex items-center justify-center transform -translate-y-2">
        {/* Maskot Si Suar Melambai dengan Jaket Pelampung */}
        <Mascot mood="wave" size={135} accessory="lifejacket" />

        {/* E-Tiket Digital di Tangan Kiri */}
        <div className="absolute top-12 -left-6 transform -rotate-12 filter drop-shadow-md z-20">
          <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
            {/* Kertas Boarding Pass */}
            <rect
              x="2"
              y="2"
              width="40"
              height="48"
              rx="5"
              fill={SUAR_PALETTE.white}
              stroke={SUAR_PALETTE.teal.dark}
              strokeWidth="2.5"
            />
            {/* Header Tiket Teal */}
            <rect x="2" y="2" width="40" height="12" rx="4" fill={SUAR_PALETTE.teal.deep} />
            <text x="22" y="10" textAnchor="middle" fill={SUAR_PALETTE.white} fontSize="5" fontWeight="bold">
              SUAR TICKET
            </text>
            {/* Pola Barcode / QR Mini */}
            <rect x="8" y="18" width="6" height="6" fill={SUAR_PALETTE.ink.dark} />
            <rect x="18" y="18" width="6" height="6" fill={SUAR_PALETTE.ink.dark} />
            <rect x="28" y="18" width="8" height="6" fill={SUAR_PALETTE.ink.dark} />
            {/* Garis-garis Barcode */}
            <line x1="8" y1="28" x2="36" y2="28" stroke={SUAR_PALETTE.ink.dark} strokeWidth="1.5" strokeDasharray="2,1" />
            <line x1="8" y1="33" x2="36" y2="33" stroke={SUAR_PALETTE.ink.dark} strokeWidth="1" strokeDasharray="1,2" />
            <line x1="8" y1="38" x2="26" y2="38" stroke={SUAR_PALETTE.ink.dark} strokeWidth="1.5" />
            {/* Lencana Centang Valid Hijau */}
            <circle cx="33" cy="40" r="5" fill={SUAR_PALETTE.seafoam.dark} />
            <path d="M31 40 L32.5 41.5 L35.5 38.5" stroke={SUAR_PALETTE.white} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
