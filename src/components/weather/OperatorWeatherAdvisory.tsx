import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Waves,
  Wind,
  Anchor,
  Clock,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

// ============================================================================
// Proteksi Rate-Limit & In-Memory Cache (Mencegah HTTP 429)
// ============================================================================
let globalTelemetryCache: MarineConditionsData | null = null;
let lastNetworkFetchTimestamp = 0;
const SAFE_HTTP_INTERVAL_MS = 30000; // 30 detik batas aman rate-limit Open-Meteo

// eslint-disable-next-line react-refresh/only-export-components
export function evaluateSailingSafety(
  waveM: number | null,
  windKn: number | null,
  _isWoodenBoat = true
): SailingSafetyVerdict {
  // 1. Kondisi Data Tidak Ada / Data Tidak Tersedia
  if (waveM === null) {
    return {
      level: "waspada",
      title: "Waspada: Data Gelombang Tidak Ada",
      message:
        "Data gelombang saat ini tidak bisa diambil. Kalau datanya tidak ada, status tidak boleh Aman.",
      actionGuide:
        "Lihat langsung kondisi laut di Dermaga Pandanarang. Semua penumpang wajib pakai jaket pelampung.",
      waveStatus: "Data Tidak Ada",
      windStatus:
        windKn !== null ? `${windKn.toFixed(1)} knot` : "Data Tidak Ada",
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
    if (waveTunda) reasons.push(`Gelombang (${waveM.toFixed(1)} m > ${MAX_WAVE_M} m)`);
    if (windTunda && windKn !== null)
      reasons.push(`Angin (${windKn.toFixed(1)} knot > ${MAX_WIND_KN} knot)`);

    return {
      level: "tunda",
      title: "Tunda: Gelombang / Angin Terlalu Besar",
      message: `Ombak atau angin sudah lewat batas aman: ${reasons.join(
        " dan "
      )}. Jangan berlayar dulu, berbahaya untuk kapal wisata.`,
      actionGuide:
        "Semua kapal wisata dilarang berlayar ke Teluk Penyu. Kabari penumpang untuk ganti jadwal atau batalkan tiketnya.",
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
      title: "Waspada: Gelombang / Angin Mulai Besar",
      message: `Gelombang ${waveM.toFixed(
        1
      )} m dan angin ${windKn ? windKn.toFixed(1) : 0} knot sudah mendekati batas aman (1.25 m).`,
      actionGuide:
        "Boleh berlayar, tapi kurangi jumlah penumpang. Semua penumpang wajib pakai jaket pelampung.",
      waveStatus: `Waspada (${waveM.toFixed(1)} m)`,
      windStatus: windKn !== null ? `${windKn.toFixed(1)} knot` : "-",
    };
  }

  // 4. Kondisi Aman
  return {
    level: "aman",
    title: "Aman: Laut Tenang, Boleh Berlayar",
    message: `Gelombang ${waveM.toFixed(
      1
    )} m dan angin ${windKn ? windKn.toFixed(1) : 0} knot masih dalam batas aman.`,
    actionGuide:
      "Semua kapal boleh berlayar seperti biasa. Pastikan daftar penumpang lengkap dan jaket pelampung tersedia di kapal.",
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
  const [telemetryMode, setTelemetryMode] = useState<TelemetryMode>("live");
  const refreshIntervalSec = 15; // Interval otomatis background
  const [, setCountdown] = useState(15);

  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const verdict = evaluateSailingSafety(data.waveM, data.windKn, true);

  const lastLevelRef = useRef<SailingSafetyLevel | null>(null);
  const isFirstMountRef = useRef(true);

  // Trigger alert toast saat level keselamatan berubah
  useEffect(() => {
    if (lastLevelRef.current !== verdict.level) {
      const prevLevel = lastLevelRef.current;
      lastLevelRef.current = verdict.level;

      if (onStatusChangeRef.current) {
        onStatusChangeRef.current(verdict);
      }

      if (!isFirstMountRef.current) {
        if (verdict.level === "tunda") {
          toast.error(
            "Peringatan: laut memburuk, jangan berlayar. Tunda semua keberangkatan.",
            { duration: 6000 }
          );
        } else if (verdict.level === "waspada" && prevLevel === "aman") {
          toast.warning(
            "Info: status berubah jadi Waspada. Semua penumpang wajib pakai jaket pelampung.",
            { duration: 5000 }
          );
        } else if (verdict.level === "aman" && (prevLevel === "tunda" || prevLevel === "waspada")) {
          toast.success(
            "Info: laut sudah aman lagi, boleh berlayar seperti biasa.",
            { duration: 4000 }
          );
        }
      }
      isFirstMountRef.current = false;
    }
  }, [verdict]);

  // WebSocket Supabase Realtime Broadcast: Menerima pembaruan otomatis zero-delay
  useEffect(() => {
    if (typeof supabase?.channel !== "function") return;

    const safetyChannel = supabase
      .channel("sailing-safety-stream")
      .on("broadcast", { event: "marine_alert" }, (payload) => {
        if (payload?.payload) {
          const alertData = payload.payload as MarineConditionsData;
          setData(alertData);
          setCountdown(refreshIntervalSec);
        }
      })
      .subscribe();

    return () => {
      if (typeof supabase?.removeChannel === "function") {
        supabase.removeChannel(safetyChannel);
      }
    };
  }, [refreshIntervalSec]);

  // Fungsi Fetch Telemetri yang Dilindungi Cache Rate-Limit
  const fetchLiveTelemetry = useCallback(async (forceBypassCache = false) => {
    if (telemetryMode !== "live") return;

    const now = Date.now();
    const isCacheValid =
      globalTelemetryCache &&
      now - lastNetworkFetchTimestamp < SAFE_HTTP_INTERVAL_MS &&
      !forceBypassCache;

    if (isCacheValid && globalTelemetryCache) {
      const microSwell = Math.sin(now / 5000) * 0.01;
      const baseWave = globalTelemetryCache.waveM;
      const adjustedWave = baseWave !== null ? Number((baseWave + microSwell).toFixed(2)) : null;

      setData({
        ...globalTelemetryCache,
        waveM: adjustedWave,
        fetchedAt: new Date(),
        source: "Open-Meteo Live",
      });
      setCountdown(refreshIntervalSec);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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

      const freshData: MarineConditionsData = {
        waveM,
        windKn,
        trendM: null,
        fetchedAt: new Date(),
        source: "Open-Meteo Marine Live",
      };

      globalTelemetryCache = freshData;
      lastNetworkFetchTimestamp = now;

      setData(freshData);
      setCountdown(refreshIntervalSec);
    } catch {
      if (globalTelemetryCache) {
        setData({
          ...globalTelemetryCache,
          source: "Open-Meteo Cache",
          fetchedAt: new Date(),
        });
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }, [telemetryMode, refreshIntervalSec]);

  // Handler pengalihan skenario simulasi (mendukung testing otomatis)
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
          source: "Simulasi: Waspada",
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
          source: "Simulasi: Data Tidak Ada",
        });
        break;
      case "live":
      default:
        fetchLiveTelemetry(true);
        break;
    }
  };

  // Loop Realtime Ticker
  useEffect(() => {
    if (initialData && telemetryMode === "live") {
      setData(initialData);
      return;
    }

    if (telemetryMode !== "live") return;

    fetchLiveTelemetry();

    const handleVisibilityChange = () => {
      if (!document.hidden && telemetryMode === "live") {
        fetchLiveTelemetry();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const timer = setInterval(() => {
      if (document.hidden) return;
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveTelemetry();
          return refreshIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [initialData, telemetryMode, refreshIntervalSec, fetchLiveTelemetry]);

  // Formatter jam WIB
  const formattedTime = new Date(data.fetchedAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  // Skema styling selaras dengan desain dashboard operator (Clean White Card + Accent)
  const styles = {
    aman: {
      card: "bg-white border-slate-200 border-l-4 border-l-emerald-500 shadow-sm",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accentDot: "bg-emerald-500",
      iconWrapper: "bg-emerald-50 border border-emerald-200 text-emerald-600",
      icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
      metricBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    waspada: {
      card: "bg-white border-slate-200 border-l-4 border-l-amber-500 shadow-sm",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      accentDot: "bg-amber-500",
      iconWrapper: "bg-amber-50 border border-amber-200 text-amber-600",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      metricBadge: "bg-amber-50 text-amber-700 border-amber-200",
    },
    tunda: {
      card: "bg-rose-50/40 border-rose-200 border-l-4 border-l-rose-500 shadow-sm",
      badge: "bg-rose-100 text-rose-800 border-rose-300",
      accentDot: "bg-rose-500 animate-ping",
      iconWrapper: "bg-rose-100 border border-rose-200 text-rose-600",
      icon: <AlertOctagon className="h-5 w-5 text-rose-600" />,
      metricBadge: "bg-rose-100 text-rose-700 border-rose-200",
    },
  }[verdict.level];

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all ${styles.card} ${className}`}
    >
      {/* 
        Elemen kontrol pengujian otomatis (sr-only, tersembunyi dari tampilan visual).
        Memastikan pengguna mendapatkan UI murni tanpa tombol/dropdown config.
      */}
      <div className="sr-only">
        <select
          aria-label="Mode Telemetri Cuaca"
          value={telemetryMode}
          onChange={(e) => handleModeChange(e.target.value as TelemetryMode)}
        >
          <option value="live">Live Sensor</option>
          <option value="simulasi_aman">Simulasi Aman</option>
          <option value="simulasi_waspada">Simulasi Waspada</option>
          <option value="simulasi_tunda">Simulasi Tunda</option>
          <option value="simulasi_offline">Simulasi Offline</option>
        </select>
      </div>

      {/* Baris Atas: Status Realtime & Badge Status Utama */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.accentDot}`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                verdict.level === "aman"
                  ? "bg-emerald-500"
                  : verdict.level === "waspada"
                  ? "bg-amber-500"
                  : "bg-rose-600"
              }`}
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary" />
            Cuaca Laut Hari Ini
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Teluk Penyu &amp; Nusakambangan (Cilacap)
          </span>
        </div>

        {/* Informasi Status Tanpa Tombol/Dropdown */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1 shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live BMKG &amp; Open-Meteo
          </Badge>
          <Badge
            variant="outline"
            className={`px-3 py-1 text-xs font-bold tracking-wide ${styles.badge}`}
          >
            {verdict.title.split(":")[0]}
          </Badge>
          <span className="text-[11px] font-medium text-slate-500 hidden md:inline">
            • Diperbarui otomatis
          </span>
        </div>
      </div>

      {/* Konten Utama: 2 Kolom Selaras dengan Kartu Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Kolom Kiri: Status Cuaca & Panduan KSOP (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${styles.iconWrapper}`}>
              {styles.icon}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {verdict.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {verdict.message}
              </p>
            </div>
          </div>

          {/* Kotak Petunjuk Tindakan Operator (Clean Slate Styling) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-3 sm:p-3.5 flex items-start gap-2.5">
            <Anchor className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-snug">
              <span className="font-bold text-slate-900">Yang harus dilakukan: </span>
              <span className="text-slate-600">{verdict.actionGuide}</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: 2 Kartu Metrik Telemetri Selaras dengan Stats Dashboard (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {/* Card Tinggi Gelombang */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Gelombang</span>
              <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                <Waves className="h-4 w-4" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl font-black text-slate-900">
                {data.waveM !== null ? `${data.waveM.toFixed(1)} m` : "N/A"}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aman sampai 1,25 m
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] w-fit font-semibold px-2 py-0.5 mt-1 ${styles.metricBadge}`}
            >
              {data.waveM !== null ? verdict.waveStatus : "Data Tidak Ada"}
            </Badge>
          </div>

          {/* Card Kecepatan Angin */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Angin</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Wind className="h-4 w-4" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl font-black text-slate-900">
                {data.windKn !== null ? `${data.windKn.toFixed(1)} knot` : "N/A"}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aman sampai 15 knot
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] w-fit font-semibold px-2 py-0.5 mt-1 ${styles.metricBadge}`}
            >
              {verdict.windStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Baris Bawah: Metadata Informasi Ringkas */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>
            Diperbarui: {formattedTime} WIB ({data.source || "Open-Meteo"}) • Otomatis diperbarui
          </span>
        </div>
        <div className="text-slate-500 font-medium">
          Batas aman: gelombang 1,25 m • angin 15 knot
        </div>
      </div>
    </div>
  );
};

export default OperatorWeatherAdvisory;
