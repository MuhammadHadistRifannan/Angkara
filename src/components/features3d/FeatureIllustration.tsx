import React from "react";
import { SUAR_PALETTE } from "@/components/illustrations/palette";

/**
 * Ilustrasi hangat, lucu, dan user-friendly untuk Panggung Fitur SUAR.
 * Menghadirkan maskot "Si Suar" di setiap adegan dengan visual membulat,
 * warna hangat, dan detail profesional yang menjaga nilai keselamatan maritim.
 */

const P = SUAR_PALETTE;

// --- Elemen Dekoratif & Efek Bersama ---

/** Lingkaran portal bercahaya lembut sebagai latar belakang setiap adegan */
const AmbientHalo: React.FC<{
  tint?: "teal" | "coral" | "sun" | "water";
}> = ({ tint = "teal" }) => {
  const glowColor =
    tint === "coral"
      ? P.coral.base
      : tint === "sun"
      ? P.sun.base
      : tint === "water"
      ? P.water.base
      : P.teal.base;

  return (
    <g aria-hidden="true">
      <defs>
        <radialGradient id={`halo-grad-${tint}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.28" />
          <stop offset="65%" stopColor={glowColor} stopOpacity="0.08" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Pancaran cahaya radial dengan denyut halus */}
      <circle cx="160" cy="150" r="140" fill={`url(#halo-grad-${tint})`} className="suar-anim-pulse" />
      {/* Cincin luar halus tematik */}
      <circle
        cx="160"
        cy="150"
        r="132"
        stroke={glowColor}
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.3"
      />
      {/* Cincin dalam tipis */}
      <circle
        cx="160"
        cy="150"
        r="115"
        stroke={glowColor}
        strokeWidth="1"
        opacity="0.15"
      />
    </g>
  );
};

/** Ombak kecil dekoratif di dasar */
const Waves: React.FC<{ y?: number; opacity?: number }> = ({
  y = 265,
  opacity = 0.45,
}) => (
  <g opacity={opacity} aria-hidden="true">
    <path
      d={`M25 ${y} q16 -7 32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0 t32 0`}
      fill="none"
      stroke={P.water.base}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d={`M15 ${y + 11} q14 -5 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0`}
      fill="none"
      stroke={P.water.light}
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.8"
    />
  </g>
);

/** Bintang kilauan kecil */
const Sparkle: React.FC<{ cx: number; cy: number; size?: number; color?: string }> = ({
  cx,
  cy,
  size = 6,
  color = P.sun.base,
}) => {
  const x = Number(cx);
  const y = Number(cy);
  const s = Number(size);
  return (
    <g aria-hidden="true">
      <line
        x1={x}
        y1={y - s}
        x2={x}
        y2={y + s}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1={x - s}
        y1={y}
        x2={x + s}
        y2={y}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1={x - s * 0.6}
        y1={y - s * 0.6}
        x2={x + s * 0.6}
        y2={y + s * 0.6}
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1={x + s * 0.6}
        y1={y - s * 0.6}
        x2={x - s * 0.6}
        y2={y + s * 0.6}
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </g>
  );
};

/** Awan kecil lucu dengan gerak melayang */
const CuteCloud: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} className="suar-anim-drift" aria-hidden="true">
    <path
      d="M10 20 C5 20 1 16 1 12 C1 8 4 5 8 5 C10 2 14 0 19 0 C24 0 28 3 30 7 C33 7 37 9 37 13 C37 17 33 20 29 20 Z"
      fill={P.white}
      stroke={P.ink.dark}
      strokeWidth="2.2"
      strokeLinejoin="round"
      opacity="0.95"
    />
  </g>
);

/**
 * Maskot Si Suar Vektor Responsif & Menggemaskan dengan Animasi Bernapas/Bobbing
 */
const SuarMascot: React.FC<{
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  mood?: "happy" | "thinking" | "wave" | "celebrate";
}> = ({ x, y, scale = 0.5, flip = false, mood = "happy" }) => (
  <g
    transform={`translate(${x}, ${y}) scale(${flip ? -scale : scale}, ${scale})`}
    className="suar-anim-bob transition-transform duration-300"
  >
    {/* Bayangan halus */}
    <ellipse cx="80" cy="148" rx="32" ry="6" fill="#020b17" opacity="0.3" />

    {/* Pancaran Sinar Lentera Kepala */}
    <circle cx="80" cy="24" r="16" fill={P.sun.glow} opacity="0.65" />
    <circle cx="80" cy="24" r="8" fill={P.sun.base} opacity="0.9" />

    {/* Badan Suar Pelampung (Bentuk Piramida Membulat) */}
    <path
      d="M54 52 C54 38, 106 38, 106 52 C114 82, 118 126, 80 130 C42 126, 46 82, 54 52 Z"
      fill={P.white}
      stroke={P.ink.dark}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Sabuk Pelampung Koral di Tengah */}
    <path
      d="M50 86 C60 90, 100 90, 110 86 C112 104, 110 116, 80 120 C50 116, 48 104, 50 86 Z"
      fill={P.coral.deep}
      stroke={P.ink.dark}
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* Garis corak sabuk */}
    <path
      d="M50 94 C60 98, 100 98, 110 94"
      fill="none"
      stroke={P.coral.dark}
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    {/* Rumah Lentera di Kepala */}
    <path
      d="M66 52 L70 28 H90 L94 52"
      fill={P.teal.deep}
      stroke={P.ink.dark}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Kubah Lentera */}
    <path
      d="M68 28 C68 22, 92 22, 92 28 Z"
      fill={P.sun.base}
      stroke={P.ink.dark}
      strokeWidth="2.5"
    />

    {/* Mata Ceria Berbinar */}
    <circle cx="67" cy="70" r="5.5" fill={P.ink.dark} />
    <circle cx="93" cy="70" r="5.5" fill={P.ink.dark} />
    <circle cx="65" cy="68" r="2" fill={P.white} />
    <circle cx="91" cy="68" r="2" fill={P.white} />

    {/* Pipi Merona Hangat */}
    <ellipse cx="58" cy="78" rx="6" ry="4" fill={P.blush} opacity="0.65" />
    <ellipse cx="102" cy="78" rx="6" ry="4" fill={P.blush} opacity="0.65" />

    {/* Senyum Ramah */}
    {mood === "thinking" ? (
      <ellipse cx="80" cy="80" rx="3" ry="3" fill={P.ink.dark} />
    ) : mood === "celebrate" ? (
      <path
        d="M71 78 Q80 92 89 78 Z"
        fill={P.coral.base}
        stroke={P.ink.dark}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M72 79 Q80 87 88 79"
        fill="none"
        stroke={P.ink.dark}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    )}

    {/* Tangan Melambai jika mode wave */}
    {mood === "wave" && (
      <g transform="translate(112, 68) rotate(-25)">
        <path
          d="M0 6 C0 2, 8 0, 16 2 C18 6, 16 12, 10 14 Z"
          fill={P.white}
          stroke={P.ink.dark}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      </g>
    )}
  </g>
);

// --- 5 ADEGAN FITUR UTAMA + 1 INTRO ---

/**
 * 0. INTRO SCENE: Kompas Panduan Maritim SUAR
 */
const IntroScene: React.FC = () => (
  <g>
    <AmbientHalo tint="teal" />

    {/* Bintang Kompas Navigasi Besar */}
    <path
      d="M160 48 L174 134 L260 150 L174 166 L160 252 L146 166 L60 150 L146 134 Z"
      fill={P.teal.deep}
      fillOpacity="0.25"
      stroke={P.teal.base}
      strokeWidth="2.5"
    />
    {/* Cincin tengah kompas */}
    <circle
      cx="160"
      cy="150"
      r="28"
      fill={P.teal.dark}
      stroke={P.teal.base}
      strokeWidth="3"
    />
    <text
      x="160"
      y="144"
      textAnchor="middle"
      fill={P.white}
      fontSize="13"
      fontWeight="bold"
      letterSpacing="1"
    >
      N
    </text>
    <text
      x="160"
      y="164"
      textAnchor="middle"
      fill={P.teal.light}
      fontSize="10"
      fontWeight="bold"
    >
      SUAR
    </text>

    {/* Maskot Si Suar Berdiri di Atas Kompas */}
    <SuarMascot x={126} y={15} scale={0.46} mood="wave" />

    <Sparkle cx="80" cy="75" size={6} color={P.sun.glow} />
    <Sparkle cx="245" cy="85" size={5} color={P.teal.light} />
    <Sparkle cx="255" cy="215" size={6} color={P.sun.glow} />
    <Waves y={265} opacity={0.35} />
  </g>
);

/**
 * 1. LISTING TERVERIFIKASI
 * Dermaga kayu, 3 perahu ramah, clipboard centang KSOP, dan Si Suar menginspeksi kelaikan.
 */
const ListingScene: React.FC = () => (
  <g>
    <AmbientHalo tint="teal" />

    {/* Teluk & Lautan */}
    <rect x="25" y="175" width="270" height="90" rx="12" fill={P.water.deep} opacity="0.18" />

    {/* Perahu Wisata Kiri (Speedboat Ceria) */}
    <g transform="translate(42, 155)" className="suar-anim-rock">
      <path
        d="M0 22 Q16 32 36 22 L32 8 H6 Z"
        fill={P.coral.base}
        stroke={P.ink.dark}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <line x1="18" y1="8" x2="18" y2="-8" stroke={P.ink.dark} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18 -8 L32 0 L18 6 Z" fill={P.sun.base} stroke={P.ink.dark} strokeWidth="1.8" />
    </g>

    {/* Perahu Nelayan Kanan (Jukung Kayu) */}
    <g transform="translate(215, 148)" className="suar-anim-rock" style={{ animationDelay: "1.2s" }}>
      <path
        d="M0 24 Q20 34 40 24 L36 8 H4 Z"
        fill={P.teal.base}
        stroke={P.ink.dark}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <line x1="20" y1="8" x2="20" y2="-10" stroke={P.ink.dark} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 -10 L34 -2 L20 4 Z" fill={P.white} stroke={P.ink.dark} strokeWidth="1.8" />
    </g>

    {/* Dermaga Kayu Pandanarang */}
    <rect x="70" y="196" width="180" height="15" rx="4" fill={P.sand.dark} stroke={P.ink.dark} strokeWidth="2.4" />
    <rect x="85" y="211" width="10" height="34" rx="2" fill={P.sand.deep} stroke={P.ink.dark} strokeWidth="2" />
    <rect x="225" y="211" width="10" height="34" rx="2" fill={P.sand.deep} stroke={P.ink.dark} strokeWidth="2" />

    {/* Papan Clipboard Hasil Uji Kelaikan KSOP (Kiri) */}
    <g transform="translate(45, 52)">
      <rect x="0" y="0" width="68" height="88" rx="8" fill={P.white} stroke={P.ink.dark} strokeWidth="3" />
      {/* Penjepit Emas */}
      <rect x="18" y="-7" width="32" height="14" rx="4" fill={P.sun.base} stroke={P.ink.dark} strokeWidth="2" />

      {/* Checklist 3 Baris Centang */}
      {[22, 38, 54].map((y, i) => (
        <g key={i}>
          <rect x="10" y={y + 1} width="28" height="4" rx="2" fill={P.sand.dark} opacity="0.6" />
          <circle cx="50" cy={y + 3} r="7" fill={P.teal.base} />
          <path
            d={`M46 ${y + 3} L49 ${y + 6} L55 ${y}`}
            fill="none"
            stroke={P.white}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* Lencana Stempel Layak Laut */}
      <rect x="10" y="70" width="48" height="10" rx="5" fill={P.teal.light} />
      <text x="34" y="78" textAnchor="middle" fill={P.teal.dark} fontSize="7" fontWeight="bold">
        KSOP OK
      </text>
    </g>

    {/* Maskot Si Suar Inspektur Ramah (Tengah Kanan Dermaga) */}
    <SuarMascot x={152} y={70} scale={0.55} mood="celebrate" />

    {/* Badge Kapsul TERVERIFIKASI */}
    <g transform="translate(132, 42)">
      <rect x="0" y="0" width="104" height="24" rx="12" fill={P.teal.base} stroke={P.white} strokeWidth="1.5" />
      <text x="52" y="16" textAnchor="middle" fill={P.white} fontSize="10" fontWeight="bold" letterSpacing="0.5">
        ARMADA RESMI
      </text>
    </g>

    <Sparkle cx="270" cy="65" size={5} color={P.sun.glow} />
    <Sparkle cx="35" cy="80" size={4} color={P.teal.light} />
    <CuteCloud x={25} y={26} scale={0.75} />
    <CuteCloud x={220} y={32} scale={0.65} />
    <Waves y={258} opacity={0.4} />
  </g>
);

/**
 * 2. KALENDER BOOKING
 * Kalender hangat membulat, tanggal berangkat koral, kuota kursi, dan Si Suar ceria.
 */
const CalendarScene: React.FC = () => (
  <g>
    <AmbientHalo tint="coral" />

    {/* Kalender Utama Ramah */}
    <g transform="translate(48, 38)">
      {/* Badan Kalender */}
      <rect x="0" y="0" width="156" height="145" rx="14" fill={P.white} stroke={P.ink.dark} strokeWidth="3.2" />

      {/* Header Kalender Koral Hangat */}
      <path
        d="M0 14 C0 6.27 6.27 0 14 0 H142 C149.73 0 156 6.27 156 14 V40 H0 Z"
        fill={P.coral.base}
        stroke={P.ink.dark}
        strokeWidth="3.2"
      />

      {/* 2 Cincin Gantungan Kalender */}
      <rect x="32" y="-9" width="10" height="22" rx="5" fill={P.ink.base} stroke={P.ink.dark} strokeWidth="2.2" />
      <rect x="114" y="-9" width="10" height="22" rx="5" fill={P.ink.base} stroke={P.ink.dark} strokeWidth="2.2" />

      {/* Label Bulan & Ikon Cuaca */}
      <text x="78" y="27" textAnchor="middle" fill={P.white} fontSize="15" fontWeight="bold">
        November 2026
      </text>

      {/* Baris Hari & Grid Tanggal */}
      {[0, 1, 2, 3, 4, 5, 6].map((col) =>
        [0, 1, 2, 3].map((row) => {
          const day = row * 7 + col + 1;
          if (day > 28) return null;
          const cx = 17 + col * 20.3;
          const cy = 58 + row * 23;
          const isSelected = day === 15; // Tanggal booking terpilih
          const isToday = day === 10;

          return (
            <g key={`d-${day}`}>
              {isSelected && (
                <circle cx={cx} cy={cy} r="10" fill={P.teal.base} />
              )}
              {isToday && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="none"
                  stroke={P.coral.base}
                  strokeWidth="2"
                />
              )}
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fill={isSelected ? P.white : isToday ? P.coral.deep : P.ink.base}
                fontSize="10"
                fontWeight={isSelected || isToday ? "bold" : "600"}
              >
                {day}
              </text>
            </g>
          );
        })
      )}
    </g>

    {/* Kartu Sisa Kursi & Kuota Rombongan (Kanan Atas) */}
    <g transform="translate(202, 60)">
      <rect
        x="0"
        y="0"
        width="82"
        height="50"
        rx="12"
        fill={P.sun.light}
        stroke={P.ink.dark}
        strokeWidth="2.5"
      />
      <text x="41" y="20" textAnchor="middle" fill={P.ink.dark} fontSize="9.5" fontWeight="bold">
        KUOTA KURSI
      </text>
      <text x="41" y="40" textAnchor="middle" fill={P.teal.deep} fontSize="17" fontWeight="bold">
        4 / 8
      </text>
    </g>

    {/* Maskot Si Suar Menunjuk Tanggal Berangkat (Kanan Bawah) */}
    <SuarMascot x={178} y={115} scale={0.52} mood="happy" />

    {/* Balon Dialog Kecil Si Suar */}
    <g transform="translate(204, 110)">
      <rect x="0" y="0" width="76" height="22" rx="11" fill={P.white} stroke={P.ink.dark} strokeWidth="2" />
      <text x="38" y="15" textAnchor="middle" fill={P.teal.dark} fontSize="8.5" fontWeight="bold">
        Siap Berlayar!
      </text>
    </g>

    <Sparkle cx="32" cy="48" size={5} color={P.sun.glow} />
    <Sparkle cx="288" cy="45" size={5} color={P.coral.light} />
    <CuteCloud x={215} y={18} scale={0.7} />
    <Waves y={262} opacity={0.35} />
  </g>
);

/**
 * 3. PEMBAYARAN ONLINE & ESCROW
 * Kartu QRIS, koin emas DP 30%, perisai brankas escrow, dan Si Suar mengamankan transaksi.
 */
const PaymentScene: React.FC = () => (
  <g>
    <AmbientHalo tint="sun" />

    {/* Kartu Pembayaran Digital / QRIS (Kiri) */}
    <g transform="translate(38, 55)">
      <rect x="0" y="0" width="135" height="92" rx="12" fill={P.white} stroke={P.ink.dark} strokeWidth="3" />
      {/* Pita Atas Teal */}
      <path
        d="M0 12 C0 5.37 5.37 0 12 0 H123 C129.63 0 135 5.37 135 12 V24 H0 Z"
        fill={P.teal.deep}
      />
      <text x="67.5" y="16" textAnchor="middle" fill={P.white} fontSize="9" fontWeight="bold" letterSpacing="0.5">
        QRIS & E-WALLET
      </text>

      {/* QR Code Mini Otentik */}
      <g transform="translate(14, 32)">
        <rect x="0" y="0" width="46" height="46" rx="4" fill={P.ink.dark} />
        <rect x="4" y="4" width="14" height="14" rx="2" fill={P.white} />
        <rect x="28" y="4" width="14" height="14" rx="2" fill={P.white} />
        <rect x="4" y="28" width="14" height="14" rx="2" fill={P.white} />
        <rect x="7" y="7" width="8" height="8" rx="1" fill={P.ink.dark} />
        <rect x="31" y="7" width="8" height="8" rx="1" fill={P.ink.dark} />
        <rect x="7" y="31" width="8" height="8" rx="1" fill={P.ink.dark} />
        <rect x="24" y="24" width="6" height="6" fill={P.white} />
      </g>

      {/* Status Proteksi */}
      <text x="96" y="48" textAnchor="middle" fill={P.ink.base} fontSize="9" fontWeight="bold">
        Garansi DP
      </text>
      <text x="96" y="62" textAnchor="middle" fill={P.teal.base} fontSize="8">
        Sistem Escrow
      </text>
      <circle cx="96" cy="74" r="5" fill={P.seafoam.dark} />
      <path d="M93 74 L95 76 L99 71" fill="none" stroke={P.white} strokeWidth="1.8" strokeLinecap="round" />
    </g>

    {/* Koin Emas DP 30% Mengambang (Kanan Atas) */}
    <g transform="translate(205, 45)" className="suar-anim-coin">
      <circle cx="34" cy="34" r="34" fill={P.sun.base} stroke={P.ink.dark} strokeWidth="3" />
      <circle cx="34" cy="34" r="26" fill="none" stroke={P.sun.deep} strokeWidth="2.2" />
      <text x="34" y="30" textAnchor="middle" fill={P.ink.dark} fontSize="12" fontWeight="bold">
        DP
      </text>
      <text x="34" y="46" textAnchor="middle" fill={P.ink.dark} fontSize="16" fontWeight="bold">
        30%
      </text>
    </g>

    {/* Perisai Escrow Terkunci Aman (Kanan Bawah) */}
    <g transform="translate(210, 130)">
      <path
        d="M32 0 C50 0 56 12 56 28 C56 50 32 64 32 64 C32 64 8 50 8 28 C8 12 14 0 32 0 Z"
        fill={P.teal.base}
        stroke={P.ink.dark}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M32 6 C46 6 48 16 48 28 C48 44 32 55 32 55 C32 55 16 44 16 28 C16 16 18 6 32 6 Z"
        fill={P.teal.deep}
      />
      {/* Gembok Perlindungan */}
      <rect x="24" y="26" width="16" height="13" rx="2" fill={P.white} stroke={P.ink.dark} strokeWidth="2" />
      <path
        d="M27 26 V21 C27 16, 37 16, 37 21 V26"
        fill="none"
        stroke={P.white}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="33" r="2" fill={P.ink.dark} />
    </g>

    {/* Maskot Si Suar di Depan Kartu */}
    <SuarMascot x={60} y={115} scale={0.52} mood="happy" />

    <Sparkle cx="180" cy="35" size={6} color={P.sun.glow} />
    <Sparkle cx="285" cy="140" size={5} color={P.teal.light} />
    <Waves y={262} opacity={0.35} />
  </g>
);

/**
 * 4. DASHBOARD ANALITIK OPERATOR
 * Layar monitor metrik armada, grafik okupansi naik, dan Si Suar nakhoda.
 */
const AnalyticsScene: React.FC = () => (
  <g>
    <AmbientHalo tint="water" />

    {/* Layar Monitor Dashboard */}
    <g transform="translate(36, 42)">
      {/* Bingkai Monitor */}
      <rect x="0" y="0" width="205" height="135" rx="12" fill={P.ink.dark} stroke={P.ink.base} strokeWidth="3" />
      {/* Header Window Bar */}
      <rect x="0" y="0" width="205" height="24" rx="12" fill={P.ink.base} />
      <circle cx="16" cy="12" r="4" fill={P.coral.base} />
      <circle cx="28" cy="12" r="4" fill={P.sun.base} />
      <circle cx="40" cy="12" r="4" fill={P.teal.base} />

      {/* Panel Grafik Batang (Kiri) */}
      <rect x="10" y="32" width="94" height="92" rx="8" fill={P.ink.deep} opacity="0.6" />
      {/* 4 Batang Okupansi */}
      <rect x="20" y="92" width="13" height="24" rx="3" fill={P.teal.base} opacity="0.75" />
      <rect x="39" y="74" width="13" height="42" rx="3" fill={P.teal.base} opacity="0.9" />
      <rect x="58" y="84" width="13" height="32" rx="3" fill={P.teal.base} opacity="0.8" />
      <rect x="77" y="58" width="13" height="58" rx="3" fill={P.coral.base} />

      {/* Garis Tren Pertumbuhan Emas */}
      <path
        d="M20 86 C34 80 48 90 58 76 C68 62 80 54 90 44"
        fill="none"
        stroke={P.sun.base}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="90" cy="44" r="4" fill={P.sun.base} />

      {/* Panel Metrik Atas (Kanan) */}
      <rect x="112" y="32" width="82" height="42" rx="8" fill={P.ink.deep} opacity="0.6" />
      <text x="153" y="48" textAnchor="middle" fill={P.teal.light} fontSize="8.5" fontWeight="bold">
        Okupansi Rata-rata
      </text>
      <text x="153" y="66" textAnchor="middle" fill={P.white} fontSize="17" fontWeight="bold">
        87%
      </text>

      {/* Panel Metrik Bawah (Kanan) */}
      <rect x="112" y="82" width="82" height="42" rx="8" fill={P.ink.deep} opacity="0.6" />
      <text x="153" y="98" textAnchor="middle" fill={P.coral.light} fontSize="8.5" fontWeight="bold">
        Trip Terselesaikan
      </text>
      <text x="153" y="116" textAnchor="middle" fill={P.white} fontSize="17" fontWeight="bold">
        24 Trip
      </text>
    </g>

    {/* Penyangga Kaki Monitor */}
    <rect x="120" y="177" width="38" height="8" rx="4" fill={P.ink.light} stroke={P.ink.dark} strokeWidth="2" />
    <rect x="134" y="174" width="10" height="6" fill={P.ink.light} />

    {/* Lencana OPERATOR KAPAL */}
    <g transform="translate(210, 68)">
      <rect x="0" y="0" width="76" height="22" rx="11" fill={P.coral.base} stroke={P.white} strokeWidth="1.2" />
      <text x="38" y="15" textAnchor="middle" fill={P.white} fontSize="9" fontWeight="bold">
        OPERATOR
      </text>
    </g>

    {/* Maskot Si Suar Nakhoda di Samping Monitor */}
    <SuarMascot x={198} y={88} scale={0.48} mood="celebrate" />

    <Sparkle cx="52" cy="30" size={5} color={P.sun.glow} />
    <Sparkle cx="282" cy="165" size={5} color={P.teal.light} />
    <Waves y={262} opacity={0.3} />
  </g>
);

/**
 * 5. PAKET WISATA BAHARI
 * Matahari sunset koral, perahu wisata berbendera, pulau mangrove, dan Si Suar siap menjelajah.
 */
const PackageScene: React.FC = () => (
  <g>
    <AmbientHalo tint="coral" />

    {/* Matahari Sunset Hangat */}
    <circle cx="160" cy="115" r="48" fill={P.sun.glow} opacity="0.25" />
    <circle cx="160" cy="115" r="32" fill={P.sun.base} opacity="0.45" />
    <circle cx="160" cy="115" r="20" fill={P.coral.base} opacity="0.6" />

    {/* Pulau Karang & Mangrove Kiri */}
    <g transform="translate(18, 145)">
      <ellipse cx="44" cy="32" rx="44" ry="14" fill={P.sand.dark} stroke={P.ink.dark} strokeWidth="2.2" />
      {/* Batang Pohon Kelapa */}
      <line x1="32" y1="32" x2="38" y2="-6" stroke={P.sand.deep} strokeWidth="3.2" strokeLinecap="round" />
      {/* Daun Kelapa Membulat */}
      <ellipse cx="42" cy="-8" rx="18" ry="12" fill={P.teal.base} stroke={P.ink.dark} strokeWidth="2" />
      <ellipse cx="34" cy="-4" rx="14" ry="9" fill={P.seafoam.dark} stroke={P.ink.dark} strokeWidth="1.6" />
    </g>

    {/* Kartu Promo Paket Wisata Unggulan (Kanan) */}
    <g transform="translate(160, 42)">
      <rect x="0" y="0" width="118" height="74" rx="12" fill={P.white} stroke={P.ink.dark} strokeWidth="2.8" />
      {/* Pita Atas Koral */}
      <path
        d="M0 12 C0 5.37 5.37 0 12 0 H106 C112.63 0 118 5.37 118 12 V22 H0 Z"
        fill={P.coral.base}
      />
      <text x="59" y="15" textAnchor="middle" fill={P.white} fontSize="8.5" fontWeight="bold">
        PAKET POPULER
      </text>

      {/* Deskripsi Paket */}
      <text x="12" y="38" fill={P.ink.dark} fontSize="9.5" fontWeight="bold">
        Sunset Teluk Penyu
      </text>
      <text x="12" y="50" fill={P.ink.light} fontSize="7.5">
        Snorkeling & Mangrove
      </text>

      {/* Badge Harga Ramah */}
      <rect x="10" y="56" width="56" height="13" rx="6.5" fill={P.sun.light} />
      <text x="38" y="66" textAnchor="middle" fill={P.ink.dark} fontSize="8.5" fontWeight="bold">
        Mulai Rp 250K
      </text>
    </g>

    {/* Perahu Wisata Bahari di Perairan */}
    <g transform="translate(68, 175)" className="suar-anim-rock">
      <path
        d="M0 26 Q32 38 68 26 Q62 10 54 8 H14 Q6 10 0 26 Z"
        fill={P.coral.base}
        stroke={P.ink.dark}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Tiang Bendera */}
      <line x1="34" y1="8" x2="34" y2="-24" stroke={P.ink.dark} strokeWidth="2.6" strokeLinecap="round" />
      {/* Bendera Wisata Teal */}
      <path d="M34 -24 L56 -15 L34 -6 Z" fill={P.teal.base} stroke={P.ink.dark} strokeWidth="2" strokeLinejoin="round" />
    </g>

    {/* Maskot Si Suar di Atas Perahu */}
    <SuarMascot x={58} y={55} scale={0.46} mood="wave" />

    <CuteCloud x={8} y={22} scale={0.7} />
    <CuteCloud x={112} y={12} scale={0.55} />
    <Sparkle cx="140" cy="38" size={5} color={P.sun.glow} />
    <Waves y={242} opacity={0.4} />
    <Waves y={262} opacity={0.25} />
  </g>
);

// --- REGISTRY KOMPONEN ---

const SCENES: Record<string, React.FC> = {
  intro: IntroScene,
  "listing-terverifikasi": ListingScene,
  "kalender-booking": CalendarScene,
  "pembayaran-online": PaymentScene,
  "dashboard-analitik": AnalyticsScene,
  "paket-wisata": PackageScene,
};

interface FeatureIllustrationProps {
  id: string;
  className?: string;
}

export const FeatureIllustration: React.FC<FeatureIllustrationProps> = ({
  id,
  className = "",
}) => {
  const Scene = SCENES[id] ?? IntroScene;

  return (
    <svg
      key={id}
      viewBox="0 0 320 300"
      role="presentation"
      aria-hidden="true"
      className={`h-full w-full ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Scene />
    </svg>
  );
};

export default FeatureIllustration;
