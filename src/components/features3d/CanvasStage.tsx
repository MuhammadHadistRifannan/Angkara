import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group, SpotLight } from "three";
import { FeatureModel } from "./FeatureModel";
import { StageLightPool } from "./StageLightPool";
import { DustParticles } from "./DustParticles";
import type { Feature3DItem } from "./types";

interface CanvasStageProps {
  activeFeature: Feature3DItem;
  step: number; // 0 (Intro) s.d. 5 (Fitur 5)
  isVisible?: boolean;
  isEntered?: boolean;
  pulseTrigger?: number | string;
  isMobile?: boolean;
  isReducedMotion?: boolean;
  scrollProgress?: number;
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
 * Mengontrol pergerakan posisi dan skala model dari Intro (tengah-bawah) ke Kiri (step 1-5).
 * Menggunakan spring physics (stiffness 170, damping 12) dengan overshoot yang membal.
 * Spotlight, kolam cahaya, dan partikel ikut bergerak menyatu bersama model.
 */
interface MovingStageProps {
  activeFeature: Feature3DItem;
  step: number;
  isMobile: boolean;
  isReducedMotion: boolean;
  pulseTrigger?: number | string;
  isEntered?: boolean;
}

const MovingStage = ({
  activeFeature,
  step,
  isMobile,
  isReducedMotion,
  pulseTrigger,
  isEntered = true,
}: MovingStageProps) => {
  const { viewport } = useThree();
  const stageGroupRef = useRef<Group>(null);
  const spotRef = useRef<SpotLight>(null);
  const spotTargetRef = useRef<Group>(null);

  // Fisika pegas transisi Intro <-> Fitur Kiri (stiffness 170, damping 12)
  const motionRef = useRef({
    currentX: 0,
    velX: 0,
    currentY: isMobile ? -0.28 : -0.38,
    velY: 0,
    currentScale: isMobile ? 0.75 : 0.85,
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

    // 1. Target Posisi Responsif (dihitung dari useThree viewport)
    // Desktop: Intro = tengah (x=0, y=-0.38, s=0.85); Fitur 1-5 = kiri 28% lebar layar (x=-0.22*width, y=0, s=1.0)
    // Mobile: Intro = tengah-bawah (x=0, y=-0.28, s=0.75); Fitur 1-5 = tengah-atas (x=0, y=0.38, s=0.88)
    const isIntro = step === 0;
    const targetX = isMobile ? 0 : isIntro ? 0 : -viewport.width * 0.22;
    const targetY = isMobile
      ? isIntro
        ? -0.28
        : 0.38
      : isIntro
      ? -0.38
      : 0;
    const targetScale = isMobile
      ? isIntro
        ? 0.75
        : 0.88
      : isIntro
      ? 0.85
      : 1.0;

    if (isReducedMotion) {
      m.currentX = targetX;
      m.currentY = targetY;
      m.currentScale = targetScale;
    } else {
      // Spring X: stiffness 170, damping 12 (overshoot terlihat)
      const forceX = -170 * (m.currentX - targetX) - 12 * m.velX;
      m.velX += forceX * dt;
      m.currentX += m.velX * dt;

      // Spring Y: stiffness 170, damping 12
      const forceY = -170 * (m.currentY - targetY) - 12 * m.velY;
      m.velY += forceY * dt;
      m.currentY += m.velY * dt;

      // Spring Skala: stiffness 170, damping 12
      const forceScale = -170 * (m.currentScale - targetScale) - 12 * m.velScale;
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

      // Intensitas fade-in 900ms saat masuk viewport
      if (isEntered && entranceProgressRef.current < 1) {
        entranceProgressRef.current = Math.min(1, entranceProgressRef.current + dt / 0.9);
      }

      let boost = 0;
      if (pulseTimerRef.current < 1) {
        pulseTimerRef.current = Math.min(1, pulseTimerRef.current + dt * 2.5);
        boost = Math.sin(pulseTimerRef.current * Math.PI) * 0.15; // Denyut tipis +15%
      }

      const baseIntensity = 2.4 * entranceProgressRef.current;
      spotRef.current.intensity = baseIntensity * (1 + boost);
    }
  });

  return (
    <>
      {/* Target spotlight 3D */}
      <group ref={spotTargetRef} />

      {/* 1. Spotlight Utama Hangat Menyorot Model (Mengikuti posisi stageGroup) */}
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

      {/* 
        Grup Panggung Bergerak:
        Memuat model, kolam cahaya bawah, dan partikel debu halus sehingga
        seluruh elemen panggung bergerak harmonis sebagai satu kesatuan.
      */}
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
}: CanvasStageProps) => {
  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center select-none pointer-events-none"
      aria-hidden="true"
      style={{
        // Mask-image vertikal & radial agar partikel dan efek memudar halus tanpa garis/tepi kotak
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%), radial-gradient(ellipse 92% 86% at 50% 50%, black 65%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%), radial-gradient(ellipse 92% 86% at 50% 50%, black 65%, transparent 100%)",
        maskComposite: "intersect",
        WebkitMaskComposite: "destination-in",
      }}
    >
      <Canvas
        camera={{ position: [0, 0.15, 4.0], fov: 38 }}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        frameloop={isVisible ? "always" : "never"}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full pointer-events-auto"
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
        />
      </Canvas>
    </div>
  );
};
