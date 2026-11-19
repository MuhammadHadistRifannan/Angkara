import React from "react";

/**
 * Ilustrasi garis (SVG) buatan sendiri untuk panggung fitur.
 * Satu gaya untuk semua: goresan tipis, bingkai bezel kompas, satu aksen cyan.
 * Pengganti model 3D bawaan (lihat USE_3D_MODELS di FeaturesStage.tsx).
 * Animasi gambar-garis memakai kelas .suar-draw (index.css) dan mati otomatis
 * bila pengguna memilih reduced-motion.
 */

const ACCENT_FILL = "rgba(56, 189, 248, 0.18)";
const PANEL_FILL = "#06192b";

// Bingkai bezel: lingkaran ganda + 60 garis skala, seperti cincin kompas.
const Bezel: React.FC = () => (
  <g aria-hidden="true">
    <circle cx="160" cy="160" r="152" stroke="rgba(125,211,252,0.22)" strokeWidth="1.5" />
    <circle cx="160" cy="160" r="132" stroke="rgba(125,211,252,0.12)" strokeWidth="1" />
    {Array.from({ length: 60 }).map((_, i) => {
      const a = (i * 6 * Math.PI) / 180;
      const major = i % 5 === 0;
      const r1 = 152;
      const r2 = major ? 142 : 147;
      return (
        <line
          key={i}
          x1={160 + Math.sin(a) * r1}
          y1={160 - Math.cos(a) * r1}
          x2={160 + Math.sin(a) * r2}
          y2={160 - Math.cos(a) * r2}
          stroke={major ? "rgba(125,211,252,0.5)" : "rgba(125,211,252,0.25)"}
          strokeWidth={major ? 1.5 : 1}
        />
      );
    })}
  </g>
);

// Bagan pelayaran bertanda centang: Listing Terverifikasi
const Listing: React.FC = () => (
  <g>
    <path className="d" pathLength={1} d="M96 88 H200 L232 120 V232 H96 Z" />
    <path className="d" pathLength={1} d="M200 88 V120 H232" />
    <path className="d" pathLength={1} d="M136 106 V128 H152 Z" fill={ACCENT_FILL} />
    <path className="d" pathLength={1} d="M124 131 H158 L152 139 H130 Z" />
    <path className="d" pathLength={1} d="M110 156 q12 -10 24 0 t24 0 t24 0 t24 0" />
    <path className="d" pathLength={1} d="M110 176 q12 -10 24 0 t24 0 t24 0 t24 0" />
    <path className="d" pathLength={1} d="M110 196 q12 -10 24 0 t24 0" />
    <circle className="d" pathLength={1} cx="216" cy="214" r="26" fill={PANEL_FILL} />
    <circle cx="216" cy="214" r="19" strokeWidth="1" opacity="0.5" />
    <path className="d" pathLength={1} d="M204 214 l8 8 l14 -16" strokeWidth="3" />
  </g>
);

// Kalender dengan tanda gelombang: Kalender Booking
const Calendar: React.FC = () => {
  const cols = [112, 136, 160, 184, 208];
  const rows = [152, 174, 196, 218];
  return (
    <g>
      <rect className="d" pathLength={1} x="88" y="104" width="144" height="128" rx="10" />
      <path className="d" pathLength={1} d="M88 134 H232" />
      <path className="d" pathLength={1} d="M122 92 V116 M198 92 V116" strokeWidth="3" />
      <path className="d" pathLength={1} d="M104 121 q6 -6 12 0 t12 0 t12 0" opacity="0.7" />
      <rect x="124" y="164" width="72" height="20" rx="10" fill={ACCENT_FILL} />
      {rows.map((y) =>
        cols.map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="currentColor" stroke="none" opacity="0.6" />
        ))
      )}
    </g>
  );
};

// Tiket bergerigi dengan stempel: Pembayaran Online
const Payment: React.FC = () => (
  <g>
    <path
      className="d"
      pathLength={1}
      d="M84 112 H236 V144 a16 16 0 0 0 0 32 V208 H84 V176 a16 16 0 0 0 0 -32 Z"
    />
    <path d="M196 120 V200" strokeDasharray="3 5" opacity="0.6" />
    <rect className="d" pathLength={1} x="104" y="124" width="12" height="12" />
    <rect className="d" pathLength={1} x="120" y="124" width="12" height="12" fill={ACCENT_FILL} />
    <rect className="d" pathLength={1} x="136" y="124" width="12" height="12" />
    <rect className="d" pathLength={1} x="104" y="140" width="12" height="12" fill={ACCENT_FILL} />
    <rect className="d" pathLength={1} x="136" y="140" width="12" height="12" fill={ACCENT_FILL} />
    <rect className="d" pathLength={1} x="104" y="156" width="12" height="12" />
    <rect className="d" pathLength={1} x="120" y="156" width="12" height="12" fill={ACCENT_FILL} />
    <rect className="d" pathLength={1} x="136" y="156" width="12" height="12" />
    <path className="d" pathLength={1} d="M104 186 H172 M104 196 H150" opacity="0.7" />
    <circle className="d" pathLength={1} cx="216" cy="160" r="13" fill={ACCENT_FILL} />
    <path className="d" pathLength={1} d="M210 160 l4 4 l8 -8" strokeWidth="2.5" />
  </g>
);

// Grafik batang dengan garis gelombang: Dashboard Analitik
const Analytics: React.FC = () => (
  <g>
    <path className="d" pathLength={1} d="M92 92 V220 H240" />
    <rect className="d" pathLength={1} x="108" y="180" width="18" height="40" fill={ACCENT_FILL} />
    <rect className="d" pathLength={1} x="136" y="156" width="18" height="64" fill={ACCENT_FILL} />
    <rect className="d" pathLength={1} x="164" y="168" width="18" height="52" fill={ACCENT_FILL} />
    <rect className="d" pathLength={1} x="192" y="136" width="18" height="84" fill={ACCENT_FILL} />
    <path
      className="d"
      pathLength={1}
      d="M104 132 C118 116 130 142 146 124 S176 100 198 112 S226 96 236 88"
      strokeWidth="2.5"
    />
    <circle cx="236" cy="88" r="4" fill="currentColor" stroke="none" />
    <path d="M92 120 H100 M92 156 H100 M92 188 H100" opacity="0.5" />
  </g>
);

// Jangkar dengan tali: Paket Wisata Bahari
const Package: React.FC = () => (
  <g>
    <circle className="d" pathLength={1} cx="160" cy="98" r="14" />
    <path className="d" pathLength={1} d="M160 112 V238" />
    <path className="d" pathLength={1} d="M132 132 H188" />
    <path className="d" pathLength={1} d="M104 188 Q112 236 160 238 Q208 236 216 188" />
    <path className="d" pathLength={1} d="M104 188 L90 182 L98 200 Z" fill={ACCENT_FILL} />
    <path className="d" pathLength={1} d="M216 188 L230 182 L222 200 Z" fill={ACCENT_FILL} />
    <path
      className="d"
      pathLength={1}
      d="M160 150 C138 160 182 172 160 184 S138 206 160 218"
      opacity="0.7"
    />
  </g>
);

// Bintang mata angin: pembuka (intro)
const Compass: React.FC = () => (
  <g>
    <path
      className="d"
      pathLength={1}
      d="M160 64 L172 148 L256 160 L172 172 L160 256 L148 172 L64 160 L148 148 Z"
      fill={ACCENT_FILL}
    />
    <circle className="d" pathLength={1} cx="160" cy="160" r="8" />
    <path className="d" pathLength={1} d="M160 40 V56 M160 264 V280 M40 160 H56 M264 160 H280" />
  </g>
);

const DRAWINGS: Record<string, React.FC> = {
  intro: Compass,
  "listing-terverifikasi": Listing,
  "kalender-booking": Calendar,
  "pembayaran-online": Payment,
  "dashboard-analitik": Analytics,
  "paket-wisata": Package,
};

interface FeatureIllustrationProps {
  id: string;
  className?: string;
}

export const FeatureIllustration: React.FC<FeatureIllustrationProps> = ({
  id,
  className = "",
}) => {
  const Drawing = DRAWINGS[id] ?? Compass;

  return (
    <svg
      key={id}
      viewBox="0 0 320 320"
      role="presentation"
      aria-hidden="true"
      className={`suar-draw h-full w-full text-sky-200 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Bezel />
      <Drawing />
    </svg>
  );
};

export default FeatureIllustration;
