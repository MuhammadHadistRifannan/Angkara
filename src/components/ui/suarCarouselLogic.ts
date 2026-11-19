export type CoverflowPosition =
  | "center"
  | "left"
  | "right"
  | "far-left"
  | "far-right";

export interface CoverflowState {
  position: CoverflowPosition;
  tilt: number;
  scale: number;
  zIndex: number;
  opacity: number;
}

/**
 * Menghitung status tampilan mengipas (coverflow) untuk SuarCarousel.
 * - Bila jumlah item <= 2: ditengahkan tanpa kipas (tilt 0, scale 1).
 * - Bila jumlah item > 2:
 *   - tengah: scale 1, rotasi 0, zIndex 3, opacity 1
 *   - kiri: scale 0.92, rotasi -6 deg, zIndex 2, opacity 0.85
 *   - kanan: scale 0.92, rotasi +6 deg, zIndex 2, opacity 0.85
 *   - jauh kiri: scale 0.85, rotasi -10 deg, zIndex 1, opacity 0.7
 *   - jauh kanan: scale 0.85, rotasi +10 deg, zIndex 1, opacity 0.7
 */
export function calculateCoverflowState(
  index: number,
  activeIndex: number,
  totalItems: number
): CoverflowState {
  if (totalItems <= 2) {
    return {
      position: "center",
      tilt: 0,
      scale: 1,
      zIndex: 2,
      opacity: 1,
    };
  }

  const diff = index - activeIndex;

  if (diff === 0) {
    return {
      position: "center",
      tilt: 0,
      scale: 1,
      zIndex: 3,
      opacity: 1,
    };
  }

  if (diff === -1) {
    return {
      position: "left",
      tilt: -6,
      scale: 0.92,
      zIndex: 2,
      opacity: 0.85,
    };
  }

  if (diff === 1) {
    return {
      position: "right",
      tilt: 6,
      scale: 0.92,
      zIndex: 2,
      opacity: 0.85,
    };
  }

  if (diff < -1) {
    return {
      position: "far-left",
      tilt: -10,
      scale: 0.85,
      zIndex: 1,
      opacity: 0.7,
    };
  }

  return {
    position: "far-right",
    tilt: 10,
    scale: 0.85,
    zIndex: 1,
    opacity: 0.7,
  };
}
