import thresholds from "./thresholds.json";

export type BoatType = "speedboat" | "kapal_kayu";
export type Level = "aman" | "waspada" | "tunda";

export interface HourSample {
  time: string; // ISO dengan offset +07:00
  waveM: number | null;
  windKn: number;
  rainMmH: number;
  thunder: boolean;
}

export interface Verdict {
  level: Level;
  reasons: string[];
}

export interface DayWindow {
  date: string;
  level: Level;
  worstHour: string | null;
  reasons: string[];
}

const LEVEL_PRIORITY: Record<Level, number> = {
  aman: 1,
  waspada: 2,
  tunda: 3,
};

function getJakartaDateAndHour(isoString: string): { date: string; hour: number } {
  const d = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  let y = "";
  let m = "";
  let day = "";
  let h = "";
  for (const p of parts) {
    if (p.type === "year") y = p.value;
    if (p.type === "month") m = p.value;
    if (p.type === "day") day = p.value;
    if (p.type === "hour") h = p.value;
  }
  return {
    date: `${y}-${m}-${day}`,
    hour: parseInt(h, 10) % 24,
  };
}

function calcRatioScore(r: number): number {
  if (r < thresholds.warningRatio) {
    return (r / thresholds.warningRatio) * 33;
  } else if (r <= 1.0) {
    return 34 + ((r - thresholds.warningRatio) / (1.0 - thresholds.warningRatio)) * 32;
  } else {
    return 67 + Math.min((r - 1.0) / 0.5, 1.0) * 33;
  }
}

export function evaluateHour(s: HourSample, boat: BoatType): Verdict {
  const boatConfig = thresholds.boats[boat];
  const maxWaveM = boatConfig.maxWaveM;
  const maxWindKn = boatConfig.maxWindKn;
  const warningRatio = thresholds.warningRatio;
  const waspadaMmH = thresholds.rain.waspadaMmH;
  const tundaMmH = thresholds.rain.tundaMmH;

  const reasons: string[] = [];
  let isTunda = false;
  let isWaspada = false;

  // 1. Kondisi gelombang
  if (s.waveM === null) {
    reasons.push("Data gelombang tidak tersedia");
    isWaspada = true;
  } else if (s.waveM > maxWaveM) {
    reasons.push(`Tinggi gelombang (${s.waveM} m) melebihi batas aman (${maxWaveM} m)`);
    isTunda = true;
  } else if (s.waveM >= maxWaveM * warningRatio) {
    reasons.push(`Tinggi gelombang (${s.waveM} m) mendekati batas aman (≥ ${warningRatio * 100}%)`);
    isWaspada = true;
  }

  // 2. Kondisi angin
  if (s.windKn > maxWindKn) {
    reasons.push(`Kecepatan angin (${s.windKn} knot) melebihi batas aman (${maxWindKn} knot)`);
    isTunda = true;
  } else if (s.windKn >= maxWindKn * warningRatio) {
    reasons.push(`Kecepatan angin (${s.windKn} knot) mendekati batas aman (≥ ${warningRatio * 100}%)`);
    isWaspada = true;
  }

  // 3. Kondisi petir
  if (s.thunder) {
    reasons.push("Terdapat potensi petir atau badai guntur");
    isTunda = true;
  }

  // 4. Kondisi hujan
  if (s.rainMmH >= tundaMmH) {
    reasons.push(`Curah hujan (${s.rainMmH} mm/jam) mencapai batas sangat lebat (≥ ${tundaMmH} mm/jam)`);
    isTunda = true;
  } else if (s.rainMmH >= waspadaMmH) {
    reasons.push(`Curah hujan (${s.rainMmH} mm/jam) mencapai batas waspada (≥ ${waspadaMmH} mm/jam)`);
    isWaspada = true;
  }

  let level: Level = "aman";
  if (isTunda) {
    level = "tunda";
  } else if (isWaspada) {
    level = "waspada";
  }

  return { level, reasons };
}

export function severityIndex(s: HourSample, boat: BoatType): number {
  const boatConfig = thresholds.boats[boat];
  const maxWaveM = boatConfig.maxWaveM;
  const maxWindKn = boatConfig.maxWindKn;
  const waspadaMmH = thresholds.rain.waspadaMmH;
  const tundaMmH = thresholds.rain.tundaMmH;

  // Angin
  const rWind = s.windKn / maxWindKn;
  const scoreWind = calcRatioScore(rWind);

  // Gelombang (null tidak ikut dihitung)
  const scoreWave = s.waveM !== null ? calcRatioScore(s.waveM / maxWaveM) : null;

  // Hujan (waspadaMmH -> 34, tundaMmH -> 67)
  let scoreRain: number;
  if (s.rainMmH < waspadaMmH) {
    scoreRain = (s.rainMmH / waspadaMmH) * 33;
  } else if (s.rainMmH < tundaMmH) {
    scoreRain = 34 + ((s.rainMmH - waspadaMmH) / (tundaMmH - waspadaMmH)) * 32;
  } else {
    scoreRain = 67 + Math.min((s.rainMmH - tundaMmH) / (0.5 * tundaMmH), 1.0) * 33;
  }

  const scores: number[] = [scoreWind, scoreRain];
  if (scoreWave !== null) {
    scores.push(scoreWave);
  }
  if (s.thunder) {
    scores.push(100);
  }

  return Math.min(100, Math.max(0, Math.round(Math.max(...scores))));
}

export function evaluateDay(date: string, hours: HourSample[], boat: BoatType): DayWindow {
  // Filter jam 7 sampai 15 inklusif di zona waktu Asia/Jakarta pada tanggal tersebut
  const windowSamples = hours.filter((h) => {
    const parsed = getJakartaDateAndHour(h.time);
    return parsed.date === date && parsed.hour >= 7 && parsed.hour <= 15;
  });

  if (windowSamples.length === 0) {
    return {
      date,
      level: "waspada",
      worstHour: null,
      reasons: ["Data prakiraan cuaca tidak tersedia untuk jendela keberangkatan (07.00–15.00 WIB)"],
    };
  }

  const evaluated = windowSamples.map((sample) => ({
    sample,
    verdict: evaluateHour(sample, boat),
  }));

  // Cari level terburuk: tunda > waspada > aman
  const hasTunda = evaluated.some((e) => e.verdict.level === "tunda");
  const hasWaspada = evaluated.some((e) => e.verdict.level === "waspada");

  if (hasTunda) {
    const firstTunda = evaluated.find((e) => e.verdict.level === "tunda")!;
    const allReasons = Array.from(
      new Set(evaluated.filter((e) => e.verdict.level === "tunda").flatMap((e) => e.verdict.reasons))
    );
    return {
      date,
      level: "tunda",
      worstHour: firstTunda.sample.time,
      reasons: allReasons,
    };
  }

  if (hasWaspada) {
    const firstWaspada = evaluated.find((e) => e.verdict.level === "waspada")!;
    const allReasons = Array.from(
      new Set(evaluated.filter((e) => e.verdict.level === "waspada").flatMap((e) => e.verdict.reasons))
    );
    return {
      date,
      level: "waspada",
      worstHour: firstWaspada.sample.time,
      reasons: allReasons,
    };
  }

  return {
    date,
    level: "aman",
    worstHour: null,
    reasons: [],
  };
}

export function rankDays(days: DayWindow[]): DayWindow[] {
  return [...days].sort((a, b) => {
    const priorityDiff = LEVEL_PRIORITY[a.level] - LEVEL_PRIORITY[b.level];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return a.date.localeCompare(b.date);
  });
}
