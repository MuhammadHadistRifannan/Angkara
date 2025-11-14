import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-boat.jpg";

const Hero = () => {
  return (
    <section className="relative pt-24 pb-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Kapal Wisata Cilacap"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Jelajahi Nusakambangan dengan <span className="text-accent">Aman & Mudah</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Platform booking kapal wisata pertama di Cilacap. Transparan, terverifikasi KSOP, dan terpercaya.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Nusakambangan"
                  className="border-0 p-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  className="border-0 p-0 focus-visible:ring-0"
                />
              </div>
              <Button variant="hero" className="h-full">
                <Search className="h-5 w-5 mr-2" />
                Cari Kapal
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Populer:</span>
              <button className="text-primary hover:underline">Paket Sunset</button>
              <span>•</span>
              <button className="text-primary hover:underline">Private Trip</button>
              <span>•</span>
              <button className="text-primary hover:underline">Tour Keliling</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-white">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-white/80 text-sm">Kapal Terdaftar</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-white/80 text-sm">Terverifikasi KSOP</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold">4.8/5</div>
              <div className="text-white/80 text-sm">Rating Rata-rata</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
