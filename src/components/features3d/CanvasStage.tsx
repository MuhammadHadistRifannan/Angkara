import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group, type SpotLight } from "three";
import { FeatureModel } from "./FeatureModel";
import { StageLightPool } from "./StageLightPool";
import { DustParticles } from "./DustParticles";
import type { Feature3DItem } from "./types";
import { updateDebugOverlay } from "../landing/debugStore";

interface CanvasStageProps {
  activeFeature: Feature3DItem;
  step: number; // 0 (Intro) s.d. 6 (Exit)
  isVisible?: boolean;
  isEntered?: boolean;
  pulseTrigger?: number | string;
  isMobile?: boolean;
  isReducedMotion?: boolean;
  scrollProgress?: number;
  slotIntroRef?: React.RefObject<HTMLDivElement | null>;
  slotFeatureRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Kontroler Kamera Sinematik (Dolly Scroll & Pointer Parallax)
 */
const CinematicCameraController = ({
  scrollProgress = 0.5,
  isMobile = false,
  isReducedMotion = false,
}: {
  scrollProgress?: number;
  isMobile?: boolean;
  isReducedMotion?: boolean;
}) => {
  const currentRotY = useRef(0);
  const currentRotX = useRef(0);
  const currentZ = useRef(4.0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // 1. Dolly scroll: z +/- 0.35 mengikuti scroll progress
    const targetZ = 4.0 + (scrollProgress - 0.5) * 0.7;
    currentZ.current += (targetZ - currentZ.current) * Math.min(1, dt * 3.5);
    state.camera.position.z = currentZ.current;

    // 2. Parallax pointer: miring maksimal 3 derajat mengikuti pointer mouse
    if (!isMobile && !isReducedMotion) {
      const targetRotY = -state.pointer.x * ((3 * Math.PI) / 180);
      const targetRotX = state.pointer.y * ((2 * Math.PI) / 180);

      currentRotY.current += (targetRotY - currentRotY.current) * Math.min(1, dt * 4);
      currentRotX.current += (targetRotX - currentRotX.current) * Math.min(1, dt * 4);

      state.camera.rotation.y = currentRotY.current;
      state.camera.rotation.x = currentRotX.current;
    } else {
      state.camera.rotation.set(0, 0, 0);
    }
  });

  return null;
};

/**
 * Panggung Bergerak Sinematik (Moving Stage)
 * Posisi dan skala dihitung secara presisi dari slot DOM (getBoundingClientRect -> NDC -> Kamera Dunia z=0).
 * Menjamin model SELALU sejajar sempurna dengan blok teks kanan dan tidak pernah terpotong di layar pendek.
 */
interface MovingStageProps {
  activeFeature: Feature3DItem;
  step: number;
  isMobile: boolean;
  isReducedMotion: boolean;
  pulseTrigger?: number | string;
  isEntered?: boolean;
  slotIntroRef?: React.RefObject<HTMLDivElement | null>;
  slotFeatureRef?: React.RefObject<HTMLDivElement | null>;
}

const MovingStage = ({
  activeFeature,
  step,
  isMobile,
  isReducedMotion,
  pulseTrigger,
  isEntered = true,
  slotIntroRef,
  slotFeatureRef,
}: MovingStageProps) => {
  const { viewport, camera } = useThree();
  const stageGroupRef = useRef<Group>(null);
  const spotRef = useRef<SpotLight>(null);
  const spotTargetRef = useRef<Group>(null);

  // Fisika pegas transisi Intro <-> Fitur Kiri (stiffness 170, damping 14)
  const motionRef = useRef({
    currentX: 0,
    velX: 0,
    currentY: -0.35,
    velY: 0,
    currentScale: 0.85,
    velScale: 0,
  });

  // Spotlight pulse & fade-in state
  const entranceProgressRef = useRef(isEntered ? 1 : 0);
  const pulseTimerRef = useRef(1);
  const lastPulseKeyRef = useRef(pulseTrigger);

  useEffect(() => {
    if (lastPulseKeyRef.current !== pulseTrigger) {
      lastPulseKeyRef.current = pulseTrigger;
      pulseTimerRef.current = 0;
    }
  }, [pulseTrigger]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const m = motionRef.current;
    const isIntro = step === 0;

    // 1. Dapatkan posisi slot DOM aktual
    const activeSlot = isIntro ? slotIntroRef?.current : slotFeatureRef?.current;

    // Nilai dasar default jika slot belum terukur
    let targetX = isMobile ? 0 : isIntro ? 0 : -viewport.width * 0.22;
    let targetY = isMobile ? (isIntro ? -0.28 : 0.38) : (isIntro ? -0.38 : 0);
    let targetScale = isMobile ? (isIntro ? 0.75 : 0.88) : (isIntro ? 0.85 : 1.0);

    if (activeSlot && typeof window !== "undefined") {
      const rect = activeSlot.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Hitung titik pusat slot dalam piksel viewport
        const pxCenterX = rect.left + rect.width / 2;
        const pxCenterY = rect.top + rect.height / 2;

        // Konversi ke Normalized Device Coordinates (NDC) [-1, 1]
        const ndcX = (pxCenterX / window.innerWidth) * 2 - 1;
        const ndcY = -((pxCenterY / window.innerHeight) * 2 - 1);

        // Proyeksi ke bidang 3D z=0 melalui kamera Three.js
        const vec = new Vector3(ndcX, ndcY, 0.5);
        vec.unproject(camera);
        const dir = vec.sub(camera.position).normalize();
        if (dir.z !== 0) {
          const dist = -camera.position.z / dir.z;
          const worldPos = camera.position.clone().add(dir.multiplyScalar(dist));
          targetX = worldPos.x;
          targetY = worldPos.y;
        }

        // Batasi ukuran model agar maksimal 82% dari tinggi slot DOM (Perbaikan F2: tidak terpotong)
        const worldSlotHeight = (rect.height / window.innerHeight) * viewport.height;
        const baseHeight = activeFeature.targetHeight || 1.45;
        const maxScaleFromSlot = (worldSlotHeight * 0.82) / baseHeight;
        targetScale = Math.min(isIntro ? 0.85 : 1.05, maxScaleFromSlot);
      }
    }

    // Laporkan ke Debug Overlay
    updateDebugOverlay("features", {
      targetPos: { x: targetX, y: targetY, scale: targetScale },
    });

    if (isReducedMotion) {
      m.currentX = targetX;
      m.currentY = targetY;
      m.currentScale = targetScale;
    } else {
      // Spring retargeting yang halus tanpa reset (Perbaikan F1, F2)
      const stiffness = 180;
      const damping = 16;

      const forceX = -stiffness * (m.currentX - targetX) - damping * m.velX;
      m.velX += forceX * dt;
      m.currentX += m.velX * dt;

      const forceY = -stiffness * (m.currentY - targetY) - damping * m.velY;
      m.velY += forceY * dt;
      m.currentY += m.velY * dt;

      const forceScale = -stiffness * (m.currentScale - targetScale) - damping * m.velScale;
      m.velScale += forceScale * dt;
      m.currentScale += m.velScale * dt;
    }

    // Terapkan ke grup panggung utama
    if (stageGroupRef.current) {
      stageGroupRef.current.position.set(m.currentX, m.currentY, 0);
      stageGroupRef.current.scale.setScalar(Math.max(0.01, m.currentScale));
    }

    // 2. Tata Cahaya Mengikuti Model
    if (spotRef.current) {
      spotRef.current.position.set(m.currentX, 5.0, 1.6);
      if (spotTargetRef.current) {
        spotTargetRef.current.position.set(m.currentX, m.currentY, 0);
        spotRef.current.target = spotTargetRef.current;
      }

      if (isEntered && entranceProgressRef.current < 1) {
        entranceProgressRef.current = Math.min(1, entranceProgressRef.current + dt / 0.9);
      }

      let boost = 0;
      if (pulseTimerRef.current < 1) {
        pulseTimerRef.current = Math.min(1, pulseTimerRef.current + dt * 2.5);
        boost = Math.sin(pulseTimerRef.current * Math.PI) * 0.15;
      }

      const baseIntensity = 2.4 * entranceProgressRef.current;
      spotRef.current.intensity = baseIntensity * (1 + boost);
    }
  });

  return (
    <>
      <group ref={spotTargetRef} />

      {/* 1. Spotlight Utama Menyorot Model */}
      <spotLight
        ref={spotRef}
        position={[0, 5.0, 1.6]}
        angle={0.42}
        penumbra={0.8}
        color="#fffbeb"
        distance={12}
        castShadow={false}
      />

      {/* 2. Cahaya Isi (Fill Light) Hangat Redup */}
      <directionalLight position={[-3, 2.0, 2.5]} intensity={0.5} color="#fed7aa" />

      {/* 3. Rim Light Cool-Cyan Tipis dari Belakang */}
      <pointLight position={[0, 2.0, -2.8]} intensity={0.9} color="#38bdf8" distance={8} />

      {/* 4. Cahaya Ambien Rendah */}
      <ambientLight intensity={0.4} />

      {/* Grup Panggung Bergerak */}
      <group ref={stageGroupRef}>
        <StageLightPool />
        <DustParticles isMobile={isMobile} isReducedMotion={isReducedMotion} />
        <FeatureModel
          key={activeFeature.id}
          activeId={activeFeature.id}
          modelUrl={activeFeature.modelUrl}
          targetHeight={activeFeature.targetHeight}
          initialRotation={activeFeature.initialRotation}
          isReducedMotion={isReducedMotion}
        />
      </group>
    </>
  );
};

export const CanvasStage = ({
  activeFeature,
  step,
  isVisible = true,
  isEntered = true,
  pulseTrigger,
  isMobile = false,
  isReducedMotion = false,
  scrollProgress = 0.5,
  slotIntroRef,
  slotFeatureRef,
}: CanvasStageProps) => {
  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%), radial-gradient(ellipse 95% 85% at 50% 50%, black 65%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%), radial-gradient(ellipse 95% 85% at 50% 50%, black 65%, transparent 100%)",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <CinematicCameraController
          scrollProgress={scrollProgress}
          isMobile={isMobile}
          isReducedMotion={isReducedMotion}
        />
        <MovingStage
          activeFeature={activeFeature}
          step={step}
          isMobile={isMobile}
          isReducedMotion={isReducedMotion}
          pulseTrigger={pulseTrigger}
          isEntered={isEntered}
          slotIntroRef={slotIntroRef}
          slotFeatureRef={slotFeatureRef}
        />
      </Canvas>
    </div>
  );
};
