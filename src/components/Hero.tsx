import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Compass,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Anchor,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-boat.jpg";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [departurePoint, setDeparturePoint] = useState("Teluk Penyu");
  const [departureDate, setDepartureDate] = useState("");
  const [passengers, setPassengers] = useState(2);
  const heroRef = useRef<HTMLElement>(null);

  // Parallax Scroll Listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax Mouse Hover Effect (Desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 20, y: y * 20 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleAskJuruMudi = () => {
    window.dispatchEvent(
      new CustomEvent("open-assistant", {
        detail: {
          prompt: `Halo Juru Mudi! Bagaimana rekomendasi jadwal dan kondisi cuaca maritim untuk perjalanan ke Nusakambangan dari ${departurePoint}?`,
        },
      })
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const boatSection = document.getElementById("boats");
    if (boatSection) {
      boatSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] pt-28 pb-24 flex items-center overflow-hidden bg-slate-950 text-white"
    >
      {/* =========================================================================
          PARALLAX BACKGROUND LAYER (Multi-depth)
          ========================================================================= */}
      <div
        data-testid="parallax-bg"
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          transform: `translate3d(0, ${scrollY * 0.35}px, 0)`,
          willChange: "transform",
        }}
      >
        <img
          src={heroImage}
          alt="Kapal Wisata Bahari Nusakambangan Cilacap"
          className="w-full h-[125%] -top-[12%] absolute object-cover object-center scale-105 filter brightness-[0.78] contrast-[1.1] transition-transform duration-700 ease-out"
        />

        {/* Dynamic Maritime Gradients & Ambient Lights */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

        {/* Ambient Parallax Luminous Orbs */}
        <div
          className="absolute -top-24 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -1}px, ${scrollY * -0.15 + mousePos.y * -1}px, 0)`,
          }}
        />
        <div
          className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-3xl pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * 1.5}px, ${scrollY * 0.2 + mousePos.y * 1.5}px, 0)`,
          }}
        />
      </div>

      {/* =========================================================================
          HERO CONTENT CONTAINER
          ========================================================================= */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT COLUMN: Main Typography & Search */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Safety Badge Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-xs sm:text-sm font-medium text-white/95">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Terverifikasi KSOP · Terkoneksi BMKG & Open-Meteo</span>
              <Sparkles className="h-3.5 w-3.5 text-accent ml-0.5" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Jelajahi Nusakambangan & Bahari Cilacap dengan{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-accent bg-clip-text text-transparent">
                Aman, Cerdas & Transparan
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-200/90 max-w-2xl leading-relaxed">
              Platform reservasi kapal wisata resmi pertama di Cilacap dengan integrasi mesin keselamatan maritim, rekomendasi AI Juru Mudi, dan verifikasi kelaikan kapal langsung dari KSOP.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#boats"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-sm shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] transition-all duration-300"
              >
                <Anchor className="h-4 w-4" />
                <span>Pilih Armada Kapal</span>
              </a>

              <a
                href="#weather-map-section"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02]"
              >
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Lihat Peta Cuaca Maritim</span>
              </a>

              <button
                type="button"
                onClick={handleAskJuruMudi}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-cyan-200 font-medium text-sm transition-all duration-300"
              >
                <MessageSquare className="h-4 w-4 text-accent" />
                <span>Tanya Juru Mudi</span>
              </button>
            </div>

            {/* Modern Search Glass Card */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-6 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/30 shadow-2xl text-slate-800 dark:text-slate-100 transition-all duration-300"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Titik Berangkat */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Dermaga / Rute</span>
                  </label>
                  <select
                    value={departurePoint}
                    onChange={(e) => setDeparturePoint(e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground font-medium"
                  >
                    <option value="Teluk Penyu">Teluk Penyu</option>
                    <option value="Pelabuhan Tanjung Intan">Pelabuhan Tanjung Intan</option>
                    <option value="Pulau Nusakambangan">Pulau Nusakambangan</option>
                    <option value="Wisata Mangrove Segara Anakan">Mangrove Segara Anakan</option>
                  </select>
                </div>

                {/* 2. Tanggal Berangkat */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Tanggal Berlayar</span>
                  </label>
                  <Input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="h-11 text-sm bg-muted/40 border-border rounded-lg text-foreground font-medium"
                  />
                </div>

                {/* 3. Tombol Cari Kapal */}
                <div className="space-y-1 flex flex-col justify-end">
                  <Button
                    type="submit"
                    variant="hero"
                    className="h-11 w-full flex items-center justify-center gap-2 rounded-lg font-semibold text-sm shadow-md"
                  >
                    <Search className="h-4 w-4" />
                    <span>Cari Kapal</span>
                  </Button>
                </div>
              </div>

              {/* Quick Tags / Populer */}
              <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/80">Rute Populer:</span>
                <button
                  type="button"
                  onClick={() => setDeparturePoint("Teluk Penyu")}
                  className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  🌊 Teluk Penyu
                </button>
                <button
                  type="button"
                  onClick={() => setDeparturePoint("Pelabuhan Tanjung Intan")}
                  className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  🚢 Tanjung Intan
                </button>
                <button
                  type="button"
                  onClick={() => setDeparturePoint("Pulau Nusakambangan")}
                  className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  🏝️ Nusakambangan
                </button>
                <a
                  href="#weather-map-section"
                  className="ml-auto text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <span>Peta Cuaca Maritim</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Interactive Weather Preview & Safety Showcase */}
          <div
            className="lg:col-span-5"
            style={{
              transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`,
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-6">
              {/* Highlight Pill & Radar Pulse */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    <Compass className="h-5 w-5 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>Peta Cuaca Maritim Cilacap</span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Sistem keselamatan pelayaran terpadu
                    </p>
                  </div>
                </div>

                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5">
                  Aktif 24/7
                </Badge>
              </div>

              {/* Status Points Snapshot */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-cyan-400/40 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Titik Pantau 1</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="font-semibold text-sm text-white">Teluk Penyu</div>
                  <div className="text-[11px] text-cyan-300">Gelombang & Angin Stabil</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-cyan-400/40 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Titik Pantau 2</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="font-semibold text-sm text-white">Tanjung Intan</div>
                  <div className="text-[11px] text-cyan-300">Prakiraan BMKG Valid</div>
                </div>
              </div>

              {/* Juru Mudi Maritime Intelligence Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/30 to-accent/20 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Jendela Pelayaran Teraman (07.00 - 15.00 WIB)</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Asisten AI Juru Mudi mengevaluasi kondisi laut secara deterministik untuk menjamin keselamatan keberangkatan Anda.
                </p>
              </div>

              {/* Direct Buttons to Weather Map & Assistant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href="#weather-map-section"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-100 font-semibold text-xs transition-colors"
                >
                  <Compass className="h-4 w-4 text-cyan-300" />
                  <span>Buka Peta Cuaca</span>
                </a>

                <Button
                  type="button"
                  onClick={handleAskJuruMudi}
                  variant="hero"
                  className="w-full h-auto py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Konsultasi AI</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM TRUST METRICS / STATS
            ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="text-3xl font-extrabold text-white">50+</div>
            <div className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">
              Kapal Terdaftar (Speedboat & Kayu)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="text-3xl font-extrabold text-cyan-300">100%</div>
            <div className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">
              Terverifikasi KSOP & Syahbandar
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="text-3xl font-extrabold text-amber-300">4.9/5</div>
            <div className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">
              Rating Rata-rata Wisatawan
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="text-3xl font-extrabold text-emerald-400">24/7</div>
            <div className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">
              Monitoring Cuaca BMKG & Gelombang
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
