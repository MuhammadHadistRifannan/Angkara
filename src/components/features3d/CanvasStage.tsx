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
}

const StageLighting = ({
  pulseTrigger,
}: {
  pulseTrigger?: number | string;
}) => {
  const spotRef = useRef<SpotLight>(null);
  const pulseTimerRef = useRef(1); // 1 = selesai

  // Pulse spotlight +15% saat pergantian model
  const lastKeyRef = useRef(pulseTrigger);
  useEffect(() => {
    if (lastKeyRef.current !== pulseTrigger) {
      lastKeyRef.current = pulseTrigger;
      pulseTimerRef.current = 0;
    }
  }, [pulseTrigger]);

  useFrame((_, delta) => {
    if (!spotRef.current) return;

    let boost = 0;
    if (pulseTimerRef.current < 1) {
      pulseTimerRef.current = Math.min(1, pulseTimerRef.current + delta * 2.5);
      boost = Math.sin(pulseTimerRef.current * Math.PI) * 0.15; // +15% pulse
    }

    spotRef.current.intensity = 2.4 * (1 + boost);
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
  pulseTrigger,
  isMobile = false,
  isReducedMotion = false,
}: CanvasStageProps) => {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Berkas Cahaya Sorot Lembut (Beam) CSS dari Atas ke Model */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(255,251,235,0.08),transparent_75%)]" />

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
        {/* Tata Lampu Sorot Panggung Sesuai Revisi 2 */}
        <StageLighting pulseTrigger={pulseTrigger} />

        {/* Kolam Cahaya Lembut di Bawah Model (Tanpa Wooden Plate) */}
        <StageLightPool />

        {/* Partikel Debu Kecil Melayang di Berkas Cahaya */}
        <DustParticles isMobile={isMobile} isReducedMotion={isReducedMotion} />

        {/* Model Fitur 3D Aktif (Ayunan Pendulum, Bounding Box Pivot Tengah, Float) */}
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
