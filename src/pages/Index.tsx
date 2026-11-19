import React, { lazy, Suspense } from "react";
import Hero from "@/components/Hero";
import { Features2DFallback } from "@/components/features3d/Features2DFallback";
import WhyChooseSuar from "@/components/WhyChooseSuar";
import HowItWorks from "@/components/HowItWorks";
import IconicDestinations from "@/components/IconicDestinations";
import TourPackagesSection from "@/components/TourPackagesSection";
import ReadyFleetSection from "@/components/ReadyFleetSection";
import AskBeforeSailingSection from "@/components/AskBeforeSailingSection";
import Footer from "@/components/Footer";
import { WeatherMapPanel } from "@/components/weather/WeatherMapPanel";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { DebugOverlay } from "@/components/landing/DebugOverlay";

// Lazy-load panggung 3D agar Three.js bundle tidak membebani First Contentful Paint (FCP)
const FeaturesStage = lazy(() => import("@/components/features3d/FeaturesStage"));

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* 1. Cinematic Scrollcraft Hero Section */}
      <Hero />

      {/* 2. Panggung Fitur 3D Interaktif & Card Slider */}
      <Suspense fallback={<Features2DFallback />}>
        <FeaturesStage />
      </Suspense>

      {/* 3. Mengapa Wisatawan Memilih Platform SUAR? */}
      <WhyChooseSuar />

      {/* 4. Cara Kerja Platform SUAR */}
      <HowItWorks />

      {/* 5. Destinasi Ikonik di Pantai Nusakambangan */}
      <IconicDestinations />

      {/* 6. Pilihan Paket Tour */}
      <TourPackagesSection />

      {/* 7. Armada Siap Berlayar Hari Ini */}
      <ReadyFleetSection />

      {/* 8. Tanya Apa Saja Sebelum Berlayar */}
      <AskBeforeSailingSection />

      {/* 9. Peta Kelaikan Pelayaran BMKG */}
      <WeatherMapPanel />

      {/* 10. Footer Oceanic Theme */}
      <Footer />

      {/* 11. Asisten Pintar Juru Mudi & Telemetry Dev Overlay */}
      <AssistantWidget />
      <DebugOverlay />
    </div>
  );
};

export default Index;
