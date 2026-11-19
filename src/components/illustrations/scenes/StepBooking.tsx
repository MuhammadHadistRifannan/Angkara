import React from "react";
import { Mascot } from "../Mascot";
import { SUAR_PALETTE } from "../palette";

interface StepSceneProps {
  className?: string;
}

export const StepBooking: React.FC<StepSceneProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-3xl bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-[#ECFDF5] p-4 flex items-center justify-center overflow-hidden border border-teal-100 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {/* 1. Latar Belakang Geometris & Pola Perisai Lembut */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lingkaran Perlindungan Hangat di Tengah */}
        <circle cx="160" cy="120" r="85" fill={SUAR_PALETTE.teal.light} opacity="0.4" />
        <circle cx="160" cy="120" r="110" stroke={SUAR_PALETTE.teal.base} strokeWidth="1" strokeDasharray="4,6" opacity="0.3" />

        {/* Perisai Escrow Mengambang di Kiri */}
        <g transform="translate(30, 60) scale(0.9)">
          <path
            d="M25 0 C45 0, 50 15, 50 35 C50 65, 25 80, 25 80 C25 80, 0 65, 0 35 C0 15, 5 0, 25 0 Z"
            fill={SUAR_PALETTE.teal.deep}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M25 6 C41 6, 44 18, 44 35 C44 59, 25 72, 25 72 C25 72, 6 59, 6 35 C6 18, 9 6, 25 6 Z"
            fill={SUAR_PALETTE.teal.base}
          />
          {/* Centang Keselamatan di Perisai */}
          <path
            d="M16 34 L22 40 L34 26"
            stroke={SUAR_PALETTE.white}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Koin DP 30% Mengambang di Kanan */}
        <g transform="translate(230, 55)">
          <circle cx="28" cy="28" r="26" fill={SUAR_PALETTE.sun.base} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" />
          <circle cx="28" cy="28" r="21" stroke={SUAR_PALETTE.sun.deep} strokeWidth="1.5" strokeDasharray="2,3" fill="none" />
          <text
            x="28"
            y="26"
            textAnchor="middle"
            fill={SUAR_PALETTE.ink.dark}
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            DP 30%
          </text>
          <text
            x="28"
            y="37"
            textAnchor="middle"
            fill={SUAR_PALETTE.coral.dark}
            fontSize="7"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            ESCROW
          </text>
        </g>

        {/* Kilau Bintang Emas */}
        <path d="M75 160 L77 165 L82 167 L77 169 L75 174 L73 169 L68 167 L73 165 Z" fill={SUAR_PALETTE.sun.base} />
        <path d="M250 160 L252 165 L257 167 L252 169 L250 174 L248 169 L243 167 L248 165 Z" fill={SUAR_PALETTE.sun.base} />
      </svg>

      {/* 2. Si Suar dengan Gembok Kursi Anti-Overbooking */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Maskot Si Suar Ceria */}
        <Mascot mood="celebrate" size={135} />

        {/* Gembok Besar Emas yang Terkunci Aman di Tengah Bawah */}
        <div className="absolute -bottom-4 right-1 filter drop-shadow-md z-20">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            {/* Busur Gembok */}
            <path
              d="M17 24 V16 C17 10, 39 10, 39 16 V24"
              stroke={SUAR_PALETTE.ink.dark}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Badan Gembok Emas */}
            <rect
              x="10"
              y="22"
              width="36"
              height="28"
              rx="8"
              fill={SUAR_PALETTE.sun.base}
              stroke={SUAR_PALETTE.ink.dark}
              strokeWidth="3.5"
            />
            {/* Lubang Kunci */}
            <circle cx="28" cy="33" r="3.5" fill={SUAR_PALETTE.ink.dark} />
            <polygon points="26.5,33 29.5,33 31,41 25,41" fill={SUAR_PALETTE.ink.dark} />
            {/* Kilau Gembok */}
            <rect x="15" y="26" width="4" height="6" rx="2" fill={SUAR_PALETTE.white} />
          </svg>
        </div>
      </div>
    </div>
  );
};
