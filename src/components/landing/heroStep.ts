export interface HeroTitleItem {
  line1: string;
  line2: string;
}

export const HERO_TITLES: readonly HeroTitleItem[] = [
  { line1: "Berlayar lebih tenang.", line2: "Cuaca sudah dihitung." },
  { line1: "Kapal terverifikasi.", line2: "Jadwal dan kuota pasti." },
  { line1: "Tanya Juru Mudi.", line2: "Berangkat dengan yakin." },
] as const;

export const HERO_STEP_COUNT = 4;

export const DESKTOP_INITIAL_SCALE = 1.90;
export const MOBILE_INITIAL_SCALE = 1.50;
export const MIN_SCALE = 1.00;

export function calculateHeroStep(sentinelIndex: number): number {
  if (Number.isNaN(sentinelIndex)) return 0;
  return Math.min(HERO_STEP_COUNT - 1, Math.max(0, Math.floor(sentinelIndex)));
}

export function getTitleIndexForStep(step: number): number | null {
  const clamped = calculateHeroStep(step);
  if (clamped === 0) return null;
  return clamped - 1;
}

/**
 * Mengembalikan skala zoom-out sinematik:
 * - Step 0 (buka pertama kali / paling atas): DEEP ZOOM IN (1.90 desktop / 1.50 mobile)
 * - Step 1-3: Kamera mundur bertahap memperlihatkan cakrawala samudera hingga 1.00
 */
export function getVideoScaleForStep(step: number, isMobile = false): number {
  const clamped = calculateHeroStep(step);
  const initial = isMobile ? MOBILE_INITIAL_SCALE : DESKTOP_INITIAL_SCALE;
  const stepDiff = (initial - MIN_SCALE) / 3;

  return Math.round((initial - clamped * stepDiff) * 100) / 100;
}

/**
 * Menghitung skala zoom-out kontinu langsung dari progres scroll pengguna (0.0 s.d. 1.0)
 * Mengembalikan 1.90 -> 1.00 (desktop) atau 1.50 -> 1.00 (mobile)
 */
export function calculateZoomOutScale(
  progress: number,
  isMobile = false,
  isReducedMotion = false
): number {
  if (isReducedMotion) return 1.0;
  const initial = isMobile ? MOBILE_INITIAL_SCALE : DESKTOP_INITIAL_SCALE;
  const clamped = Math.min(1, Math.max(0, progress));
  const raw = initial - clamped * (initial - MIN_SCALE);
  return Math.round(raw * 100) / 100;
}

export function getOverlayOpacityForStep(step: number): number {
  const clamped = calculateHeroStep(step);
  switch (clamped) {
    case 0:
      return 0.15;
    case 1:
      return 0.25;
    case 2:
      return 0.32;
    case 3:
      return 0.4;
    default:
      return 0.15;
  }
}
