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

      {/* 10. Dedicated Maritime Weather Map Section with Smooth Reveal */}
      <section className="py-20 sm:py-24 bg-[#F8FAFC] border-t border-slate-200/60 overflow-hidden" id="weather-map-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                Pemantauan Kondisi Cuaca Perairan Cilacap
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                Data terintegrasi BMKG Stasiun Meteorologi Tunggul Wulung & satelit Open-Meteo untuk keselamatan penyeberangan Anda.
              </p>
            </div>
            <WeatherMapPanel />
          </motion.div>
        </div>
      </section>

      {/* 11. Footer with SUAR Oceanic Theme */}
      <Footer />

      {/* 12. Floating AI Assistant Widget */}
      <AssistantWidget />
    </div>
  );
};

export default Index;
