import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { SpotLight } from "three";
import { FeatureModel } from "./FeatureModel";
import { StageLightPool } from "./StageLightPool";
import { DustParticles } from "./DustParticles";
import type { Feature3DItem } from "./types";

interface CanvasStageProps {
  activeFeature: Feature3DItem;
  isVisible?: boolean;
  isEntered?: boolean;
  pulseTrigger?: number | string;
  isMobile?: boolean;
  isReducedMotion?: boolean;
  scrollProgress?: number;
}

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

    // 1. Dolly scroll: z +/- 0.35 mengikuti progres scroll di section
    const targetZ = 4.0 + (scrollProgress - 0.5) * 0.7;
    currentZ.current += (targetZ - currentZ.current) * Math.min(1, dt * 3.5);
    state.camera.position.z = currentZ.current;

    // 2. Parallax pointer: miring maksimal 3 derajat (0.052 rad) mengikuti pointer mouse
    if (!isMobile && !isReducedMotion) {
      const targetRotY = -state.pointer.x * (3 * Math.PI / 180);
      const targetRotX = state.pointer.y * (2 * Math.PI / 180);

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

const StageLighting = ({
  pulseTrigger,
  isEntered = true,
}: {
  pulseTrigger?: number | string;
  isEntered?: boolean;
}) => {
  const spotRef = useRef<SpotLight>(null);
  const entranceProgressRef = useRef(isEntered ? 1 : 0);
  const pulseTimerRef = useRef(1); // 1 = selesai
  const lastKeyRef = useRef(pulseTrigger);

  useEffect(() => {
    if (lastKeyRef.current !== pulseTrigger) {
      lastKeyRef.current = pulseTrigger;
      pulseTimerRef.current = 0;
    }
  }, [pulseTrigger]);

  useFrame((_, delta) => {
    if (!spotRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Fade-in intensitas spotlight 900ms saat masuk viewport
    if (isEntered && entranceProgressRef.current < 1) {
      entranceProgressRef.current = Math.min(1, entranceProgressRef.current + dt / 0.9);
    }

    let boost = 0;
    if (pulseTimerRef.current < 1) {
      pulseTimerRef.current = Math.min(1, pulseTimerRef.current + dt * 2.5);
      boost = Math.sin(pulseTimerRef.current * Math.PI) * 0.15; // +15% pulse
    }

    const baseIntensity = 2.4 * entranceProgressRef.current;
    spotRef.current.intensity = baseIntensity * (1 + boost);
  });

  return (
    <>
      {/* 1. Spotlight Utama Hangat Menyorot dari Atas-Tengah (Sudut sempit, penumbra lembut) */}
      <spotLight
        ref={spotRef}
        position={[0, 5.0, 1.6]}
        angle={0.42}
        penumbra={0.8}
        color="#fffbeb"
        distance={12}
        castShadow={false}
      />

      {/* 2. Cahaya Isi (Fill Light) Hangat Redup dari Depan-Samping */}
      <directionalLight position={[-3, 2.0, 2.5]} intensity={0.5} color="#fed7aa" />

      {/* 3. Rim Light Cool-Cyan Tipis dari Belakang untuk Menegaskan Siluet di Latar Gelap */}
      <pointLight position={[0, 2.0, -2.8]} intensity={0.9} color="#38bdf8" distance={8} />

      {/* 4. Cahaya Ambien Rendah agar Bagian Bayangan Tetap Terbaca */}
      <ambientLight intensity={0.4} />
    </>
  );
};

export const CanvasStage = ({
  activeFeature,
  isVisible = true,
  isEntered = true,
  pulseTrigger,
  isMobile = false,
  isReducedMotion = false,
  scrollProgress = 0.5,
}: CanvasStageProps) => {
  return (
    <div
      className="relative w-full h-[400px] sm:h-[480px] md:h-[540px] lg:h-[560px] flex items-center justify-center select-none"
      aria-hidden="true"
      style={{
        // Mask-image vertikal & radial agar partikel dan efek memudar halus tanpa garis/tepi kotak
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%), radial-gradient(ellipse 92% 86% at 50% 50%, black 65%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%), radial-gradient(ellipse 92% 86% at 50% 50%, black 65%, transparent 100%)",
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
        className="touch-none"
      >
        {/* Kontroler Kamera Sinematik (Dolly Scroll & Pointer Parallax) */}
        <CinematicCameraController
          scrollProgress={scrollProgress}
          isMobile={isMobile}
          isReducedMotion={isReducedMotion}
        />

        {/* Tata Lampu Sorot Panggung Sesuai Revisi 3 */}
        <StageLighting pulseTrigger={pulseTrigger} isEntered={isEntered} />

        {/* Kolam Cahaya Lembut di Bawah Model (Tanpa Wooden Plate) */}
        <StageLightPool />

        {/* Partikel Debu Kecil Melayang di Berkas Cahaya dengan Alpha Falloff */}
        <DustParticles isMobile={isMobile} isReducedMotion={isReducedMotion} />

        {/* Model Fitur 3D Aktif */}
        <FeatureModel
          key={activeFeature.id}
          activeId={activeFeature.id}
          modelUrl={activeFeature.modelUrl}
          targetHeight={activeFeature.targetHeight}
          initialRotation={activeFeature.initialRotation}
          isReducedMotion={isReducedMotion}
        />
      </Canvas>
    </div>
  );
};
