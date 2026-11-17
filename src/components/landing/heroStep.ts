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

export function calculateHeroStep(sentinelIndex: number): number {
  if (Number.isNaN(sentinelIndex)) return 0;
  return Math.min(HERO_STEP_COUNT - 1, Math.max(0, Math.floor(sentinelIndex)));
}

export function getTitleIndexForStep(step: number): number | null {
  const clamped = calculateHeroStep(step);
  if (clamped === 0) return null;
  return clamped - 1;
}

export function getVideoScaleForStep(step: number): number {
  const clamped = calculateHeroStep(step);
  switch (clamped) {
    case 0:
      return 1.0;
    case 1:
      return 1.03;
    case 2:
      return 1.06;
    case 3:
      return 1.09;
    default:
      return 1.0;
  }
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
