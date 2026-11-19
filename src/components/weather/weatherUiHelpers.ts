/**
 * Helper pemetaan status cuaca maritim ke UI ramah pengguna
 * Sesuai aturan keselamatan deterministik SUAR
 */

export type WeatherSafetyStatus = "aman" | "waspada" | "tunda";

/**
 * Petakan status keselamatan ke ekspresi Maskot Si Suar
 * AMAN: happy
 * WASPADA: thinking
 * TUNDA: worried (tenang dan waspada, bukan lucu berlebihan)
 */
export function getMascotMoodForStatus(
  status: WeatherSafetyStatus
): "happy" | "thinking" | "worried" {
  if (status === "aman") return "happy";
  if (status === "waspada") return "thinking";
  return "worried";
}

/**
 * Format kalimat besar ramah dalam bahasa sehari-hari
 * Contoh: "Gelombang hari ini 0,80 m. Aman untuk berlayar."
 */
export function formatWaveSummarySentence(
  waveM: number | null,
  status: WeatherSafetyStatus
): string {
  if (waveM === null) {
    return "Data cuaca tidak tersedia saat ini. Tetap waspada sebelum berlayar.";
  }
  const formattedWave = waveM.toFixed(2).replace(".", ",");
  if (status === "aman") {
    return `Gelombang hari ini ${formattedWave} m. Aman untuk berlayar.`;
  }
  if (status === "waspada") {
    return `Gelombang hari ini ${formattedWave} m. Waspada saat berlayar.`;
  }
  return `Gelombang hari ini ${formattedWave} m. Disarankan tunda pelayaran.`;
}

/**
 * Tentukan tingkat status kapal berdasarkan tinggi gelombang
 * Ambang konservatif perahu nelayan (rules.ts & thresholds.json):
 * - Kapal Kayu: <= 1.0m aman, <= 1.5m waspada, > 1.5m tunda
 * - Speedboat: <= 1.5m aman, <= 2.0m waspada, > 2.0m tunda
 * - Data null: wajib 'waspada', tidak pernah 'aman'
 */
export function calculateBoatLevel(
  waveM: number | null,
  isWooden: boolean
): WeatherSafetyStatus {
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

/**
 * Kategori ombak BMKG
 */
export function getWaveCategory(waveM: number | null): string {
  if (waveM === null) return "TIDAK DIKETAHUI";
  if (waveM < 0.5) return "TENANG";
  if (waveM <= 1.25) return "SEDANG";
  if (waveM <= 2.0) return "TINGGI";
  return "SANGAT TINGGI";
}
