import React from "react";
import { SUAR_PALETTE } from "./palette";

export type BoatTypeKey = "jukung" | "speedboat" | "ekowisata";

export interface BoatCardIllustrationProps {
  boatType: string;
  className?: string;
}

const P = SUAR_PALETTE;

/**
 * Ilustrasi Kapal Lucu & Hangat dengan Si Suar sebagai Kapten.
 * Dibuat khusus untuk mengisi ~55% tinggi SuarCard pada Section Armada.
 * Gaya: Rounded flat art, goresan berujung bulat, bayangan lembut, ekspresi ceria.
 */
export const BoatCardIllustration: React.FC<BoatCardIllustrationProps> = ({
  boatType,
  className = "",
}) => {
  // Normalisasi jenis kapal
  const normalized = boatType.toLowerCase();
  const type: BoatTypeKey =
    normalized.includes("jukung") || normalized.includes("kayu")
      ? "jukung"
      : normalized.includes("ekowisata")
      ? "ekowisata"
      : "speedboat";

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Latar Belakang Hangat: Teluk & Awan Ramah */}
        <defs>
          <linearGradient id="sky-water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#E0F2FE" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="320" height="200" fill="url(#sky-water-grad)" />

        {/* Awan Kartun Melayang Lembut */}
        <g opacity="0.8">
          <ellipse cx="60" cy="38" rx="22" ry="12" fill={P.white} />
          <ellipse cx="78" cy="34" rx="16" ry="14" fill={P.white} />
          <ellipse cx="250" cy="45" rx="26" ry="14" fill={P.white} />
          <ellipse cx="272" cy="40" rx="18" ry="16" fill={P.white} />
        </g>

        {/* Matahari Cerah Kecil di Kiri Atas */}
        <circle cx="42" cy="36" r="14" fill={P.sun.base} opacity="0.9" />
        <circle cx="42" cy="36" r="18" fill={P.sun.glow} opacity="0.4" />

        {/* --- 1. JUKUNG TRADISIONAL / KAYU --- */}
        {type === "jukung" && (
          <g transform="translate(10, 15)">
            {/* Si Suar sebagai Kapten Nakhoda */}
            <g transform="translate(136, 42)">
              {/* Badan Suar */}
              <path
                d="M14 22 C14 10, 36 10, 36 22 C40 38, 42 50, 25 54 C8 50, 10 38, 14 22 Z"
                fill={P.white}
                stroke={P.ink.dark}
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              {/* Sabuk Pelampung Koral */}
              <path
                d="M11 38 C18 42, 32 42, 39 38 C41 46, 39 51, 25 52 C11 51, 9 46, 11 38 Z"
                fill={P.coral.deep}
                stroke={P.ink.dark}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Topi Kapten Nahkoda Pelaut */}
              <path
                d="M12 16 C12 6, 38 6, 38 16 Z"
                fill={P.ink.dark}
                stroke={P.ink.dark}
                strokeWidth="2"
              />
              <path d="M8 17 Q25 13 42 17" stroke={P.sun.base} strokeWidth="3" strokeLinecap="round" />
              <circle cx="25" cy="11" r="3" fill={P.sun.base} />

              {/* Mata Ceria & Senyum */}
              <circle cx="20" cy="27" r="2.5" fill={P.ink.dark} />
              <circle cx="30" cy="27" r="2.5" fill={P.ink.dark} />
              <ellipse cx="16" cy="30" rx="3" ry="2" fill={P.blush} />
              <ellipse cx="34" cy="30" rx="3" ry="2" fill={P.blush} />
              <path d="M22 31 Q25 35 28 31" stroke={P.ink.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Tangan Melambai */}
              <path d="M38 34 C46 28, 54 22, 56 26 C54 32, 46 40, 39 38 Z" fill={P.white} stroke={P.ink.dark} strokeWidth="2.4" strokeLinejoin="round" />
            </g>

            {/* Cadik / Pelampung Bambu Luar Kiri */}
            <path
              d="M32 142 C32 136, 110 136, 110 142 C110 148, 32 148, 32 142 Z"
              fill={P.sun.light}
              stroke={P.ink.dark}
              strokeWidth="2.6"
            />
            {/* Lengan Penghubung Cadik Bambu */}
            <path d="M50 140 Q85 110 120 124" stroke={P.ink.dark} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M90 140 Q115 112 145 125" stroke={P.ink.dark} strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Badan Kapal Kayu Jukung Tradisional */}
            <path
              d="M70 124 C90 156, 210 156, 245 120 L235 106 H85 Z"
              fill={P.sand.dark}
              stroke={P.ink.dark}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Corak Warna Khas Perahu Teluk Penyu */}
            <path
              d="M75 114 Q155 140 238 114 L245 120 Q160 150 70 124 Z"
              fill={P.teal.base}
              stroke={P.ink.dark}
              strokeWidth="2"
            />
            <path
              d="M85 106 H235 L232 114 H78 Z"
              fill={P.coral.base}
            />

            {/* Tiang Layar & Bendera Merah Putih */}
            <line x1="110" y1="110" x2="110" y2="52" stroke={P.ink.dark} strokeWidth="3.2" strokeLinecap="round" />
            <path d="M110 54 L142 66 L110 78 Z" fill={P.coral.deep} stroke={P.ink.dark} strokeWidth="2" />
            <line x1="110" y1="52" x2="110" y2="40" stroke={P.ink.dark} strokeWidth="2.5" />
            <rect x="110" y="42" width="18" height="6" fill="#EF4444" />
            <rect x="110" y="48" width="18" height="6" fill="#FFFFFF" />
          </g>
        )}

        {/* --- 2. SPEEDBOAT FIBER CEPAT --- */}
        {type === "speedboat" && (
          <g transform="translate(10, 15)">
            {/* Si Suar di Kokpit Mengemudikan Speedboat */}
            <g transform="translate(142, 40)">
              <path
                d="M14 22 C14 10, 36 10, 36 22 C40 38, 42 50, 25 54 C8 50, 10 38, 14 22 Z"
                fill={P.white}
                stroke={P.ink.dark}
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              <path
                d="M11 38 C18 42, 32 42, 39 38 C41 46, 39 51, 25 52 C11 51, 9 46, 11 38 Z"
                fill={P.teal.deep}
                stroke={P.ink.dark}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Topi Nakhoda Biru Laut */}
              <path
                d="M12 16 C12 6, 38 6, 38 16 Z"
                fill={P.teal.dark}
                stroke={P.ink.dark}
                strokeWidth="2"
              />
              <path d="M8 17 Q25 13 42 17" stroke={P.sun.base} strokeWidth="3" strokeLinecap="round" />
              <circle cx="25" cy="11" r="3" fill={P.sun.base} />

              <circle cx="20" cy="27" r="2.5" fill={P.ink.dark} />
              <circle cx="30" cy="27" r="2.5" fill={P.ink.dark} />
              <ellipse cx="16" cy="30" rx="3" ry="2" fill={P.blush} />
              <ellipse cx="34" cy="30" rx="3" ry="2" fill={P.blush} />
              <path d="M22 31 Q25 35 28 31" stroke={P.ink.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Dua Tangan di Setir Kemudi */}
              <circle cx="10" cy="40" r="4" fill={P.white} stroke={P.ink.dark} strokeWidth="2" />
              <circle cx="40" cy="40" r="4" fill={P.white} stroke={P.ink.dark} strokeWidth="2" />
            </g>

            {/* Kaca Depan / Windshield Biru Transparan */}
            <path
              d="M172 75 L198 106 H125 L145 75 Z"
              fill={P.water.light}
              stroke={P.ink.dark}
              strokeWidth="2.8"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <line x1="160" y1="78" x2="152" y2="102" stroke={P.white} strokeWidth="3" strokeLinecap="round" />

            {/* Lambung Speedboat Fiber Modern Aerodinamis */}
            <path
              d="M50 126 C75 146, 220 146, 265 110 L250 96 H65 Z"
              fill={P.white}
              stroke={P.ink.dark}
              strokeWidth="3.4"
              strokeLinejoin="round"
            />
            {/* Garis Striping Cepat Biru & Toska */}
            <path
              d="M58 116 Q160 134 258 104 L253 114 Q160 144 55 126 Z"
              fill={P.water.deep}
              stroke={P.ink.dark}
              strokeWidth="2"
            />
            <path
              d="M65 124 Q160 142 245 116 L242 122 Q160 148 60 132 Z"
              fill={P.teal.base}
            />

            {/* Mesin Tempel Belakang Ganda (Twin Outboard) */}
            <rect x="42" y="98" width="16" height="34" rx="4" fill={P.ink.dark} stroke={P.ink.dark} strokeWidth="2" />
            <rect x="36" y="104" width="10" height="24" rx="3" fill={P.ink.base} stroke={P.ink.dark} strokeWidth="1.8" />
            {/* Cipratan Air Mesin Cepat */}
            <path d="M30 130 Q18 126 12 134 Q22 138 34 135" fill={P.water.light} stroke={P.ink.dark} strokeWidth="2" />
          </g>
        )}

        {/* --- 3. KAPAL EKOWISATA MANGROVE --- */}
        {type === "ekowisata" && (
          <g transform="translate(10, 15)">
            {/* Si Suar di Bawah Kanopi Pemandu Wisata */}
            <g transform="translate(136, 44)">
              <path
                d="M14 22 C14 10, 36 10, 36 22 C40 38, 42 50, 25 54 C8 50, 10 38, 14 22 Z"
                fill={P.white}
                stroke={P.ink.dark}
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              <path
                d="M11 38 C18 42, 32 42, 39 38 C41 46, 39 51, 25 52 C11 51, 9 46, 11 38 Z"
                fill={P.seafoam.dark}
                stroke={P.ink.dark}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Topi Safari Hijau Ekowisata */}
              <ellipse cx="25" cy="14" rx="20" ry="4" fill={P.seafoam.dark} stroke={P.ink.dark} strokeWidth="2" />
              <path d="M12 14 C12 6, 38 6, 38 14 Z" fill={P.seafoam.dark} stroke={P.ink.dark} strokeWidth="2" />
              <path d="M13 13 H37" stroke={P.sun.base} strokeWidth="2" />

              <circle cx="20" cy="27" r="2.5" fill={P.ink.dark} />
              <circle cx="30" cy="27" r="2.5" fill={P.ink.dark} />
              <ellipse cx="16" cy="30" rx="3" ry="2" fill={P.blush} />
              <ellipse cx="34" cy="30" rx="3" ry="2" fill={P.blush} />
              <path d="M22 31 Q25 35 28 31" stroke={P.ink.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Teropong Binokular di Leher */}
              <rect x="20" y="36" width="10" height="7" rx="3" fill={P.ink.dark} stroke={P.sun.base} strokeWidth="1.2" />
            </g>

            {/* Kanopi Atap Kayu Ekowisata */}
            <path
              d="M75 52 C75 46, 235 46, 235 52 L230 64 H80 Z"
              fill={P.seafoam.dark}
              stroke={P.ink.dark}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Tiang Penopang Kanopi */}
            <line x1="90" y1="64" x2="90" y2="108" stroke={P.ink.dark} strokeWidth="3" strokeLinecap="round" />
            <line x1="140" y1="64" x2="140" y2="108" stroke={P.ink.dark} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="220" y1="64" x2="220" y2="108" stroke={P.ink.dark} strokeWidth="3" strokeLinecap="round" />

            {/* Pelampung Penyelamat Oranye di Samping Kapal */}
            <circle cx="110" cy="116" r="10" fill={P.coral.base} stroke={P.ink.dark} strokeWidth="2.2" />
            <circle cx="110" cy="116" r="5" fill={P.white} stroke={P.ink.dark} strokeWidth="2" />
            <path d="M106 108 L114 108 M106 124 L114 124 M102 116 L102 116 M118 116 L118 116" stroke={P.white} strokeWidth="2.5" />

            {/* Lambung Kapal Kayu Ekowisata */}
            <path
              d="M60 114 C80 152, 215 152, 250 114 L240 102 H70 Z"
              fill={P.sand.base}
              stroke={P.ink.dark}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <path
              d="M65 118 Q155 142 245 118 L240 126 Q155 150 68 126 Z"
              fill={P.seafoam.base}
              stroke={P.ink.dark}
              strokeWidth="2"
            />
          </g>
        )}

        {/* Lapisan Ombak Air Laut Berbusa di Bawah */}
        <path
          d="M0 162 Q20 154 40 162 T80 162 T120 162 T160 162 T200 162 T240 162 T280 162 T320 162 V200 H0 Z"
          fill={P.water.base}
          opacity="0.85"
        />
        <path
          d="M0 172 Q25 166 50 172 T100 172 T150 172 T200 172 T250 172 T300 172 T350 172 V200 H0 Z"
          fill={P.water.deep}
        />
      </svg>
    </div>
  );
};

export default BoatCardIllustration;
