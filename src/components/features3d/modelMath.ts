export interface FitResult {
  scale: number;
  offset: [number, number, number];
}

/**
 * Menghitung skala seragam dan offset posisi agar model 3D
 * berada tepat di tengah (X, Z) dan dasar model menapak di permukaan (Y = 0).
 */
export function calculateModelFit(
  min: [number, number, number],
  max: [number, number, number],
  targetHeight = 1.6
): FitResult {
  const sizeX = max[0] - min[0];
  const sizeY = max[1] - min[1];
  const sizeZ = max[2] - min[2];

  const maxDimension = Math.max(sizeX, sizeY, sizeZ);
  const scale = maxDimension > 0 ? targetHeight / maxDimension : 1;

  // Pusatkan di X dan Z, dan letakkan titik terbawah model tepat di y = 0
  const offsetX = -((min[0] + max[0]) / 2) * scale;
  const offsetY = -min[1] * scale;
  const offsetZ = -((min[2] + max[2]) / 2) * scale;

  const normalizeZero = (v: number) => (Object.is(v, -0) || v === 0 ? 0 : v);

  return {
    scale,
    offset: [
      normalizeZero(offsetX),
      normalizeZero(offsetY),
      normalizeZero(offsetZ),
    ],
  };
}

/**
 * Menghitung indeks fitur aktif berdasarkan progres scroll (0.0 sampai 1.0)
 */
export function calculateActiveFeatureIndex(
  progress: number,
  totalFeatures: number
): number {
  if (totalFeatures <= 1) return 0;
  const clamped = Math.max(0, Math.min(1, progress));
  const rawIndex = Math.floor(clamped * totalFeatures);
  return Math.min(totalFeatures - 1, Math.max(0, rawIndex));
}
