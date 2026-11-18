import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Waves,
  Wind,
  RefreshCw,
  Anchor,
  Clock,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type SailingSafetyLevel = "aman" | "waspada" | "tunda";

export type TelemetryMode =
  | "live"
  | "simulasi_aman"
  | "simulasi_waspada"
  | "simulasi_tunda"
  | "simulasi_offline";

export interface SailingSafetyVerdict {
  level: SailingSafetyLevel;
  title: string;
  message: string;
  actionGuide: string;
  waveStatus: string;
  windStatus: string;
}

export interface MarineConditionsData {
  waveM: number | null;
  windKn: number | null;
  trendM?: number | null;
  fetchedAt: Date | string;
  source?: string;
}

export interface OperatorWeatherAdvisoryProps {
  initialData?: MarineConditionsData;
  onStatusChange?: (verdict: SailingSafetyVerdict) => void;
  className?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export function evaluateSailingSafety(
  waveM: number | null,
  windKn: number | null,
  _isWoodenBoat = true
): SailingSafetyVerdict {
  // 1. Kondisi Sensor Offline / Data Tidak Tersedia
  if (waveM === null) {
    return {
      level: "waspada",
      title: "WASPADA: Data Gelombang Tidak Tersedia (Sensor Offline)",
      message:
        "Telemetri gelombang laut saat ini tidak dapat diakses secara real-time. Standar operasional KSOP melarang penetapan status Aman otomatis bila sensor tidak aktif.",
      actionGuide:
        "Wajib pengamatan visual langsung di mulut muara Dermaga Pandanarang. Seluruh nakhoda dan penumpang WAJIB mengenakan rompi pelampung standar SOLAS.",
      waveStatus: "Sensor Offline / Tidak Tersedia",
      windStatus:
        windKn !== null ? `${windKn.toFixed(1)} knot` : "Sensor Offline",
    };
  }

  const MAX_WAVE_M = 1.25;
  const MAX_WIND_KN = 15.0;
  const WARNING_RATIO = 0.8; // 1.0 m gelombang & 12 knot angin

  const waveTunda = waveM > MAX_WAVE_M;
  const windTunda = windKn !== null && windKn > MAX_WIND_KN;

  // 2. Kondisi Tunda / Bahaya Ekstrem
  if (waveTunda || windTunda) {
    const reasons: string[] = [];
    if (waveTunda) reasons.push(`Tinggi gelombang (${waveM.toFixed(1)} m > ${MAX_WAVE_M} m)`);
    if (windTunda && windKn !== null)
      reasons.push(`Kecepatan angin (${windKn.toFixed(1)} knot > ${MAX_WIND_KN} knot)`);

    return {
      level: "tunda",
      title: "TUNDA / LARANGAN BERLAYAR: Gelombang / Angin Melebihi Batas Aman",
      message: `Peringatan Keselamatan: ${reasons.join(
        " dan "
      )}. Kondisi perairan Teluk Penyu & Selat Nusakambangan berisiko tinggi terhadap stabilitas kapal wisata.`,
      actionGuide:
        "KSOP & Syahbandar: Seluruh armada wisata DILARANG melaut ke laut lepas Teluk Penyu. Koordinasikan penjadwalan ulang atau pembatalan tiket kepada penumpang.",
      waveStatus: `Bahaya (${waveM.toFixed(1)} m > ${MAX_WAVE_M} m)`,
      windStatus:
        windKn !== null
          ? `${windKn.toFixed(1)} knot (${windKn > MAX_WIND_KN ? "Bahaya" : "Aman"})`
          : "-",
    };
  }

  // 3. Kondisi Waspada (≥ 80% batas aman)
  const waveWaspada = waveM >= MAX_WAVE_M * WARNING_RATIO;
  const windWaspada = windKn !== null && windKn >= MAX_WIND_KN * WARNING_RATIO;

  if (waveWaspada || windWaspada) {
    return {
      level: "waspada",
      title: "WASPADA CUACA LAUT: Gelombang / Angin Mendekati Ambang Batas",
      message: `Tinggi gelombang ${waveM.toFixed(
        1
      )} m dan kecepatan angin ${windKn ? windKn.toFixed(1) : 0} knot mendekati batas ambang aman kapal rakyat (1.25 m).`,
      actionGuide:
        "Pelayaran diizinkan dengan pembatasan muatan. Nakhoda dan seluruh wisatawan WAJIB mengenakan rompi pelampung standar SOLAS yang terkancing rapat.",
      waveStatus: `Waspada (${waveM.toFixed(1)} m)`,
      windStatus: windKn !== null ? `${windKn.toFixed(1)} knot` : "-",
    };
  }

  // 4. Kondisi Aman
  return {
    level: "aman",
    title: "AMAN BERLAYAR: Kondisi Laut & Cuaca Normal",
    message: `Gelombang laut ${waveM.toFixed(
      1
    )} m dan angin ${windKn ? windKn.toFixed(1) : 0} knot berada dalam ambang aman operasional perahu wisata.`,
    actionGuide:
      "Seluruh armada kapal diizinkan berlayar normal sesuai SOP Syahbandar. Pastikan manifes penumpang tercatat lengkap dan APD keselamatan tersedia di atas kapal.",
    waveStatus: `Normal (${waveM.toFixed(1)} m)`,
    windStatus: windKn !== null ? `${windKn.toFixed(1)} knot (Tenang)` : "-",
  };
}

export const OperatorWeatherAdvisory: React.FC<OperatorWeatherAdvisoryProps> = ({
  initialData,
  onStatusChange,
  className = "",
}) => {
  const [data, setData] = useState<MarineConditionsData>(() => {
    return (
      initialData || {
        waveM: null,
        windKn: null,
        trendM: null,
        fetchedAt: new Date(),
        source: "loading",
      }
    );
  });
  const [isLoading, setIsLoading] = useState(false);
  const [telemetryMode, setTelemetryMode] = useState<TelemetryMode>("live");
  const [countdown, setCountdown] = useState(30);

  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const verdict = evaluateSailingSafety(data.waveM, data.windKn, true);

  const lastLevelRef = useRef<SailingSafetyLevel | null>(null);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (lastLevelRef.current !== verdict.level) {
      const prevLevel = lastLevelRef.current;
      lastLevelRef.current = verdict.level;

      if (onStatusChangeRef.current) {
        onStatusChangeRef.current(verdict);
      }

      // Tampilkan toast alert darurat realtime saat status memburuk atau pulih
      if (!isFirstMountRef.current) {
        if (verdict.level === "tunda") {
          toast.error(
            "⚠️ PERINGATAN KSOP: Kondisi laut memburuk! Status berubah menjadi TUNDA BERLAYAR. Seluruh keberangkatan wajib ditunda.",
            { duration: 6000 }
          );
        } else if (verdict.level === "waspada" && prevLevel === "aman") {
          toast.warning(
            "⚠️ INFORMASI KSOP: Status maritim berubah menjadi WASPADA. Seluruh nakhoda dan penumpang wajib mengenakan rompi pelampung SOLAS.",
            { duration: 5000 }
          );
        } else if (verdict.level === "aman" && (prevLevel === "tunda" || prevLevel === "waspada")) {
          toast.success(
            "✅ INFORMASI KSOP: Kondisi laut kembali AMAN BERLAYAR. Seluruh armada diizinkan melaut normal.",
            { duration: 4000 }
          );
        }
      }
      isFirstMountRef.current = false;
    }
  }, [verdict]);

  const fetchLiveTelemetry = useCallback(async () => {
    if (telemetryMode !== "live") return;
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const lat = -7.7401;
      const lon = 109.017;

      const marinePromise = fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period&hourly=wave_height&timezone=Asia%2FJakarta`,
        { signal: controller.signal }
      )
        .then((res) => res.json())
        .catch(() => null);

      const forecastPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,weather_code&timezone=Asia%2FJakarta`,
        { signal: controller.signal }
      )
        .then((res) => res.json())
        .catch(() => null);

      const [marineJson, forecastJson] = await Promise.all([
        marinePromise,
        forecastPromise,
      ]);

      const waveM: number | null =
        typeof marineJson?.current?.wave_height === "number"
          ? marineJson.current.wave_height
          : null;

      const rawWindKmh = forecastJson?.current?.wind_speed_10m;
      const windKn: number | null =
        typeof rawWindKmh === "number" ? rawWindKmh / 1.852 : null;

      setData({
        waveM,
        windKn,
        trendM: null,
        fetchedAt: new Date(),
        source: "Open-Meteo Marine Live",
      });
      setCountdown(30);
    } catch {
      setData((prev) => ({
        ...prev,
        source: "Sensor Offline / Cache",
        fetchedAt: new Date(),
      }));
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [telemetryMode]);

  // Handler pengalihan skenario simulasi cuaca realtime
  const handleModeChange = (newMode: TelemetryMode) => {
    setTelemetryMode(newMode);
    switch (newMode) {
      case "simulasi_aman":
        setData({
          waveM: 0.7,
          windKn: 8.5,
          trendM: 0.1,
          fetchedAt: new Date(),
          source: "Simulasi: Aman Melaut",
        });
        break;
      case "simulasi_waspada":
        setData({
          waveM: 1.1,
          windKn: 13.0,
          trendM: 0.2,
          fetchedAt: new Date(),
          source: "Simulasi: Waspada SOLAS",
        });
        break;
      case "simulasi_tunda":
        setData({
          waveM: 1.9,
          windKn: 19.5,
          trendM: 0.6,
          fetchedAt: new Date(),
          source: "Simulasi: Badai Ekstrem Tunda",
        });
        break;
      case "simulasi_offline":
        setData({
          waveM: null,
          windKn: 12.0,
          trendM: null,
          fetchedAt: new Date(),
          source: "Simulasi: Sensor Offline",
        });
        break;
      case "live":
      default:
        fetchLiveTelemetry();
        break;
    }
  };

  // Loop Realtime: Countdown 30 detik & auto-fetch
  useEffect(() => {
    if (initialData && telemetryMode === "live") {
      setData(initialData);
      setIsLoading(false);
      return;
    }

    if (telemetryMode !== "live") {
      return;
    }

    fetchLiveTelemetry();

    // Timer hitungan mundur realtime setiap detik
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveTelemetry();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialData, telemetryMode, fetchLiveTelemetry]);

  // Formatter jam WIB
  const formattedTime = new Date(data.fetchedAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  // Skema styling berdasarkan level keselamatan
  const styles = {
    aman: {
      wrapper: "bg-slate-900 border-emerald-500/30 text-white shadow-lg",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      accentDot: "bg-emerald-400",
      bannerAccent: "border-l-4 border-l-emerald-500",
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      tagColor: "text-emerald-400",
    },
    waspada: {
      wrapper: "bg-slate-900 border-amber-500/40 text-white shadow-lg",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      accentDot: "bg-amber-400",
      bannerAccent: "border-l-4 border-l-amber-500",
      icon: <AlertTriangle className="h-6 w-6 text-amber-400" />,
      tagColor: "text-amber-400",
    },
    tunda: {
      wrapper: "bg-slate-950 border-rose-500/50 text-white shadow-xl ring-1 ring-rose-500/40",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/50",
      accentDot: "bg-rose-500 animate-ping",
      bannerAccent: "border-l-4 border-l-rose-500",
      icon: <AlertOctagon className="h-6 w-6 text-rose-400" />,
      tagColor: "text-rose-400",
    },
  }[verdict.level];

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all ${styles.wrapper} ${styles.bannerAccent} ${className}`}
    >
      {/* Baris Atas: Header, Indikator Realtime, dan Kontrol Simulasi */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.accentDot}`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                verdict.level === "aman"
                  ? "bg-emerald-500"
                  : verdict.level === "waspada"
                  ? "bg-amber-500"
                  : "bg-rose-600"
              }`}
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            Papan Status Keselamatan Maritim Live
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400">
            Teluk Penyu & Nusakambangan (Cilacap)
          </span>
        </div>

        {/* Kontrol Aksi Realtime & Dropdown Simulasi Skenario Cuaca */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Badge Live Realtime Ticker */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-[11px] text-cyan-300 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>
              {telemetryMode === "live"
                ? `Realtime (${countdown}s)`
                : "Mode Simulasi"}
            </span>
          </div>

          {/* Pemilih Skenario Cuaca Interaktif (Demo / Evaluasi) */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-0.5">
            <SlidersHorizontal className="h-3 w-3 text-slate-400" />
            <select
              aria-label="Mode Telemetri Cuaca"
              value={telemetryMode}
              onChange={(e) => handleModeChange(e.target.value as TelemetryMode)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer py-0.5 pr-1"
            >
              <option value="live" className="bg-slate-900 text-white">
                📡 Live Sensor (Open-Meteo & BMKG)
              </option>
              <option value="simulasi_aman" className="bg-slate-900 text-emerald-400">
                🟢 Uji Simulasi: Aman (0.7m, 8.5 kn)
              </option>
              <option value="simulasi_waspada" className="bg-slate-900 text-amber-400">
                ▲ Uji Simulasi: Waspada (1.1m, 13 kn)
              </option>
              <option value="simulasi_tunda" className="bg-slate-900 text-rose-400">
                ✖ Uji Simulasi: Badai Tunda (1.9m, 19.5 kn)
              </option>
              <option value="simulasi_offline" className="bg-slate-900 text-slate-400">
                ⚠️ Uji Simulasi: Sensor Offline
              </option>
            </select>
          </div>

          <Badge
            variant="outline"
            className={`px-3 py-1 text-xs font-black tracking-wide ${styles.badge}`}
          >
            {verdict.title.split(":")[0]}
          </Badge>

          <Button
            size="sm"
            variant="ghost"
            onClick={fetchLiveTelemetry}
            disabled={isLoading || telemetryMode !== "live"}
            className="h-7 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            title="Sinkronisasi telemetri cuaca sekarang"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Konten Utama: Alert Box & Angka Telemetri */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Kolom Kiri: Status & Panduan KSOP (8 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-800/80 shrink-0 mt-0.5">
              {styles.icon}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {verdict.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {verdict.message}
              </p>
            </div>
          </div>

          {/* Kotak Petunjuk Tindakan Operator */}
          <div className="rounded-xl bg-slate-800/90 border border-slate-700/60 p-3 sm:p-3.5 flex items-start gap-2.5">
            <Anchor className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-snug">
              <span className="font-bold text-cyan-300">Instruksi Syahbandar (KSOP): </span>
              <span className="text-slate-200">{verdict.actionGuide}</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Telemetri Metrik Sensor (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {/* Tile Tinggi Gelombang */}
          <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Tinggi Gelombang</span>
              <Waves className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {data.waveM !== null ? `${data.waveM.toFixed(1)} m` : "N/A"}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Batas Aman: ≤ 1.25 m
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] w-fit font-semibold px-2 py-0.5 ${styles.badge}`}
            >
              {data.waveM !== null ? verdict.waveStatus : "Sensor Offline"}
            </Badge>
          </div>

          {/* Tile Kecepatan Angin */}
          <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Kecepatan Angin</span>
              <Wind className="h-4 w-4 text-sky-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {data.windKn !== null ? `${data.windKn.toFixed(1)} knot` : "N/A"}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Batas Aman: ≤ 15.0 knot
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] w-fit font-semibold px-2 py-0.5 ${styles.badge}`}
            >
              {verdict.windStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Baris Bawah: Catatan Metadata & Jam Pembaruan */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-slate-500" />
          <span>
            Diperbarui: {formattedTime} WIB ({data.source || "Open-Meteo"}) •{" "}
            {telemetryMode === "live"
              ? `Auto-refresh Realtime aktif (${countdown}s)`
              : "Mode Simulasi Terpasang"}
          </span>
        </div>
        <div className="text-slate-400">
          Ambang Perahu Rakyat & Speedboat: Gelombang 1,25 m • Angin 15 knot
        </div>
      </div>
    </div>
  );
};

export default OperatorWeatherAdvisory;
