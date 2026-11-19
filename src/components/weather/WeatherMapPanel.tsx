import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Anchor,
  Compass,
  Waves,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/illustrations/Mascot";
import { WaveDivider } from "@/components/landing/WaveDivider";
import {
  calculateBoatLevel,
  getMascotMoodForStatus,
  formatWaveSummarySentence,
  getWaveCategory,
  type WeatherSafetyStatus,
} from "./weatherUiHelpers";

// ============================================================================
// Peta Kelaikan Pelayaran — Leaflet + OpenStreetMap Asli & Sentuhan Ilustratif
// ============================================================================

type PointId = "teluk-penyu" | "tanjung-intan";

const POINTS: Record<
  PointId,
  { name: string; dermaga: string; lat: number; lon: number; desc: string }
> = {
  "teluk-penyu": {
    name: "Teluk Penyu",
    dermaga: "Dermaga Pandanarang",
    lat: -7.7401,
    lon: 109.017,
    desc: "Dermaga wisata utama dekat pusat kota Cilacap",
  },
  "tanjung-intan": {
    name: "Tanjung Intan",
    dermaga: "Pelabuhan Tanjung Intan",
    lat: -7.7348,
    lon: 108.9063,
    desc: "Akses perairan tenang menuju laguna & industri",
  },
};

const DESTINATIONS = {
  "karang-bolong": {
    name: "Pantai Karang Bolong",
    detail: "Nusakambangan Timur (15 mnt)",
    lat: -7.762,
    lon: 108.985,
    icon: "umbrella",
  },
  "permisan": {
    name: "Pantai Permisan",
    detail: "Pasir Putih Nusakambangan (20 mnt)",
    lat: -7.778,
    lon: 108.955,
    icon: "umbrella",
  },
  "cimiring": {
    name: "Mercusuar Cimiring",
    detail: "Mercusuar 1870 (30 mnt)",
    lat: -7.771,
    lon: 109.035,
    icon: "lighthouse",
  },
  "segara-anakan": {
    name: "Laguna Segara Anakan",
    detail: "Hutan Mangrove (2 jam)",
    lat: -7.7,
    lon: 108.97,
    icon: "mangrove",
  },
} as const;
type DestinationId = keyof typeof DESTINATIONS;

interface LiveMarine {
  waveM: number | null;
  windKn: number | null;
  trendM: number | null;
  fetchedAt: Date;
}

// Marker Kustom Titik Keberangkatan (Perahu Mungil dengan Bendera)
function departureIcon(label: string): L.DivIcon {
  return L.divIcon({
    className: "suar-dep-marker",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);pointer-events:auto;" tabindex="0" aria-label="Keberangkatan: ${label}">
        <div style="width:36px;height:36px;border-radius:50%;background:#0F172A;border:2.5px solid #FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(15,23,42,0.4);position:relative;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 19h20M4 19l2-8h12l2 8M12 3v8M12 3l5 3-5 3" />
          </svg>
          <div style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:#14B8A6;border:1.5px solid #fff;"></div>
        </div>
        <div style="background:#0F172A;color:#FFFFFF;font-size:11px;font-weight:700;padding:2px 8px;border-radius:9999px;margin-top:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.2);">
          ${label}
        </div>
      </div>
    `,
    iconSize: [0, 0],
  });
}

// Marker Kustom Titik Tujuan (Ikon Sesuai Tempat + Pantulan Halus Saat Terpilih)
function destinationIcon(label: string, iconType: string, isSelected: boolean): L.DivIcon {
  let iconSvg = "";
  if (iconType === "lighthouse") {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 20h12M9 20l1-12h4l1 12M10 8h4M12 4v4M8 4h8" />
      </svg>
    `;
  } else if (iconType === "mangrove") {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    `;
  } else {
    // Payung Pantai
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zM12 11v9c0 1.5-1 2-2 2" />
      </svg>
    `;
  }

  const bgGradient = isSelected ? "linear-gradient(135deg, #0284C7, #0D9488)" : "#0369A1";
  const ringStyle = isSelected ? "outline: 3px solid #38BDF8; outline-offset: 2px;" : "";
  const bounceClass = isSelected ? "suar-dest-bounce" : "";

  return L.divIcon({
    className: "suar-dest-marker",
    html: `
      <div class="${bounceClass}" style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);pointer-events:auto;" tabindex="0" aria-label="Tujuan: ${label}">
        <div style="width:34px;height:34px;border-radius:50%;background:${bgGradient};border:2.5px solid #FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(2,132,199,0.4);${ringStyle}">
          ${iconSvg}
        </div>
        <div style="background:${isSelected ? "#0284C7" : "#0F172A"};color:#FFFFFF;font-size:11px;font-weight:${isSelected ? "800" : "600"};padding:2px 8px;border-radius:9999px;margin-top:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.25);">
          ${label}
        </div>
      </div>
    `,
    iconSize: [0, 0],
  });
}

// Hiasan Laut Dekoratif (Perahu, Burung Camar, Riak Ombak)
function oceanDecoIcon(type: "boat" | "seagull" | "wave"): L.DivIcon {
  let content = "";
  if (type === "boat") {
    content = `
      <div class="suar-boat-gentle-rock" style="pointer-events:none;opacity:0.85;">
        <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
          <path d="M2 3 L26 3 L21 12 L7 12 Z" fill="#E76F51" stroke="#0F172A" stroke-width="1.8" stroke-linejoin="round" />
          <path d="M14 3 V0 L19 2 Z" fill="#FBBF24" stroke="#0F172A" stroke-width="1.2" />
        </svg>
      </div>
    `;
  } else if (type === "seagull") {
    content = `
      <div class="suar-seagull-glide" style="pointer-events:none;opacity:0.75;">
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="#0F172A" stroke-width="1.6" stroke-linecap="round">
          <path d="M1 7 Q5 1 10 5 Q15 1 19 7" />
        </svg>
      </div>
    `;
  } else {
    content = `
      <div style="pointer-events:none;opacity:0.55;">
        <svg width="24" height="8" viewBox="0 0 24 8" fill="none" stroke="#0D9488" stroke-width="1.6" stroke-linecap="round">
          <path d="M1 5 Q6 1 12 5 Q18 1 23 5" />
        </svg>
      </div>
    `;
  }

  return L.divIcon({
    className: "suar-ocean-deco-marker",
    html: content,
    iconSize: [0, 0],
  });
}

export const WeatherMapPanel: React.FC = () => {
  const [pointId, setPointId] = useState<PointId>("teluk-penyu");
  const [destId, setDestId] = useState<DestinationId>("karang-bolong");
  const [live, setLive] = useState<LiveMarine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const p = POINTS[pointId];
      try {
        const res = await fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${p.lat}&longitude=${p.lon}` +
            `&current=wave_height,wave_direction,wave_period&hourly=wave_height&timezone=Asia%2FJakarta`
        );
        const j = await res.json();
        const waveM: number | null = j?.current?.wave_height ?? null;
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=wind_speed_10m&timezone=Asia%2FJakarta`
        );
        const wj = await wRes.json();
        const windKn =
          typeof wj?.current?.wind_speed_10m === "number"
            ? wj.current.wind_speed_10m / 1.852
            : null;
        let trendM: number | null = null;
        const hourly: number[] | undefined = j?.hourly?.wave_height;
        if (hourly && hourly.length > 6) {
          const now = hourly[hourly.length - 1];
          const sixAgo = hourly[hourly.length - 7];
          if (typeof now === "number" && typeof sixAgo === "number") trendM = now - sixAgo;
        }
        if (!cancelled) setLive({ waveM, windKn, trendM, fetchedAt: new Date() });
      } catch {
        if (!cancelled) setLive(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    const t = setInterval(load, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [pointId]);

  const point = POINTS[pointId];
  const waveM = live?.waveM ?? null;
  const speedboat = calculateBoatLevel(waveM, false);
  const wooden = calculateBoatLevel(waveM, true);

  // Status keselamatan umum: bila salah satu tunda -> tunda; bila waspada -> waspada; jika semua aman -> aman
  const overallStatus: WeatherSafetyStatus =
    speedboat === "tunda" || wooden === "tunda"
      ? "tunda"
      : speedboat === "waspada" || wooden === "waspada" || waveM === null
      ? "waspada"
      : "aman";

  const mascotMood = getMascotMoodForStatus(overallStatus);
  const summarySentence = formatWaveSummarySentence(waveM, overallStatus);

  const fetchedLabel = live
    ? live.fetchedAt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      })
    : "-";

  const dest = DESTINATIONS[destId];
  const destPos: [number, number] = [dest.lat, dest.lon];
  const route: [number, number][] = [
    [point.lat, point.lon],
    [(point.lat + dest.lat) / 2 - 0.008, (point.lon + dest.lon) / 2],
    destPos,
  ];
  const mapCenter: [number, number] = [
    (point.lat + dest.lat) / 2,
    (point.lon + dest.lon) / 2,
  ];

  const badge = (level: WeatherSafetyStatus, label: string) =>
    level === "aman" ? (
      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 font-bold px-3 py-1">
        <ShieldCheck className="h-4 w-4 mr-1.5" /> {label}
      </Badge>
    ) : level === "waspada" ? (
      <Badge className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 font-bold px-3 py-1">
        <AlertTriangle className="h-4 w-4 mr-1.5" /> {label}
      </Badge>
    ) : (
      <Badge variant="destructive" className="shrink-0 font-bold px-3 py-1">
        <AlertTriangle className="h-4 w-4 mr-1.5" /> {label}
      </Badge>
    );

  // Posisi indikator tinggi gelombang (0 - 2.5m)
  const clampedWave = Math.min(Math.max(waveM ?? 0, 0), 2.5);
  const gaugePercent = (clampedWave / 2.5) * 100;

  return (
    <section
      id="weather-map-section"
      className="pt-20 sm:pt-24 pb-0 bg-[#F8FAFC] text-slate-900 relative overflow-hidden border-t border-slate-200/60"
      style={{
        "--section-weather-bg": "#F8FAFC",
        "--section-footer-bg": "#090D16",
      } as React.CSSProperties}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Eyebrow Ramah Tanpa Kapsul Kaku */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wide uppercase text-teal-800 mb-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Cek cuaca laut sebelum berangkat</span>
        </div>

        {/* Judul Hangat & Ramah */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
          Peta Kelaikan Pelayaran
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Peta navigasi perairan Cilacap &amp; Nusakambangan dengan prakiraan gelombang live BMKG &amp; Open-Meteo.
        </p>

        <div className="grid lg:grid-cols-5 gap-6 mt-8 items-start">
          {/* Kolom Kiri: Peta Interaktif Leaflet dengan Kulit Pastel Lembut */}
          <Card className="lg:col-span-3 overflow-hidden shadow-sm rounded-3xl border border-slate-200/90 bg-white relative">
            <CardContent className="p-5 sm:p-6">
              {/* Badge Status Titik */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-teal-600" />
                  {point.dermaga} · {point.name}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Zona Hijau: Ombak Tenang (0,5m – 1,2m)
                </span>
              </div>

              {/* Bingkai Peta Membulat 24px dengan Filter Ubin Pastel */}
              <div className="relative h-[380px] sm:h-[420px] w-full overflow-hidden rounded-[24px] border border-slate-200 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
                <MapContainer
                  key={`${pointId}-${destId}`}
                  center={mapCenter}
                  zoom={12}
                  scrollWheelZoom={false}
                  className="h-full w-full z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Zona Tenang Teluk */}
                  <Circle
                    center={mapCenter}
                    radius={2200}
                    pathOptions={{
                      color: "#10B981",
                      fillColor: "#10B981",
                      fillOpacity: 0.14,
                      weight: 1.5,
                    }}
                  />

                  {/* Alur Pelayaran Wisata dengan Garis Bergerak Pelan (Marching Dash) */}
                  <Polyline
                    positions={route}
                    className="suar-marching-route"
                    pathOptions={{
                      color: "#0D9488",
                      weight: 3.5,
                      dashArray: "8 10",
                      lineCap: "round",
                    }}
                  />

                  {/* Titik Keberangkatan (Perahu Mungil) */}
                  <Marker
                    position={[point.lat, point.lon]}
                    icon={departureIcon(point.dermaga)}
                  >
                    <Popup>
                      <div className="text-xs p-1">
                        <div className="font-bold text-slate-900">{point.dermaga}</div>
                        <div className="text-slate-600">{point.desc}</div>
                        <div className="mt-1 font-semibold text-teal-700">
                          Titik Keberangkatan Resmi
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Titik Tujuan (Pin Ikonik Pantul) */}
                  <Marker
                    position={destPos}
                    icon={destinationIcon(dest.name, dest.icon, true)}
                  >
                    <Popup>
                      <div className="text-xs p-1">
                        <div className="font-bold text-slate-900">{dest.name}</div>
                        <div className="text-slate-600">{dest.detail}</div>
                        <div className="mt-1 font-semibold text-sky-700">Titik Tujuan Wisata</div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Hiasan Laut Dekoratif di Perairan Lepas */}
                  <Marker
                    position={[-7.747, 109.042]}
                    icon={oceanDecoIcon("boat")}
                    interactive={false}
                  />
                  <Marker
                    position={[-7.738, 109.03]}
                    icon={oceanDecoIcon("seagull")}
                    interactive={false}
                  />
                  <Marker
                    position={[-7.758, 109.048]}
                    icon={oceanDecoIcon("seagull")}
                    interactive={false}
                  />
                  <Marker
                    position={[-7.768, 109.028]}
                    icon={oceanDecoIcon("wave")}
                    interactive={false}
                  />
                </MapContainer>

                {/* Maskot Si Suar Mengintip dari Sudut Kanan Bawah Panel Peta (Dekoratif) */}
                <div
                  className="absolute bottom-1 right-2 z-10 pointer-events-none select-none hidden sm:block drop-shadow-md"
                  aria-hidden="true"
                >
                  <Mascot mood="wave" size={68} />
                </div>
              </div>

              {/* Legenda Ikonik Ramah */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1 w-6 rounded-full bg-teal-600 border border-teal-700/20" />
                  Alur Pelayaran Wisata
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-emerald-600/30" />
                  Zona Tenang
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400 border border-rose-500/30" />
                  Arus Pasang Surut
                </span>
                <a
                  href={`https://www.openstreetmap.org/#map=12/${mapCenter[0]}/${mapCenter[1]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto font-bold text-sky-700 hover:text-sky-800 hover:underline"
                >
                  Buka Peta Navigasi Penuh ↗
                </a>
              </div>

              {/* Kontrol 1: Mau ke mana? (Titik Tujuan) */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Compass className="w-4 h-4 text-teal-600" />
                  <span>Mau ke mana?</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(Object.keys(DESTINATIONS) as DestinationId[]).map((id) => (
                    <Button
                      key={id}
                      size="sm"
                      variant={destId === id ? "default" : "outline"}
                      className={`min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                        destId === id
                          ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                          : "bg-white text-slate-700 border-slate-300 hover:border-teal-500 hover:bg-teal-50/50"
                      }`}
                      onClick={() => setDestId(id)}
                    >
                      {DESTINATIONS[id].name}
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Tujuan: <span className="font-bold text-slate-800">{dest.name}</span> — {dest.detail}
                </p>
              </div>

              {/* Kontrol 2: Berangkat dari mana? (Titik Keberangkatan) */}
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Berangkat dari mana?</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(Object.keys(POINTS) as PointId[]).map((id) => (
                    <Button
                      key={id}
                      size="sm"
                      variant={pointId === id ? "default" : "outline"}
                      className={`min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                        pointId === id
                          ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                          : "bg-white text-slate-700 border-slate-300 hover:border-teal-500 hover:bg-teal-50/50"
                      }`}
                      onClick={() => setPointId(id)}
                    >
                      <MapPin className="mr-1.5 h-4 w-4 text-teal-600" /> {POINTS[id].name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kolom Kanan: Kartu Info Gelombang Ramah & Rekomendasi Kapal */}
          <div className="space-y-4 lg:col-span-2">
            {/* Kartu Utama: Info Gelombang Bahasa Sehari-hari + Maskot Si Suar */}
            <Card className="shadow-sm rounded-3xl border border-slate-200/90 bg-white overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                {isLoading ? (
                  <p className="text-sm text-slate-500 py-4">Memuat prakiraan cuaca…</p>
                ) : waveM === null ? (
                  <div className="py-2">
                    <div className="flex items-center gap-3 mb-3">
                      <Mascot mood="thinking" size={54} />
                      <p className="text-sm font-medium text-slate-700 leading-snug">
                        Data cuaca tidak tersedia saat ini. Status ditetapkan <strong>Waspada</strong>.
                      </p>
                    </div>
                    {badge("waspada", "Waspada")}
                  </div>
                ) : (
                  <div>
                    {/* Header Kalimat Besar Ramah + Maskot */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                          {summarySentence}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Evaluasi keselamatan maritim waktu-nyata Teluk Penyu &amp; sekitarnya.
                        </p>
                      </div>
                      <div className="shrink-0 -mt-1" aria-hidden="true">
                        <Mascot mood={mascotMood} size={64} />
                      </div>
                    </div>

                    {/* Angka Gelombang Besar & Pengukur Grafis Bertingkat */}
                    <div className="flex items-center gap-6 my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div>
                        <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 block leading-none">
                          {waveM.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1 block">
                          METER TINGGI GELOMBANG
                        </span>
                      </div>

                      {/* Pengukur Gelombang Vertikal Ilustratif dengan Indikator Perahu */}
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="relative h-14 w-full rounded-full overflow-hidden bg-slate-200 flex">
                          {/* Zona 1: Aman (0 - 1.0m / 40%) */}
                          <div className="w-[40%] bg-emerald-500" title="Zona Aman (<1.0m)" />
                          {/* Zona 2: Waspada (1.0 - 1.25m / 20%) */}
                          <div className="w-[20%] bg-amber-400" title="Zona Waspada (1.0-1.25m)" />
                          {/* Zona 3: Tunda (> 1.25m / 40%) */}
                          <div className="w-[40%] bg-rose-500" title="Zona Tunda (>1.25m)" />

                          {/* Posisi Perahu Indikator */}
                          <div
                            className="absolute top-0 bottom-0 flex items-center transition-all duration-500"
                            style={{
                              left: `${Math.min(Math.max(gaugePercent, 4), 92)}%`,
                              transform: "translateX(-50%)",
                            }}
                          >
                            <div className="bg-slate-900 text-white p-1 rounded-full shadow-md border border-white">
                              <Waves className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1.5 px-1">
                          <span className="text-emerald-700">Aman (&le;1,0m)</span>
                          <span className="text-amber-700">Waspada (&le;1,25m)</span>
                          <span className="text-rose-700">Tunda (&gt;1,25m)</span>
                        </div>
                      </div>
                    </div>

                    {/* Rincian Teknis yang Bisa Dibuka (Details / Summary) */}
                    <details className="group mt-3 border-t border-slate-200/80 pt-3">
                      <summary className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center justify-between list-none">
                        <span>Lihat detail telemetri lengkap</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-3 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tinggi Signifikan Gelombang (Hs):</span>
                          <span className="font-bold text-slate-800">{waveM.toFixed(2).replace('.', ',')} m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kategori BMKG:</span>
                          <span className="font-bold text-slate-800">
                            KATEGORI: {getWaveCategory(waveM)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tren 6 jam terakhir:</span>
                          <span className="font-bold text-slate-800">
                            {live?.trendM === null || live?.trendM === undefined
                              ? "-"
                              : `${live.trendM >= 0 ? "NAIK" : "STABIL TURUN"} (${live.trendM.toFixed(1)}M)`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kecepatan Angin:</span>
                          <span className="font-bold text-slate-800">
                            {live?.windKn !== null && live?.windKn !== undefined
                              ? `${live.windKn.toFixed(0)} knot`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Titik Tujuan:</span>
                          <span className="font-bold text-slate-800">{dest.name}</span>
                        </div>
                      </div>
                    </details>

                    {/* Baris Kredibilitas Sumber & Waktu */}
                    <p className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      Diperbarui {fetchedLabel} WIB. Sumber: Open-Meteo Marine &amp; Forecast.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kartu 1: Speedboat Wisata Fiber dengan Ilustrasi Perahu */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  {/* Ilustrasi Speedboat Kecil */}
                  <div
                    className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <svg width="34" height="20" viewBox="0 0 34 20" fill="none">
                      <path
                        d="M2 13 L32 13 L27 18 L6 18 Z"
                        fill="#0D9488"
                        stroke="#0F172A"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 13 L12 6 H22 L27 13 Z"
                        fill="#E0F2FE"
                        stroke="#0F172A"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <rect x="25" y="10" width="5" height="5" rx="1" fill="#F43F5E" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                      Speedboat Wisata Fiber
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {speedboat === "aman"
                        ? "Rekomendasi utama pelayaran cepat sepanjang hari dengan mesin ganda cadangan."
                        : "Periksa kondisi terbaru sebelum berangkat, dan selalu ikuti arahan nakhoda."}
                    </p>
                  </div>
                </div>

                {badge(
                  speedboat,
                  speedboat === "aman" ? "Aman Berlayar" : speedboat === "waspada" ? "Waspada" : "Tunda"
                )}
              </CardContent>
            </Card>

            {/* Kartu 2: Kapal Kayu Tradisional dengan Ilustrasi Jukung */}
            <Card className="border-l-4 border-l-amber-500 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  {/* Ilustrasi Kapal Kayu Jukung Kecil */}
                  <div
                    className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <svg width="34" height="20" viewBox="0 0 34 20" fill="none">
                      <path
                        d="M3 13 L31 13 L26 18 L7 18 Z"
                        fill="#D97706"
                        stroke="#0F172A"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path d="M16 13 V4 L23 8 Z" fill="#FDE68A" stroke="#0F172A" strokeWidth="1.2" />
                      <line x1="2" y1="11" x2="32" y2="11" stroke="#0F172A" strokeWidth="1" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                      Kapal Kayu Tradisional
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {wooden === "aman"
                        ? "Perahu nelayan jukung otentik berlayar santai dengan perlengkapan pelampung lengkap."
                        : "Disarankan berlayar pagi sebelum pukul 11:30 WIB dengan batas muatan perahu."}
                    </p>
                  </div>
                </div>

                {badge(
                  wooden,
                  wooden === "aman"
                    ? "Aman Berlayar"
                    : wooden === "waspada"
                    ? "Waspada Angin"
                    : "Tunda"
                )}
              </CardContent>
            </Card>

            {/* Tombol Tanya Juru Mudi AI dengan Ikon Maskot */}
            <Button
              size="sm"
              className="w-full h-12 rounded-2xl bg-[#0B1528] hover:bg-[#15233e] text-white font-bold shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-assistant", {
                    detail: {
                      prompt: `Bagaimana kondisi cuaca maritim dan rekomendasi pelayaran dari ${point.name} menuju ${dest.name}?`,
                    },
                  })
                )
              }
            >
              <div className="shrink-0 -my-1" aria-hidden="true">
                <Mascot mood="wave" size={28} />
              </div>
              <span>Tanya Juru Mudi AI</span>
            </Button>

            {/* Penafian Keselamatan Resmi KSOP */}
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
              <Anchor className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
              Prakiraan sebagai panduan pendukung keputusan, bukan pengganti instruksi resmi syahbandar (KSOP).
            </p>
          </div>
        </div>
      </div>

      {/* WaveDivider Dinamis Menuju Latar Gelap Footer (#090D16) */}
      <WaveDivider
        from="--section-weather-bg"
        to="--section-footer-bg"
        className="mt-16 sm:mt-20"
      />

      {/* Global Style CSS untuk Leaflet & Animasi Mikro */}
      <style>{`
        .leaflet-tile-pane {
          filter: saturate(0.8) brightness(1.03) contrast(0.97) hue-rotate(-5deg);
        }
        @keyframes suar-marching-dash {
          to {
            stroke-dashoffset: -36;
          }
        }
        .suar-marching-route path {
          animation: suar-marching-dash 14s linear infinite;
        }
        @keyframes suar-dest-bounce {
          0%, 100% {
            transform: translate(-50%, -100%);
          }
          50% {
            transform: translate(-50%, -110%);
          }
        }
        .suar-dest-bounce {
          animation: suar-dest-bounce 3s ease-in-out infinite;
        }
        @keyframes suar-boat-gentle-rock {
          0% {
            transform: translateY(0) rotate(-3deg);
          }
          100% {
            transform: translateY(3px) rotate(3deg);
          }
        }
        .suar-boat-gentle-rock {
          animation: suar-boat-gentle-rock 4s ease-in-out infinite alternate;
        }
        @keyframes suar-seagull-glide {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(5px, -3px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        .suar-seagull-glide {
          animation: suar-seagull-glide 6s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .suar-marching-route path,
          .suar-dest-bounce,
          .suar-boat-gentle-rock,
          .suar-seagull-glide {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default WeatherMapPanel;
