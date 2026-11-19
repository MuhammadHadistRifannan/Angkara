import React from "react";
import { Mascot } from "../Mascot";
import { SUAR_PALETTE } from "../palette";

interface StepSceneProps {
  className?: string;
  status?: "aman" | "waspada" | "tunda";
}

export const StepWeather: React.FC<StepSceneProps> = ({
  className = "",
  status = "aman",
}) => {
  const isAman = status === "aman";
  const isTunda = status === "tunda";

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-3xl bg-gradient-to-b from-[#FEF9C3]/50 via-[#F0FDF4] to-[#E0F2FE] p-4 flex items-center justify-center overflow-hidden border border-emerald-100 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {/* 1. Latar Belakang Cuaca Maritim (Matahari Ceria, Awan Lucu, Ombak) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Matahari Tersenyum Ramah di Kiri Atas */}
        <g transform="translate(45, 45)">
          <circle cx="0" cy="0" r="22" fill={SUAR_PALETTE.sun.base} stroke={SUAR_PALETTE.sun.deep} strokeWidth="2.5" />
          {/* Sinar Matahari */}
          {[-45, 0, 45, 90, 135, 180, 225, 270].map((deg) => (
            <line
              key={deg}
              x1={Math.cos((deg * Math.PI) / 180) * 27}
              y1={Math.sin((deg * Math.PI) / 180) * 27}
              x2={Math.cos((deg * Math.PI) / 180) * 35}
              y2={Math.sin((deg * Math.PI) / 180) * 35}
              stroke={SUAR_PALETTE.sun.deep}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
          {/* Wajah Matahari */}
          <circle cx="-7" cy="-3" r="2" fill={SUAR_PALETTE.ink.dark} />
          <circle cx="7" cy="-3" r="2" fill={SUAR_PALETTE.ink.dark} />
          <ellipse cx="-10" cy="3" rx="2.5" ry="1.5" fill={SUAR_PALETTE.blush} />
          <ellipse cx="10" cy="3" rx="2.5" ry="1.5" fill={SUAR_PALETTE.blush} />
          <path d="M-5 4 Q0 10 5 4" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* Awan Putih Mungil Menggemaskan di Kanan Atas */}
        <g transform="translate(230, 48)">
          <path
            d="M10 20 C5 20, 0 15, 0 10 C0 4, 6 0, 12 1 C16 -4, 26 -3, 29 2 C35 0, 42 5, 42 12 C46 13, 48 18, 44 22 C40 24, 15 24, 10 20 Z"
            fill={SUAR_PALETTE.white}
            stroke={SUAR_PALETTE.water.light}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Wajah Awan */}
          <circle cx="18" cy="11" r="1.5" fill={SUAR_PALETTE.ink.light} />
          <circle cx="28" cy="11" r="1.5" fill={SUAR_PALETTE.ink.light} />
          <path d="M21 14 Q23 17 25 14" stroke={SUAR_PALETTE.ink.light} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>

        {/* Ombak Bawah yang Bersahabat */}
        <path
          d="M0 190 Q40 180 80 190 T160 190 T240 190 T320 190 L320 240 L0 240 Z"
          fill="#38BDF8"
          fillOpacity="0.4"
        />
        <path
          d="M0 205 Q50 198 100 205 T200 205 T300 205 T320 205 L320 240 L0 240 Z"
          fill="#0284C7"
          fillOpacity="0.5"
        />
      </svg>

      {/* 2. Si Suar dengan Payung dan Mood Sesuai Status Cuaca */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Payung Ceria Maritim di Samping Si Suar */}
        <div className="absolute -top-10 -left-6 transform -rotate-12 filter drop-shadow-md z-20">
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
            {/* Kubah Payung Belang Koral & Kuning */}
            <path
              d="M6 34 C6 16, 62 16, 62 34 Q48 30, 34 34 Q20 30, 6 34 Z"
              fill={SUAR_PALETTE.coral.deep}
              stroke={SUAR_PALETTE.ink.dark}
              strokeWidth="2.5"
            />
            {/* Belang Payung Kuning */}
            <path
              d="M20 31.5 C24 19, 44 19, 48 31.5 Q41 33.5, 34 34 Q27 33.5, 20 31.5 Z"
              fill={SUAR_PALETTE.sun.base}
              stroke={SUAR_PALETTE.ink.dark}
              strokeWidth="1.5"
            />
            {/* Ujung Atas Payung */}
            <line x1="34" y1="18" x2="34" y2="13" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" strokeLinecap="round" />
            {/* Gagang Payung Lengkung */}
            <line x1="34" y1="34" x2="34" y2="58" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" />
            <path d="M34 58 C34 64, 42 64, 42 58" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Maskot Si Suar */}
        <Mascot
          mood={isTunda ? "worried" : isAman ? "happy" : "thinking"}
          size={130}
        />

        {/* Lencana Kelaikan Cuaca Mini yang Melayang */}
        <div className="absolute -bottom-2 -right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-1.5 z-20">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isAman ? "bg-emerald-500" : isTunda ? "bg-rose-500" : "bg-amber-500"
            } animate-pulse`}
          />
          <div className="text-[10px] leading-tight font-black uppercase text-slate-800">
            {isAman ? "Aman Berlayar" : isTunda ? "Tunda Trip" : "Waspada Gelombang"}
          </div>
        </div>
      </div>
    </div>
  );
};
