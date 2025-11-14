import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import BoatListings from "@/components/BoatListings";
import Footer from "@/components/Footer";
import FareCalculator from "@/components/FareCalculator";
import WeatherWidget from "@/components/WeatherWidget";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <BoatListings />
      
      {/* Additional Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <FareCalculator />
            <WeatherWidget />
          </div>
        </div>
      </section>
      
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
