import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Points } from "three";

interface DustParticlesProps {
  isMobile?: boolean;
  isReducedMotion?: boolean;
}

/**
 * Partikel debu kecil melayang halus di dalam berkas cahaya panggung.
 * Ringan (36 titik instanced titik sprite tunggal), dinonaktifkan di mobile
 * dan jika prefers-reduced-motion aktif.
 * Memudar halus (alpha/brightness falloff) mendekati batas vertikal dan radial.
 */
export const DustParticles = ({
  isMobile = false,
  isReducedMotion = false,
}: DustParticlesProps) => {
  const pointsRef = useRef<Points>(null);

  // Buat 36 titik acak di dalam kolom berkas cahaya
  const [positions, speeds, baseColors] = useMemo(() => {
    const count = 36;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const baseCol = new Color("#fffbeb");

    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * 1.35;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3 + 0] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.6; // rentang y: -1.3 s.d. 1.3
      pos[i * 3 + 2] = Math.sin(theta) * r;

      // Kecepatan melayang vertikal lambat
      spd[i] = 0.08 + Math.random() * 0.12;

      col[i * 3 + 0] = baseCol.r;
      col[i * 3 + 1] = baseCol.g;
      col[i * 3 + 2] = baseCol.b;
    }
    return [pos, spd, col];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || isReducedMotion || isMobile) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const colAttr = pointsRef.current.geometry.attributes.color;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    const baseCol = new Color("#fffbeb");

    for (let i = 0; i < speeds.length; i++) {
      let y = posArr[i * 3 + 1];
      y += speeds[i] * delta;
      if (y > 1.4) {
        y = -1.2;
      }
      posArr[i * 3 + 1] = y;

      const x = posArr[i * 3 + 0];
      const z = posArr[i * 3 + 2];
      const r = Math.sqrt(x * x + z * z);

      // Feathering lembut: fade-out di batas atas-bawah dan radial luar
      const normY = Math.max(0, Math.min(1, (y + 1.2) / 2.6));
      const fadeY = Math.sin(normY * Math.PI); // 0 di tepi, 1 di tengah
      const fadeR = Math.max(0, 1 - Math.pow(r / 1.4, 2)); // 1 di pusat, 0 di tepi
      const brightness = 0.45 * fadeY * fadeR;

      colArr[i * 3 + 0] = baseCol.r * brightness;
      colArr[i * 3 + 1] = baseCol.g * brightness;
      colArr[i * 3 + 2] = baseCol.b * brightness;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  if (isMobile || isReducedMotion) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[baseColors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
};
