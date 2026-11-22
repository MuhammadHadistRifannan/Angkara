import React, { useEffect, useState } from "react";
import { Waves, Wind } from "lucide-react";

/**
 * Chip cuaca live di hero Scrollcraft (Opsi A, 2026-11-19).
 *
 * Plan B: fetch langsung ke Open-Meteo dari browser (bypass Supabase)
 * karena Edge Function marine-conditions masih BOOT_ERROR.
 * Gelombang dari Open-Meteo Marine, angin dari Open-Meteo Forecast
* (km/h ÷ 1,852 → knot). Status Aman bila gelombang ≤ 1,2 m, Waspada
 * bila di atasnya — ambang 1,2 m ini sama dengan batas zona tenang di
 * peta (0,5m – 1,2m), supaya status hero tidak pernah bertentangan
 * dengan kategori gelombang di Peta Kelaikan Pelayaran.
 */
export const HeroWeatherChip: React.FC = () => {
  const [waveM, setWaveM] = useState<number | null>(null);
  const [windKn, setWindKn] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadMarine() {
      try {
        const [marineRes, windRes] = await Promise.all([
          fetch(
            "https://marine-api.open-meteo.com/v1/marine?latitude=-7.7401&longitude=109.017&current=wave_height,wave_direction,wave_period&timezone=Asia%2FJakarta"
          ),
          fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=-7.7401&longitude=109.017&current=wind_speed_10m,wind_direction_10m&timezone=Asia%2FJakarta"
          ),
        ]);
        const marine = await marineRes.json();
        const wind = await windRes.json();
        const wave = marine.current?.wave_height ?? null;
        const windKmh = wind.current?.wind_speed_10m ?? null;
        if (!mounted) return;
        if (wave !== null) setWaveM(wave);
        if (windKmh !== null) setWindKn(windKmh / 1.852);
        setLevel(wave !== null && wave > 1.2 ? "Waspada" : "Aman");
        setFetchedAt(new Date().toISOString());
      } catch {
        if (mounted) {
          setError(true);
          // Data tidak tersedia — tampilkan Waspada (batas aman konservatif),
          // bukan status loading selamanya.
          setLevel("Waspada");
        }
      }
    }

    loadMarine();
    return () => {
      mounted = false;
    };
  }, []);

  const updatedLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      })
    : "";

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Kontainer Utama Cuaca Maritim Glassmorphism */}
      <div className="inline-flex items-center gap-2.5 sm:gap-4 rounded-full bg-slate-950/65 backdrop-blur-xl border border-white/20 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm text-white shadow-[0_8px_32px_rgba(0,0,0,0.36),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300 hover:border-cyan-400/40 hover:bg-slate-950/75">
        {/* Status Kelaikan Pelayaran dengan Radar Pulse */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                level === null
                  ? "bg-slate-400"
                  : level === "Aman"
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                level === "Aman" ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
          </span>
          <span
            className={`font-semibold tracking-wide ${
              level === "Aman" ? "text-emerald-300" : "text-amber-300"
            }`}
          >
            {level === null
              ? "Memuat cuaca…"
              : level === "Aman"
              ? "Aman Berlayar"
                : "Waspada Cuaca"}
          </span>
        </div>

        {/* Pemisah Vertikal */}
        <div className="h-3.5 w-px bg-white/20" />

        {/* Tinggi Gelombang */}
        <div className="flex items-center gap-1.5 font-medium text-slate-200">
          <Waves className="h-4 w-4 text-cyan-300 shrink-0" />
          <span>
            {error
              ? "—"
              : waveM !== null
              ? `${waveM.toFixed(2)} m`
              : "Memuat…"}
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px] font-normal">
            gelombang
          </span>
        </div>

        {/* Pemisah Vertikal */}
        <div className="h-3.5 w-px bg-white/20" />

        {/* Kecepatan Angin */}
        <div className="flex items-center gap-1.5 font-medium text-slate-200">
          <Wind className="h-4 w-4 text-cyan-300 shrink-0" />
          <span>
            {windKn !== null ? `${Math.round(windKn)} knot` : "—"}
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px] font-normal">
            angin
          </span>
        </div>

        {/* Pemisah Vertikal (Desktop) */}
        <div className="hidden md:block h-3.5 w-px bg-white/20" />

        {/* Lokasi & Update (Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-300 text-[11px]">
          <span className="text-cyan-200/90 font-medium">Perairan Teluk Penyu</span>
          {updatedLabel && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-slate-400">{updatedLabel} WIB</span>
            </>
          )}
        </div>
      </div>

      {/* Info Tambahan Halus di Bawah Kontainer */}
      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-300/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium">
        <span>Stasiun Maritim Cilacap</span>
        <span>•</span>
        <span>Sensor Live BMKG / Open-Meteo</span>
      </div>
    </div>
  );
};

export default HeroWeatherChip;
