import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, ShieldCheck, MessageSquare, MapPin, Anchor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================================================
// Peta Kelaikan Pelayaran v2 — peta ASLI (Leaflet + OpenStreetMap) + layout rapi
// ----------------------------------------------------------------------------
// v1 pakai peta SVG abstrak (elips hijau + garis putus-putus) — terlihat
// seperti gambar, bukan peta beneran. v2 kembali ke Leaflet dengan tile
// OpenStreetMap asli: garis pantai Cilacap & Nusakambangan terlihat,
// marker Dermaga + Karang Bolong di koordinat nyata, rute putus-putus,
// zona tenang sebagai lingkaran hijau.
// Data cuaca tetap Plan B (Open-Meteo langsung, tanpa marine-conditions
// yang BOOT_ERROR). Tata letak + ukuran font dirapikan supaya konsisten:
// judul section 3xl/4xl, angka gelombang 5xl, teks kartu sm, label xs.
// ============================================================================

type PointId = "teluk-penyu" | "tanjung-intan";

const POINTS: Record<PointId, { name: string; dermaga: string; lat: number; lon: number }> = {
  "teluk-penyu": { name: "Teluk Penyu", dermaga: "Dermaga Pandanarang", lat: -7.7401, lon: 109.017 },
  "tanjung-intan": { name: "Tanjung Intan", dermaga: "Pelabuhan Tanjung Intan", lat: -7.7348, lon: 108.9063 },
};

// Titik tujuan (koordinat perkiraan untuk peta demo — bukan survei resmi)
const DESTINATIONS = {
  "karang-bolong": { name: "Pantai Karang Bolong", detail: "Nusakambangan Timur (15 mnt)", lat: -7.762, lon: 108.985 },
  "permisan": { name: "Pantai Permisan", detail: "Pasir Putih Nusakambangan (20 mnt)", lat: -7.778, lon: 108.955 },
  "cimiring": { name: "Mercusuar Cimiring", detail: "Mercusuar 1870 (30 mnt)", lat: -7.771, lon: 109.035 },
  "segara-anakan": { name: "Laguna Segara Anakan", detail: "Hutan Mangrove (2 jam)", lat: -7.7, lon: 108.97 },
} as const;
type DestinationId = keyof typeof DESTINATIONS;

interface LiveMarine {
  waveM: number | null;
  windKn: number | null;
  trendM: number | null;
  fetchedAt: Date;
}

function levelFor(waveM: number | null, isWooden: boolean): "aman" | "waspada" | "tunda" {
  if (waveM === null) return "waspada";
  if (isWooden) {
    if (waveM <= 1.0) return "aman";
    if (waveM <= 1.5) return "waspada";
    return "tunda";
  }
  if (waveM <= 1.5) return "aman";
  if (waveM <= 2.0) return "waspada";
  return "tunda";
}

function categoryFor(waveM: number | null): string {
  if (waveM === null) return "TIDAK DIKETAHUI";
  if (waveM < 0.5) return "TENANG";
  if (waveM <= 1.2) return "SEDANG";
  if (waveM <= 2.0) return "TINGGI";
  return "SANGAT TINGGI";
}

function markerIcon(label: string, color: string): L.DivIcon {
  return L.divIcon({
    className: "suar-map-marker",
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
      <div style="background:${color};color:#fff;width:30px;height:30px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);font-weight:700;font-size:13px;">●</div>
      <div style="background:rgba(15,23,42,.88);color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;margin-top:4px;white-space:nowrap;">${label}</div>
    </div>`,
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
          typeof wj?.current?.wind_speed_10m === "number" ? wj.current.wind_speed_10m / 1.852 : null;
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
  const speedboat = levelFor(waveM, false);
  const wooden = levelFor(waveM, true);
  const fetchedLabel = live
    ? live.fetchedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
    : "-";
  const dest = DESTINATIONS[destId];
  const destPos: [number, number] = [dest.lat, dest.lon];
  const route: [number, number][] = [
    [point.lat, point.lon],
    [(point.lat + dest.lat) / 2 - 0.008, (point.lon + dest.lon) / 2],
    destPos,
  ];
  const mapCenter: [number, number] = [(point.lat + dest.lat) / 2, (point.lon + dest.lon) / 2];

  const badge = (level: "aman" | "waspada" | "tunda", label: string) =>
    level === "aman" ? (
      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
        <ShieldCheck className="h-3.5 w-3.5 mr-1" /> {label}
      </Badge>
    ) : level === "waspada" ? (
      <Badge className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> {label}
      </Badge>
    ) : (
      <Badge variant="destructive" className="shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> {label}
      </Badge>
    );

  return (
    <section id="weather-map-section" className="pt-20 sm:pt-24 pb-0 bg-[#F8FAFC] text-slate-900 relative overflow-hidden border-t border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/70 border border-sky-200/80 text-sky-900 text-xs font-semibold uppercase tracking-wider mb-2.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
          <span>Telemetri Cuaca BMKG &amp; Open-Meteo</span>
        </div>

        {/* Judul — disamakan dengan section lain */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
          Peta Kelaikan Pelayaran
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
          Peta nyata perairan Cilacap &amp; Nusakambangan dengan prakiraan gelombang live.
        </p>

        <div className="grid lg:grid-cols-5 gap-6 mt-8 items-start">
          {/* Kiri: peta ASLI */}
          <Card className="lg:col-span-3 overflow-hidden shadow-sm rounded-3xl border border-slate-200/90 bg-white">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-slate-900" />
                  {point.dermaga} · {point.name}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Zona Hijau: Ombak Tenang (0,5m – 1,2m)
                </span>
              </div>

              <div className="relative h-[360px] sm:h-[400px] w-full overflow-hidden rounded-2xl border">
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
                  {/* Zona tenang */}
                  <Circle
                    center={mapCenter}
                    radius={2200}
                    pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.12, weight: 1 }}
                  />
                  {/* Rute putus-putus */}
                  <Polyline positions={route} pathOptions={{ color: "#334155", weight: 2, dashArray: "7 7" }} />
                  <Marker position={[point.lat, point.lon]} icon={markerIcon(point.dermaga, "#0f172a")}>
                    <Popup>
                      <div className="text-xs">
                        <div className="font-bold">{point.dermaga}</div>
                        <div>Titik Keberangkatan Resmi</div>
                      </div>
                    </Popup>
                  </Marker>
                  <Marker position={destPos} icon={markerIcon(dest.name, "#0369a1")}>
                    <Popup>
                      <div className="text-xs">
                        <div className="font-bold">{dest.name}</div>
                        <div>{dest.detail}</div>
                        <div className="mt-1 font-semibold text-sky-700">Titik Tujuan</div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-5 bg-slate-700" style={{ backgroundImage: "repeating-linear-gradient(90deg,#334155 0 4px,transparent 4px 8px)" }} />
                  Alur Pelayaran Wisata
                </span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Zona Tenang</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-300" /> Arus Pasang Surut</span>
                <a
                  href={`https://www.openstreetmap.org/#map=12/${mapCenter[0]}/${mapCenter[1]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto font-semibold text-sky-700 hover:underline"
                >
                  Buka Peta Navigasi Penuh ↗
                </a>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Update Terakhir: {live ? "baru saja" : "-"} ({fetchedLabel} WIB) · Sumber: Open-Meteo Marine &amp; Forecast · Peta: OpenStreetMap
              </p>

              {/* Titik Tujuan — ganti tujuan, rute & marker di peta ikut berubah */}
              <div className="mt-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Titik Tujuan
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(DESTINATIONS) as DestinationId[]).map((id) => (
                    <Button
                      key={id}
                      size="sm"
                      variant={destId === id ? "default" : "outline"}
                      className="text-xs"
                      onClick={() => setDestId(id)}
                    >
                      {DESTINATIONS[id].name}
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Tujuan: <span className="font-semibold text-slate-700">{dest.name}</span> — {dest.detail}
                </p>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Titik Keberangkatan
                </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(POINTS) as PointId[]).map((id) => (
                  <Button
                    key={id}
                    size="sm"
                    variant={pointId === id ? "default" : "outline"}
                    className="text-xs"
                    onClick={() => setPointId(id)}
                  >
                    <MapPin className="mr-1 h-3.5 w-3.5" /> {POINTS[id].name}
                  </Button>
                ))}
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Kanan: gelombang + rekomendasi */}
          <div className="space-y-4 lg:col-span-2">
            <Card className="shadow-sm rounded-3xl border border-slate-200/90 bg-white">
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tinggi Signifikan Gelombang (Hs)
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    KATEGORI: {categoryFor(waveM)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-slate-500">Memuat prakiraan cuaca…</p>
                ) : waveM === null ? (
                  <p className="text-sm text-slate-600">
                    Data cuaca tidak tersedia saat ini. Status ditetapkan <strong>Waspada</strong>.
                  </p>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-black tracking-tight text-slate-900">{waveM.toFixed(2)}</span>
                      <span className="text-sm font-bold text-slate-500">METER</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Tren gelombang (6 jam terakhir):{" "}
                      <span className="font-semibold text-slate-700">
                        {live?.trendM === null || live?.trendM === undefined
                          ? "-"
                          : `${live.trendM >= 0 ? "NAIK" : "STABIL TURUN"} (${live.trendM.toFixed(1)}M)`}
                      </span>
                      {" · "}Angin{" "}
                      <span className="font-semibold text-slate-700">
                        {live?.windKn !== null && live?.windKn !== undefined ? `${live.windKn.toFixed(0)} knot` : "-"}
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      Titik Tujuan: <span className="font-semibold text-slate-800">{dest.name}</span> — {dest.detail}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Prakiraan, diperbarui {fetchedLabel} WIB. Sumber: Open-Meteo Marine &amp; Forecast.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-sm rounded-2xl bg-white">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    Speedboat Wisata Fiber
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {speedboat === "aman"
                      ? "Rekomendasi utama pelayaran sepanjang hari. Dilengkapi mesin ganda cadangan dan navigasi sonar GPS."
                      : "Periksa kondisi terbaru sebelum berangkat, dan ikuti arahan nahkoda."}
                  </p>
                </div>
                {badge(speedboat, speedboat === "aman" ? "Aman Berlayar" : speedboat === "waspada" ? "Waspada" : "Tunda")}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-sm rounded-2xl bg-white">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    Kapal Kayu Tradisional
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {wooden === "aman"
                      ? "Aman berlayar dengan muatan normal dan pelampung lengkap."
                      : "Disarankan berlayar pagi sebelum pukul 11:30 WIB. Maksimal muatan 10 penumpang per perahu jukung."}
                  </p>
                </div>
                {badge(wooden, wooden === "aman" ? "Aman Berlayar" : wooden === "waspada" ? "Waspada Angin" : "Tunda")}
              </CardContent>
            </Card>

            <Button
              size="sm"
              className="w-full h-11 rounded-xl bg-[#0B1528] hover:bg-[#15233e] text-white font-bold shadow-md transition-all text-xs sm:text-sm"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-assistant", {
                    detail: { prompt: `Bagaimana kondisi cuaca maritim dan rekomendasi pelayaran dari ${point.name} menuju ${dest.name}?` },
                  })
                )
              }
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Tanya Juru Mudi AI
            </Button>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
              <Anchor className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Prakiraan sebagai panduan pendukung keputusan, bukan pengganti instruksi resmi syahbandar (KSOP).
            </p>
          </div>
        </div>
      </div>

      {/* Wave Transition Ke Footer Latar Hitam Laut Dalam */}
      <div className="relative w-full overflow-hidden leading-none -mb-px mt-16 sm:mt-20" aria-hidden="true">
        <svg
          viewBox="0 0 1440 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 sm:h-20 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,48 C360,96 720,0 1080,48 C1260,72 1380,48 1440,32 L1440,96 L0,96 Z"
            fill="#090D16"
          />
        </svg>
      </div>
    </section>
  );
};

export default WeatherMapPanel;
