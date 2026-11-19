import React, { useEffect, useState } from "react";
import { Waves, Wind } from "lucide-react";

/**
 * Chip cuaca live di hero Scrollcraft (Opsi A, 2026-11-19).
 *
 * Plan B: fetch langsung ke Open-Meteo dari browser (bypass Supabase)
 * karena Edge Function marine-conditions masih BOOT_ERROR.
 * Gelombang dari Open-Meteo Marine, angin dari Open-Meteo Forecast
 * (km/h ÷ 1,852 → knot). Status Aman bila gelombang ≤ 1,5 m, Waspada
 * bila di atasnya — ambang yang sama dengan widget hero lama.
 */
export const HeroWeatherChip: React.FC = () => {
  const [waveM, setWaveM] = useState<number | null>(null);
  const [windKn, setWindKn] = useState<number | null>(null);
  const [level, setLevel] = useState<string>("Waspada");
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
        setLevel(wave !== null && wave > 1.5 ? "Waspada" : "Aman");
        setFetchedAt(new Date().toISOString());
      } catch {
        if (mounted) setError(true);
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
    <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-slate-950/55 backdrop-blur-md border border-white/20 px-4 py-2 text-xs sm:text-sm text-white shadow-lg">
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Waves className="h-4 w-4 text-cyan-300" />
        {error
          ? "Data cuaca tidak tersedia"
          : waveM !== null
            ? `${waveM.toFixed(2)} m`
            : "Memuat prakiraan…"}
      </span>
      <span className="hidden sm:inline text-white/40">•</span>
      <span className="inline-flex items-center gap-1.5">
        <Wind className="h-4 w-4 text-cyan-300" />
        {windKn !== null ? `${Math.round(windKn)} knot` : "—"}
      </span>
      <span className="hidden sm:inline text-white/40">•</span>
      <span
        className={`inline-flex items-center gap-1.5 font-semibold ${
          level === "Aman" ? "text-emerald-300" : "text-amber-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            level === "Aman" ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        {level === "Aman" ? "Aman Berlayar" : "Waspada"}
      </span>
      {updatedLabel && (
        <span className="text-white/60">Diperbarui {updatedLabel} WIB</span>
      )}
      <span className="text-white/50">Sumber: Open-Meteo</span>
    </div>
  );
};

export default HeroWeatherChip;
