import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WhyChooseSuar from "@/components/WhyChooseSuar";
import HowItWorks from "@/components/HowItWorks";
import IconicDestinations from "@/components/IconicDestinations";
import TourPackagesSection from "@/components/TourPackagesSection";
import ReadyFleetSection from "@/components/ReadyFleetSection";
import AskBeforeSailingSection from "@/components/AskBeforeSailingSection";
import Footer from "@/components/Footer";
import { WeatherMapPanel } from "@/components/weather/WeatherMapPanel";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* 1. Translucent Nav with Updated SUAR Logo */}
      <Navbar />

      {/* 2. Hybrid Multi-Layer Parallax Hero with Weather Widget & Card */}
      <Hero />

      {/* 3. Features Section (Clean Coastal Light Theme with In-View Animations) */}
      <Features />

      {/* 4. Mengapa Wisatawan Memilih Platform SUAR? (Image 2) */}
      <WhyChooseSuar />

      {/* 5. Cara Kerja Platform SUAR (Clean Coastal Light Theme) */}
      <HowItWorks />

      {/* 6. Destinasi Ikonik di Pantai Nusakambangan (Image 3) */}
      <IconicDestinations />

      {/* 7. Pilihan Paket Tour Backend/Live (Image 6) */}
      <TourPackagesSection />

      {/* 8. Armada Siap Berlayar Hari Ini Backend/Live (Image 4) */}
      <ReadyFleetSection />

      {/* 9. Tanya Apa Saja Sebelum Berlayar (Image 5) */}
      <AskBeforeSailingSection />

      {/* 10. Peta Kelaikan Pelayaran */}
      <WeatherMapPanel />


      {/* 11. Footer with SUAR Oceanic Theme */}
      <Footer /> <AssistantWidget />

    </div>
  );
};

export default Index;
