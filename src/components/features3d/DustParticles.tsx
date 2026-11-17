import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points } from "three";

interface DustParticlesProps {
  isMobile?: boolean;
  isReducedMotion?: boolean;
}

/**
 * Partikel debu kecil melayang halus di dalam berkas cahaya panggung.
 * Ringan (36 titik instanced titik sprite tunggal), dinonaktifkan di mobile
 * dan jika prefers-reduced-motion aktif.
 */
export const DustParticles = ({
  isMobile = false,
  isReducedMotion = false,
}: DustParticlesProps) => {
  const pointsRef = useRef<Points>(null);

  // Buat 36 titik acak di dalam kolom berkas cahaya
  const [positions, speeds] = useMemo(() => {
    const count = 36;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Radius silinder sempit mengitari model dan berkas cahaya (radius ~1.2m)
      const r = Math.sqrt(Math.random()) * 1.25;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3 + 0] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.5; // rentang y: -1.25 s.d. 1.25
      pos[i * 3 + 2] = Math.sin(theta) * r;

      // Kecepatan melayang vertikal lambat
      spd[i] = 0.08 + Math.random() * 0.12;
    }
    return [pos, spd];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || isReducedMotion || isMobile) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < speeds.length; i++) {
      let y = array[i * 3 + 1];
      y += speeds[i] * delta;
      if (y > 1.5) {
        y = -1.2;
      }
      array[i * 3 + 1] = y;
    }
    posAttr.needsUpdate = true;
  });

  if (isMobile || isReducedMotion) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#fffbeb"
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </points>
  );
};
