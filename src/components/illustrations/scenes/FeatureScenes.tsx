import React from "react";
import { Mascot } from "../Mascot";
import { SUAR_PALETTE } from "../palette";

interface FeatureSceneProps {
  className?: string;
}

/**
 * 1. E-Tiket & Asuransi
 * Si Suar memegang tiket QR digital dan perisai perlindungan asuransi laut.
 */
export const FeatureInsuranceScene: React.FC<FeatureSceneProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full h-[120px] flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        <defs>
          <radialGradient id="insurance-blob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SUAR_PALETTE.teal.light} stopOpacity="0.4" />
            <stop offset="100%" stopColor={SUAR_PALETTE.teal.base} stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Latar Blob Lembut Seafoam / Teal */}
        <path
          d="M40 60 C30 25, 75 12, 120 15 C165 18, 205 30, 200 65 C195 98, 155 112, 115 108 C65 104, 50 95, 40 60 Z"
          fill="url(#insurance-blob)"
        />

        {/* Perisai Perlindungan Asuransi (Kiri) */}
        <g transform="translate(36, 32) scale(0.85)" className="transition-transform duration-300 group-hover:scale-95">
          <path
            d="M20 0 C36 0, 40 12, 40 28 C40 52, 20 64, 20 64 C20 64, 0 52, 0 28 C0 12, 4 0, 20 0 Z"
            fill={SUAR_PALETTE.teal.deep}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M20 5 C33 5, 35 15, 35 28 C35 47, 20 57, 20 57 C20 57, 5 47, 5 28 C5 15, 7 5, 20 5 Z"
            fill={SUAR_PALETTE.teal.base}
          />
          {/* Centang Keselamatan */}
          <path
            d="M13 28 L18 33 L28 22"
            stroke={SUAR_PALETTE.white}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Tiket QR Digital (Kanan) */}
        <g transform="translate(162, 30) scale(0.88)" className="transition-transform duration-300 group-hover:scale-95">
          {/* Badan Tiket */}
          <rect
            x="0"
            y="0"
            width="42"
            height="58"
            rx="6"
            fill={SUAR_PALETTE.white}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="3"
          />
          {/* Pita Atas Koral */}
          <path
            d="M0 6 C0 2.68 2.68 0 6 0 H36 C39.32 0 42 2.68 42 6 V14 H0 Z"
            fill={SUAR_PALETTE.coral.base}
          />
          {/* Kode Bar / QR Kotak-Kotak Sederhana */}
          <rect x="8" y="20" width="10" height="10" rx="1.5" fill={SUAR_PALETTE.ink.dark} />
          <rect x="10" y="22" width="6" height="6" fill={SUAR_PALETTE.white} />
          <rect x="12" y="24" width="2" height="2" fill={SUAR_PALETTE.ink.dark} />

          <rect x="24" y="20" width="10" height="10" rx="1.5" fill={SUAR_PALETTE.ink.dark} />
          <rect x="26" y="22" width="6" height="6" fill={SUAR_PALETTE.white} />
          <rect x="28" y="24" width="2" height="2" fill={SUAR_PALETTE.ink.dark} />

          <rect x="8" y="34" width="10" height="10" rx="1.5" fill={SUAR_PALETTE.ink.dark} />
          <rect x="10" y="36" width="6" height="6" fill={SUAR_PALETTE.white} />
          <rect x="12" y="38" width="2" height="2" fill={SUAR_PALETTE.ink.dark} />

          {/* Garis Potong Tiket */}
          <line x1="6" y1="50" x2="36" y2="50" stroke={SUAR_PALETTE.teal.light} strokeWidth="1.5" strokeDasharray="3 2" />
        </g>
      </svg>

      {/* Maskot Si Suar di Tengah (Ukuran Lebih Besar & Proporsional) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Mascot mood="happy" size={82} className="group-hover:scale-110 transition-transform duration-300" />
      </div>
    </div>
  );
};

/**
 * 2. Peringatan Cuaca BMKG
 * Si Suar membawa payung hangat bersama awan ramah dan matahari ceria.
 */
export const FeatureWeatherScene: React.FC<FeatureSceneProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full h-[120px] flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-500/10 via-amber-500/5 to-transparent ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        <defs>
          <radialGradient id="weather-blob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SUAR_PALETTE.seafoam.base} stopOpacity="0.45" />
            <stop offset="100%" stopColor={SUAR_PALETTE.teal.base} stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Latar Blob Lembut */}
        <path
          d="M45 58 C35 22, 80 14, 122 16 C168 18, 204 32, 198 66 C192 96, 150 110, 110 106 C62 102, 55 94, 45 58 Z"
          fill="url(#weather-blob)"
        />

        {/* Matahari Hangat Ceria (Kiri Atas) */}
        <g transform="translate(36, 20)">
          <circle cx="16" cy="16" r="13" fill={SUAR_PALETTE.sun.base} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" />
          {/* Pancaran Sinar Lembut */}
          <line x1="16" y1="-1" x2="16" y2="2" stroke={SUAR_PALETTE.sun.deep} strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="30" x2="16" y2="33" stroke={SUAR_PALETTE.sun.deep} strokeWidth="2" strokeLinecap="round" />
          <line x1="-1" y1="16" x2="2" y2="16" stroke={SUAR_PALETTE.sun.deep} strokeWidth="2" strokeLinecap="round" />
          <line x1="30" y1="16" x2="33" y2="16" stroke={SUAR_PALETTE.sun.deep} strokeWidth="2" strokeLinecap="round" />
          {/* Senyum Kecil Matahari */}
          <path d="M12 17 Q16 21 20 17" stroke={SUAR_PALETTE.ink.dark} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </g>

        {/* Awan Putih Mengambang (Menutupi sebagian matahari) */}
        <g transform="translate(42, 34)">
          <path
            d="M10 20 C6 20 2 17 2 12 C2 8 5 5 9 5 C11 2 15 0 20 0 C25 0 29 3 31 7 C34 7 38 9 38 13 C38 17 34 20 30 20 Z"
            fill={SUAR_PALETTE.white}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Payung Cuaca Pelindung (Kanan) */}
        <g transform="translate(162, 28) scale(0.9)" className="transition-transform duration-300 group-hover:rotate-6">
          {/* Kubah Payung */}
          <path
            d="M5 26 C5 8, 43 8, 43 26 C37 24, 31 27, 24 24 C17 27, 11 24, 5 26 Z"
            fill={SUAR_PALETTE.coral.base}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Garis Corak Payung */}
          <path d="M24 10 V24" stroke={SUAR_PALETTE.coral.light} strokeWidth="2" />
          <path d="M24 8 V4" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinecap="round" />
          {/* Gagang Payung */}
          <path
            d="M24 24 V44 C24 49, 17 49, 17 44"
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>

      {/* Maskot Si Suar di Tengah */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Mascot mood="happy" size={82} className="group-hover:scale-110 transition-transform duration-300" />
      </div>
    </div>
  );
};

/**
 * 3. Ulasan Terverifikasi
 * Si Suar memegang bintang emas ulasan dan lencana verifikasi centang.
 */
export const FeatureReviewScene: React.FC<FeatureSceneProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full h-[120px] flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-500/10 via-amber-500/5 to-transparent ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        <defs>
          <radialGradient id="review-blob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SUAR_PALETTE.teal.light} stopOpacity="0.4" />
            <stop offset="100%" stopColor={SUAR_PALETTE.teal.base} stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Latar Blob Lembut */}
        <path
          d="M42 58 C32 24, 76 12, 118 16 C164 18, 202 30, 196 66 C190 98, 152 110, 112 106 C64 102, 52 92, 42 58 Z"
          fill="url(#review-blob)"
        />

        {/* Lencana Centang Terverifikasi (Kiri) */}
        <g transform="translate(36, 36) scale(0.9)" className="transition-transform duration-300 group-hover:scale-105">
          <circle cx="20" cy="20" r="18" fill={SUAR_PALETTE.teal.deep} stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" />
          <circle cx="20" cy="20" r="14" fill={SUAR_PALETTE.teal.base} />
          <path
            d="M13 20 L18 25 L28 14"
            stroke={SUAR_PALETTE.white}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Bintang Emas Ulasan 5-Bintang (Kanan) */}
        <g transform="translate(162, 32) scale(0.95)" className="transition-transform duration-300 group-hover:rotate-12">
          {/* Bintang Emas Utama */}
          <path
            d="M20 2 L25.5 14.5 L39 16 L28.5 25.5 L31.5 39 L20 32 L8.5 39 L11.5 25.5 L1 16 L14.5 14.5 Z"
            fill={SUAR_PALETTE.sun.base}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Kilau Bintang */}
          <circle cx="20" cy="18" r="3" fill={SUAR_PALETTE.white} opacity="0.8" />
        </g>

        {/* Kilau Bintang Mungil */}
        <path d="M152 24 L154 28 L158 30 L154 32 L152 36 L150 32 L146 30 L150 28 Z" fill={SUAR_PALETTE.sun.base} />
        <path d="M82 22 L83.5 25 L86.5 26.5 L83.5 28 L82 31 L80.5 28 L77.5 26.5 L80.5 25 Z" fill={SUAR_PALETTE.sun.base} />
      </svg>

      {/* Maskot Si Suar di Tengah (Mood: Celebrate / Ceria Bintang) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Mascot mood="celebrate" size={82} className="group-hover:scale-110 transition-transform duration-300" />
      </div>
    </div>
  );
};

/**
 * 4. Juru Mudi, Asisten AI
 * Si Suar memegang kemudi kapal dan gelembung obrolan konsultasi cerdas.
 */
export const FeatureAssistantScene: React.FC<FeatureSceneProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full h-[120px] flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        <defs>
          <radialGradient id="assistant-blob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SUAR_PALETTE.teal.light} stopOpacity="0.4" />
            <stop offset="100%" stopColor={SUAR_PALETTE.teal.base} stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Latar Blob Lembut */}
        <path
          d="M40 60 C30 25, 75 14, 120 16 C166 18, 204 32, 198 66 C192 98, 154 110, 114 106 C66 102, 50 95, 40 60 Z"
          fill="url(#assistant-blob)"
        />

        {/* Kemudi Kapal Nakhoda / Juru Mudi (Kiri) */}
        <g transform="translate(36, 32) scale(0.9)" className="transition-transform duration-500 group-hover:rotate-45">
          {/* Lingkaran Luar Kemudi */}
          <circle cx="22" cy="22" r="16" fill="none" stroke={SUAR_PALETTE.ink.dark} strokeWidth="3" />
          <circle cx="22" cy="22" r="16" fill="none" stroke={SUAR_PALETTE.coral.deep} strokeWidth="2" />
          {/* Hub Pusat Kemudi */}
          <circle cx="22" cy="22" r="6" fill={SUAR_PALETTE.sun.base} stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" />
          {/* Jari-Jari Kemudi (Spokes) */}
          <line x1="22" y1="2" x2="22" y2="42" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="2" y1="22" x2="42" y2="22" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="8" x2="36" y2="36" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="36" x2="36" y2="8" stroke={SUAR_PALETTE.ink.dark} strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Gelembung Chat Obrolan AI (Kanan Atas) */}
        <g transform="translate(160, 26) scale(0.95)" className="transition-transform duration-300 group-hover:-translate-y-1">
          {/* Balon Chat */}
          <path
            d="M6 0 C2.68 0 0 2.68 0 6 V26 C0 29.32 2.68 32 6 32 H24 L32 38 V32 H38 C41.32 32 44 29.32 44 26 V6 C44 2.68 41.32 0 38 0 Z"
            fill={SUAR_PALETTE.white}
            stroke={SUAR_PALETTE.ink.dark}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* 3 Titik Chat AI Ramah */}
          <circle cx="12" cy="16" r="3" fill={SUAR_PALETTE.teal.deep} />
          <circle cx="22" cy="16" r="3" fill={SUAR_PALETTE.teal.base} />
          <circle cx="32" cy="16" r="3" fill={SUAR_PALETTE.coral.base} />
        </g>
      </svg>

      {/* Maskot Si Suar di Tengah (Mood: Wave / Melambai Ramah) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Mascot mood="wave" size={82} className="group-hover:scale-110 transition-transform duration-300" />
      </div>
    </div>
  );
};
