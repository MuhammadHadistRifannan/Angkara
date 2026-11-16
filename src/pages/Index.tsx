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

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* 1. Translucent Nav with Updated Logo */}
      <Navbar />

      {/* 2. Hybrid Multi-Layer Parallax Hero with Weather Widget & Card */}
      <Hero />

      {/* 3. Features Section without Fare Calculator */}
      <Features />

      {/* 4. Mengapa Wisatawan Memilih Platform SUAR? (Image 2) */}
      <WhyChooseSuar />

      {/* 5. How It Works */}
      <HowItWorks />

      {/* 6. Destinasi Ikonik di Pantai Nusakambangan (Image 3) */}
      <IconicDestinations />

      {/* 7. Pilihan Paket Tour Backend/Live (Image 6) */}
      <TourPackagesSection />

      {/* 8. Armada Siap Berlayar Hari Ini Backend/Live (Image 4) */}
      <ReadyFleetSection />

      {/* 9. Tanya Apa Saja Sebelum Berlayar (Image 5) */}
      <AskBeforeSailingSection />

      {/* 10. Dedicated Maritime Weather Map Section (Retained) */}
      <section className="py-20 sm:py-24 bg-background" id="weather-map-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <WeatherMapPanel />
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <Footer />

      {/* 12. Floating AI Assistant Widget */}
      <AssistantWidget />
    </div>
  );
};

export default Index;
