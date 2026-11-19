import React from "react";
import { SUAR_PALETTE } from "./palette";

export type MascotMood = "happy" | "wave" | "thinking" | "worried" | "celebrate";

export interface MascotProps {
  mood?: MascotMood;
  size?: number | string;
  className?: string;
  animate?: boolean;
  accessory?: "magnifier" | "umbrella" | "lock" | "lifejacket" | "ticket" | "none";
}

/**
 * Maskot Resmi "Si Suar" (Suar Maritim Ceria)
 * Karakter orisinal berbentuk suar/pelampung navigasi kecil dengan lentera menyala di atas kepala.
 */
export const Mascot: React.FC<MascotProps> = ({
  mood = "happy",
  size = 120,
  className = "",
  animate = true,
  accessory = "none",
}) => {
  return (
    <div
      className={`inline-block relative select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full overflow-visible ${
          animate ? "suar-mascot-float" : ""
        }`}
      >
        <defs>
          {/* Cahaya Lentera Kepala */}
          <radialGradient id="lantern-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SUAR_PALETTE.sun.base} stopOpacity="0.9" />
            <stop offset="60%" stopColor={SUAR_PALETTE.sun.glow} stopOpacity="0.4" />
            <stop offset="100%" stopColor={SUAR_PALETTE.sun.light} stopOpacity="0" />
          </radialGradient>

          {/* Bayangan Dasar */}
          <ellipse id="ground-shadow" cx="80" cy="150" rx="36" ry="6" fill="#0B132B" opacity="0.12" />
        </defs>

        {/* 1. Bayangan di Bawah Badan */}
        <use href="#ground-shadow" />

        {/* 2. Pancaran Cahaya Lentera Kepala (Berdenyut) */}
        <circle
          cx="80"
          cy="26"
          r="18"
          fill="url(#lantern-glow)"
          className={animate ? "suar-lantern-pulse" : ""}
        />

        {/* 3. Badan Utama Pelampung/Suar (Bentuk Membulat Halus) */}
        <g id="suar-body">
          {/* Tubuh Dasar Putih Mutiara */}
          <path
            d="M52 55 C52 38, 108 38, 108 55 C116 85, 122 130, 80 134 C38 130, 44 85, 52 55 Z"
            fill={SUAR_PALETTE.white}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Sabuk Pelampung Koral / Teal di Tengah Badan */}
          <path
            d="M48 88 C60 92, 100 92, 112 88 C115 106, 112 118, 80 122 C48 118, 45 106, 48 88 Z"
            fill={SUAR_PALETTE.coral.deep}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Garis Aksen Pita Pelampung */}
          <path
            d="M54 94 C68 98, 92 98, 106 94"
            stroke={SUAR_PALETTE.coral.light}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Jaket Pelampung jika accessory === 'lifejacket' */}
          {accessory === "lifejacket" && (
            <g id="accessory-lifejacket">
              <path
                d="M45 80 C44 110, 116 110, 115 80 C114 68, 104 62, 80 64 C56 62, 46 68, 45 80 Z"
                fill={SUAR_PALETTE.coral.base}
                stroke={SUAR_PALETTE.ink.dark}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <rect x="73" y="74" width="14" height="28" rx="3" fill={SUAR_PALETTE.coral.dark} />
              {/* Gesper Jaket */}
              <rect x="71" y="86" width="18" height="5" rx="2" fill={SUAR_PALETTE.sun.base} stroke={SUAR_PALETTE.ink.dark} strokeWidth="1.5" />
            </g>
          )}
        </g>

        {/* 4. Lentera Mercusuar di Kepala */}
        <g id="suar-lantern">
          {/* Dudukan Lentera */}
          <rect
            x="70"
            y="32"
            width="20"
            height="5"
            rx="2.5"
            fill={SUAR_PALETTE.teal.deep}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="2.5"
          />

          {/* Kaca Bohlam Kuning */}
          <rect
            x="72"
            y="20"
            width="16"
            height="14"
            rx="4"
            fill={SUAR_PALETTE.sun.base}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="2.5"
          />

          {/* Kilau Kaca */}
          <path d="M74 23 L76 30" stroke={SUAR_PALETTE.white} strokeWidth="1.5" strokeLinecap="round" />

          {/* Kubah Atap Lentera Koral */}
          <path
            d="M68 20 C68 12, 92 12, 92 20 Z"
            fill={SUAR_PALETTE.coral.deep}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Antena / Ujung Mercusuar */}
          <line x1="80" y1="12" x2="80" y2="7" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="6" r="2.5" fill={SUAR_PALETTE.sun.base} stroke={SUAR_PALETTE.ink.dark} strokeWidth="1.5" />
        </g>

        {/* 5. Wajah & Ekspresi (Tergantung Mood) */}
        <g id="suar-face">
          {/* Pipi Merona Pink (Selalu ada agar hangat dan ramah) */}
          <ellipse cx="61" cy="74" rx="5" ry="3" fill={SUAR_PALETTE.blush} opacity="0.85" />
          <ellipse cx="99" cy="74" rx="5" ry="3" fill={SUAR_PALETTE.blush} opacity="0.85" />

          {/* Mata dan Mulut Berdasarkan Mood */}
          {mood === "celebrate" ? (
            // Mata Terpejam Bahagia (^ ^)
            <>
              <path d="M60 69 Q65 63 70 69" stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M90 69 Q95 63 100 69" stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Senyum Lebar Terbuka */}
              <path d="M72 73 Q80 84 88 73 Z" fill={SUAR_PALETTE.coral.deep} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" strokeLinejoin="round" />
              {/* Bintang-bintang Selebrasi */}
              <path d="M42 42 L44 47 L49 49 L44 51 L42 56 L40 51 L35 49 L40 47 Z" fill={SUAR_PALETTE.sun.base} />
              <path d="M118 42 L120 47 L125 49 L120 51 L118 56 L116 51 L111 49 L116 47 Z" fill={SUAR_PALETTE.sun.base} />
            </>
          ) : mood === "worried" ? (
            // Mata Bulat Khawatir + Alis Miring Santun
            <>
              <path d="M62 61 Q67 58 72 62" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M88 62 Q93 58 98 61" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Mata */}
              <circle cx="66" cy="68" r="4.5" fill={SUAR_PALETTE.ink.dark} />
              <circle cx="68" cy="66.5" r="1.5" fill={SUAR_PALETTE.white} />
              <circle cx="94" cy="68" r="4.5" fill={SUAR_PALETTE.ink.dark} />
              <circle cx="96" cy="66.5" r="1.5" fill={SUAR_PALETTE.white} />
              {/* Mulut Sedikit Berombak Tenang */}
              <path d="M74 77 Q80 74 86 77" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : mood === "thinking" ? (
            // Mata Melirik ke Atas + Mulut 'o' Kecil
            <>
              <path d="M62 59 Q67 57 72 60" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M88 60 Q93 57 98 59" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Mata melirik ke lentera atas */}
              <circle cx="66" cy="66" r="4.5" fill={SUAR_PALETTE.ink.dark} />
              <circle cx="67" cy="64.5" r="1.5" fill={SUAR_PALETTE.white} />
              <circle cx="94" cy="66" r="4.5" fill={SUAR_PALETTE.ink.dark} />
              <circle cx="95" cy="64.5" r="1.5" fill={SUAR_PALETTE.white} />
              {/* Mulut 'o' imut */}
              <ellipse cx="80" cy="76" rx="2.5" ry="3.5" fill={SUAR_PALETTE.coral.deep} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" />
            </>
          ) : (
            // Happy & Wave (Default Ceria)
            <>
              {/* Mata Besar Bulat Berbinar */}
              <circle cx="66" cy="68" r="5" fill={SUAR_PALETTE.ink.dark} />
              <circle cx="64.5" cy="66" r="1.8" fill={SUAR_PALETTE.white} />
              <circle cx="68" cy="69.5" r="0.9" fill={SUAR_PALETTE.white} />

              <circle cx="94" cy="68" r="5" fill={SUAR_PALETTE.ink.dark} />
              <circle cx="92.5" cy="66" r="1.8" fill={SUAR_PALETTE.white} />
              <circle cx="96" cy="69.5" r="0.9" fill={SUAR_PALETTE.white} />

              {/* Senyum Melengkung Manis */}
              <path d="M74 74 Q80 80 86 74" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          )}
        </g>

        {/* 6. Tangan & Sirip Ramah */}
        <g id="suar-hands">
          {mood === "wave" ? (
            // Tangan Kanan Melambai Naik
            <>
              {/* Tangan Kiri di Badan */}
              <path d="M48 85 C42 88, 38 98, 46 102 C50 96, 52 90, 48 85 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinejoin="round" />
              {/* Tangan Kanan Melambai */}
              <g className={animate ? "suar-hand-wave" : ""}>
                <path d="M110 82 C120 74, 132 64, 136 68 C140 74, 126 88, 114 90 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinejoin="round" />
              </g>
            </>
          ) : mood === "celebrate" ? (
            // Kedua Tangan ke Atas
            <>
              <path d="M50 78 C40 68, 28 58, 24 64 C20 70, 34 84, 46 86 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinejoin="round" />
              <path d="M110 78 C120 68, 132 58, 136 64 C140 70, 126 84, 114 86 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinejoin="round" />
            </>
          ) : mood === "thinking" ? (
            // Satu Tangan di Dagu
            <>
              <path d="M48 85 C42 88, 38 98, 46 102 C50 96, 52 90, 48 85 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinejoin="round" />
              <path d="M112 85 C118 84, 102 74, 88 78 C86 82, 98 88, 108 90 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinejoin="round" />
            </>
          ) : (
            // Pose Standar Happy: Dua Tangan Mungil Santai
            <>
              <path d="M48 85 C40 88, 36 96, 44 100 C48 95, 50 90, 48 85 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinejoin="round" />
              <path d="M112 85 C120 88, 124 96, 116 100 C112 95, 110 90, 112 85 Z" fill={SUAR_PALETTE.white} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" strokeLinejoin="round" />
            </>
          )}
        </g>
      </svg>

      {/* Global Style Animasi Halus Si Suar */}
      <style>{`
        @keyframes suar-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes suar-pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        @keyframes suar-wave-motion {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(12deg);
          }
        }
        .suar-mascot-float {
          animation: suar-float 3.5s ease-in-out infinite;
        }
        .suar-lantern-pulse {
          animation: suar-pulse-glow 2.4s ease-in-out infinite;
          transform-origin: 80px 26px;
        }
        .suar-hand-wave {
          animation: suar-wave-motion 1.8s ease-in-out infinite;
          transform-origin: 110px 85px;
        }
        @media (prefers-reduced-motion: reduce) {
          .suar-mascot-float,
          .suar-lantern-pulse,
          .suar-hand-wave {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Mascot;
