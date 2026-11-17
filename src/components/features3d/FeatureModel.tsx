import { Suspense, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";
import { FitModel } from "./FitModel";
import { MODEL_CONFIG } from "./modelConfig";

interface FeatureModelProps {
  modelUrl: string;
  targetHeight?: number;
  initialRotation?: [number, number, number];
  activeId: string;
  isReducedMotion?: boolean;
}

const ModelSkeleton = () => {
  const meshRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <mesh>
        <octahedronGeometry args={[0.45, 0]} />
        <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.6} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.65, 0.7, 32]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

export const FeatureModel = ({
  modelUrl,
  targetHeight,
  initialRotation,
  activeId,
  isReducedMotion = false,
}: FeatureModelProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [debugRotOffset, setDebugRotOffset] = useState<[number, number, number]>([0, 0, 0]);
  const animGroupRef = useRef<Group>(null);

  // Status fisika pegas (spring) untuk pergantian model & hover
  const physicsRef = useRef({
    scale: 0.05,
    scaleVel: 0,
    introRotY: (-35 * Math.PI) / 180, // rotasi masuk awal -35 derajat
    introRotYVel: 0,
    activeId,
    isHovered: false,
  });

  physicsRef.current.isHovered = isHovered;

  // Reset saat model berganti
  useEffect(() => {
    if (physicsRef.current.activeId !== activeId) {
      physicsRef.current.activeId = activeId;
      physicsRef.current.scale = 0.05;
      physicsRef.current.scaleVel = 0;
      physicsRef.current.introRotY = (-35 * Math.PI) / 180;
      physicsRef.current.introRotYVel = 0;
      setDebugRotOffset([0, 0, 0]);
    }
  }, [activeId]);

  // Dukungan tombol debug khusus development: [ dan ] untuk memutar per 90 derajat
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleDebugKey = (e: KeyboardEvent) => {
      // Abaikan jika fokus pada input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        const step = e.key === "]" ? 90 : -90;
        setDebugRotOffset((prev) => {
          const axisIndex = e.shiftKey ? 0 : e.altKey ? 2 : 1; // Shift=X, Alt=Z, default=Y
          const next: [number, number, number] = [...prev];
          next[axisIndex] = (next[axisIndex] + step) % 360;

          const baseRot = MODEL_CONFIG[activeId]?.rotation ?? [0, 0, 0];
          const totalRot = [
            baseRot[0] + next[0],
            baseRot[1] + next[1],
            baseRot[2] + next[2],
          ];

          console.log(
            `%c[MODEL_CONFIG Override]%c ${activeId}: rotation: [${totalRot.join(", ")}]`,
            "color: #10b981; font-weight: bold;",
            "color: #f1f5f9;"
          );
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleDebugKey);
    return () => window.removeEventListener("keydown", handleDebugKey);
  }, [activeId]);

  useFrame((state, delta) => {
    if (!animGroupRef.current) return;
    const p = physicsRef.current;
    const dt = Math.min(delta, 0.05);

    if (isReducedMotion) {
      animGroupRef.current.scale.setScalar(p.isHovered ? 1.08 : 1.0);
      animGroupRef.current.rotation.set(0, 0, 0);
      return;
    }

    // 1. Pegas Skala:
    // Hover: target 1.18 (stiffness 260, damping 10)
    // Idle/Muncul: target 1.0 (stiffness 220, damping 12)
    const targetScale = p.isHovered ? 1.18 : 1.0;
    const stiffness = p.isHovered ? 260 : 220;
    const damping = p.isHovered ? 10 : 12;

    const forceScale = -stiffness * (p.scale - targetScale) - damping * p.scaleVel;
    p.scaleVel += forceScale * dt;
    p.scale += p.scaleVel * dt;

    // 2. Pegas Rotasi Masuk (-35 derajat ke 0 derajat hadap depan):
    const rotForce = -220 * p.introRotY - 14 * p.introRotYVel;
    p.introRotYVel += rotForce * dt;
    p.introRotY += p.introRotYVel * dt;

    // 3. Ayunan Halus Bolak-Balik (Pendulum Swing) ±20° Y & ±3° Z:
    // Berhenti saat di-hover sehingga model menghadap persis ke depan
    const time = state.clock.getElapsedTime();
    const swingY = p.isHovered ? 0 : Math.sin(time * 1.2) * (20 * Math.PI) / 180;
    const tiltZ = p.isHovered ? 0 : Math.cos(time * 1.2) * (3 * Math.PI) / 180;

    // Terapkan ke grup animasi
    animGroupRef.current.scale.setScalar(Math.max(0.001, p.scale));
    animGroupRef.current.rotation.y = swingY + p.introRotY;
    animGroupRef.current.rotation.z = tiltZ;
  });

  return (
    <group
      ref={animGroupRef}
      onPointerOver={() => {
        setIsHovered(true);
        if (typeof document !== "undefined") {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setIsHovered(false);
        if (typeof document !== "undefined") {
          document.body.style.cursor = "auto";
        }
      }}
      onClick={() => {
        // Efek ketuk sentuh: picu bounce sebentar
        setIsHovered(true);
        setTimeout(() => setIsHovered(false), 500);
      }}
    >
      <Float
        speed={1.5}
        rotationIntensity={0}
        floatIntensity={isReducedMotion ? 0 : 0.15}
        floatingRange={[-0.03, 0.03]}
      >
        <Suspense fallback={<ModelSkeleton />}>
          <FitModel
            key={activeId}
            activeId={activeId}
            url={modelUrl}
            targetHeight={targetHeight}
            rotationDeg={initialRotation}
            debugRotationOffset={debugRotOffset}
          />
        </Suspense>
      </Float>
    </group>
  );
};
