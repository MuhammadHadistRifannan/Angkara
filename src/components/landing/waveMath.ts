export interface WavePathOptions {
  width: number;
  height: number;
  amplitude: number;
  periods: number; // Jumlah periode bulat dalam SETENGAH lebar (width / 2)
  phase?: number;
  baseHeight?: number;
  flip?: boolean;
}

export interface WaveSegment {
  x: number;
  y: number;
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
}

/**
 * Membangun kurva gelombang sinus periodik yang mulus tanpa putus (seamless loop).
 * Menghasilkan kurva Bezier dengan periode bulat dalam setengah lebar (width / 2),
 * sehingga paruh kiri (0 -> W/2) dan paruh kanan (W/2 -> W) identik persis.
 */
export function generateWaveSegments(options: WavePathOptions): {
  segments: WaveSegment[];
  startY: number;
  endY: number;
} {
  const {
    width,
    amplitude,
    periods = 2,
    phase = 0,
    baseHeight = 60,
  } = options;

  const validPeriods = Math.max(1, Math.round(periods));
  const totalQuarterPeriods = validPeriods * 8; // 4 kuartal per periode x 2 paruh = 8 * validPeriods
  const deltaX = width / totalQuarterPeriods;
  const kBezier = 0.364; // Konstanta aproksimasi Bezier untuk kuartal sinus
  const kSlope = kBezier * (Math.PI / 2);

  const startT = phase;
  const startY = Number((baseHeight + amplitude * Math.sin(startT)).toFixed(3));

  const segments: WaveSegment[] = [];

  for (let k = 0; k < totalQuarterPeriods; k++) {
    const tCurrent = (k * Math.PI) / 2 + phase;
    const tNext = ((k + 1) * Math.PI) / 2 + phase;

    const xCurrent = k * deltaX;
    const xNext = (k + 1) * deltaX;

    const yCurrent = baseHeight + amplitude * Math.sin(tCurrent);
    const yNext = baseHeight + amplitude * Math.sin(tNext);

    const cp1x = Number((xCurrent + deltaX * kBezier).toFixed(3));
    const cp1y = Number((yCurrent + amplitude * Math.cos(tCurrent) * kSlope).toFixed(3));

    const cp2x = Number((xNext - deltaX * kBezier).toFixed(3));
    const cp2y = Number((yNext - amplitude * Math.cos(tNext) * kSlope).toFixed(3));

    segments.push({
      x: Number(xNext.toFixed(3)),
      y: Number(yNext.toFixed(3)),
      cp1x,
      cp1y,
      cp2x,
      cp2y,
    });
  }

  const endY = segments[segments.length - 1].y;

  return {
    segments,
    startY,
    endY,
  };
}

export function buildWavePath(options: WavePathOptions): string {
  const { width, height, flip = false } = options;
  const { segments, startY } = generateWaveSegments(options);

  let path = `M 0 ${startY}`;

  for (const seg of segments) {
    path += ` C ${seg.cp1x} ${seg.cp1y}, ${seg.cp2x} ${seg.cp2y}, ${seg.x} ${seg.y}`;
  }

  if (flip) {
    // Menutup ke atas (y = 0)
    path += ` L ${width} 0 L 0 0 Z`;
  } else {
    // Menutup ke bawah (y = height)
    path += ` L ${width} ${height} L 0 ${height} Z`;
  }

  return path;
}
