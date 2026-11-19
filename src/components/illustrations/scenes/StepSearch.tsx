import React from "react";
import { Mascot } from "../Mascot";
import { SUAR_PALETTE } from "../palette";

interface StepSceneProps {
  className?: string;
}

export const StepSearch: React.FC<StepSceneProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-3xl bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE] p-4 flex items-center justify-center overflow-hidden border border-sky-100 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {/* 1. Latar Belakang Ombak Pesisir */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ombak Jauh */}
        <path
          d="M0 160 C60 155, 120 165, 180 160 C240 155, 280 162, 320 160 L320 240 L0 240 Z"
          fill="#BAE6FD"
          opacity="0.5"
        />
        {/* Ombak Dekat */}
        <path
          d="M0 185 C80 180, 160 190, 240 182 C280 180, 300 185, 320 184 L320 240 L0 240 Z"
          fill="#7DD3FC"
          opacity="0.6"
        />

        {/* Dermaga Kayu Tempat Si Suar Berdiri */}
        <g id="wooden-pier">
          <path d="M20 200 L150 200 L140 240 L10 240 Z" fill={SUAR_PALETTE.sand.dark} />
          {/* Tiang Pancang Kayu */}
          <rect x="30" y="200" width="8" height="40" rx="2" fill={SUAR_PALETTE.sand.deep} />
          <rect x="70" y="200" width="8" height="40" rx="2" fill={SUAR_PALETTE.sand.deep} />
          <rect x="110" y="200" width="8" height="40" rx="2" fill={SUAR_PALETTE.sand.deep} />
          {/* Papan Dermaga */}
          <line x1="20" y1="210" x2="148" y2="210" stroke={SUAR_PALETTE.ink.dark} strokeWidth="1.5" />
          <line x1="15" y1="225" x2="144" y2="225" stroke={SUAR_PALETTE.ink.dark} strokeWidth="1.5" />
          {/* Bollard Tali Dermaga */}
          <rect x="125" y="190" width="10" height="12" rx="3" fill={SUAR_PALETTE.ink.base} />
          <ellipse cx="130" cy="190" rx="7" ry="2.5" fill={SUAR_PALETTE.ink.light} />
        </g>

        {/* 3 Kapal Mungil Berlayar di Horizon */}
        {/* Kapal 1 (Speedboat mungil cepat) */}
        <g transform="translate(180, 130) scale(0.75)">
          <path d="M0 15 L35 15 L28 25 L8 25 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinejoin="round" />
          <path d="M5 15 L12 5 L24 5 L20 15 Z" fill={SUAR_PALETTE.teal.base} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinejoin="round" />
          <line x1="2" y1="26" x2="38" y2="26" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Kapal 2 (Kapal Kayu Tradisional di tengah) */}
        <g transform="translate(240, 115) scale(0.65)">
          <path d="M5 16 L45 16 L38 30 L10 30 Z" fill={SUAR_PALETTE.coral.deep} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="18" y="6" width="16" height="10" rx="2" fill={SUAR_PALETTE.sun.base} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" />
          <line x1="26" y1="6" x2="26" y2="0" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" />
          <polygon points="26,0 36,3 26,6" fill={SUAR_PALETTE.white} />
        </g>

        {/* Kapal 3 (Kapal Jauh di Horizon) */}
        <g transform="translate(140, 95) scale(0.45)">
          <path d="M0 15 L30 15 L24 24 L6 24 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" />
          <polygon points="12,4 20,4 18,15 10,15" fill={SUAR_PALETTE.teal.deep} />
        </g>

        {/* Burung Camar Kecil Lucu */}
        <path d="M210 60 Q215 55 220 60 Q225 55 230 60" stroke={SUAR_PALETTE.ink.light} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M235 72 Q238 68 242 72 Q246 68 250 72" stroke={SUAR_PALETTE.ink.light} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>

      {/* 2. Si Suar di Dermaga dengan Kaca Pembesar */}
      <div className="relative z-10 mr-12 mt-6">
        <Mascot mood="wave" size={135} />

        {/* Kaca Pembesar Dipegang Si Suar */}
        <div className="absolute top-10 -right-6 transform rotate-12 filter drop-shadow-md">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Lensa Kaca dengan Pantulan Cahaya */}
            <circle
              cx="20"
              cy="20"
              r="14"
              fill="#E0F2FE"
              fillOpacity="0.75"
              stroke={SUAR_PALETTE.teal.dark}
              strokeWidth="3.5"
            />
            <path
              d="M13 14 Q18 9 24 14"
              stroke={SUAR_PALETTE.white}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Gagang Kayu Melengkung */}
            <line
              x1="30"
              y1="30"
              x2="44"
              y2="44"
              stroke={SUAR_PALETTE.coral.deep}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="32"
              y1="32"
              x2="42"
              y2="42"
              stroke={SUAR_PALETTE.ink.dark}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
