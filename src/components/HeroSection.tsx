import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Compass,
  MessageSquare,
  ArrowRight,
  Anchor,
  Sparkles,
  Waves,
  Wind,
  Navigation2,
} from "lucide-react";
import heroBgSea from "@/assets/hero-bg-sea.png";
import heroBoatCard from "@/assets/hero-boat-card.png";

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [departurePoint, setDeparturePoint] = useState("Teluk Penyu");
  const [departureDate, setDepartureDate] = useState("");
  const [passengers, setPassengers] = useState(2);

  // Parallax Scroll Animation Controller via Framer Motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Layer 1: z-0 Parallax Background Laut (lambat: y 0% -> 35%, scale 1 -> 1.1)
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Layer 2: z-10 Teks Judul & CTA Kiri (turun lebih cepat: y 0% -> 65%, perlahan tenggelam di balik ombak depan)
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "65%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.7, 0.2]);

  // Layer 3: z-20 Ombak Depan (horizontal drift halus x: 0% -> -3% dan 0% -> 3%)
  const waveX1 = useTransform(scrollYProgress, [0, 1], ["0%", "-3%"]);
  const waveX2 = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);

  // Layer 4: z-30 Kartu Kanan (naik perlahan: y 0% -> -15%)
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

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
      ref={containerRef}
      className="relative min-h-[95vh] w-full overflow-hidden bg-[#090D16] text-white flex flex-col justify-between pt-24"
    >
      {/* =========================================================================
          LAYER 1: z-0 (Background Laut Parallax - Menggunakan Gambar 2)
          y: ['0%', '35%'], scale: [1, 1.1]
          ========================================================================= */}
      <motion.div
        data-testid="parallax-bg"
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          y: bgY,
          scale: bgScale,
          willChange: "transform",
        }}
      >
        <img
          src={heroBgSea}
          alt="Pemandangan Laut dan Karang Pesisir Cilacap"
          className="w-full h-[130%] -top-[15%] absolute object-cover object-center filter brightness-[0.72] contrast-[1.1]"
        />

        {/* Dynamic Maritime Gradients & Lighting Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090D16]/95 via-[#090D16]/70 to-[#090D16]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent" />

        {/* Ambient Oceanic Glow Orbs */}
        <div className="absolute -top-20 left-1/4 w-[32rem] h-[32rem] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-32 right-1/4 w-[36rem] h-[36rem] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      </motion.div>

      {/* =========================================================================
          HERO MAIN CONTENT AREA (Grid 2 Kolom)
          ========================================================================= */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative pt-6 pb-24 md:pb-32">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* =====================================================================
              LAYER 2: z-10 (Teks Judul & CTA Kiri - Tenggelam di Balik Ombak)
              y: ['0%', '65%']
              ===================================================================== */}
          <motion.div
            className="lg:col-span-7 space-y-6 relative z-10"
            style={{
              y: textY,
              opacity: textOpacity,
              willChange: "transform, opacity",
            }}
          >

            {/* Judul Besar Sesuai Permintaan */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Jelajahi Pesisir Cilacap,{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-accent bg-clip-text text-transparent">
                Berlayar dengan Lebih Aman
              </span>
            </h1>

            {/* Subjudul */}
            <p className="text-base sm:text-lg text-slate-200/90 max-w-2xl leading-relaxed">
              Platform wisata bahari pesisir Cilacap & Nusakambangan dengan sistem keselamatan maritim real-time, panduan AI Juru Mudi, dan perahu terverifikasi KSOP.
            </p>

            {/* Tombol CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#boats"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-sm shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.03] transition-all duration-300"
              >
                <Anchor className="h-4 w-4" />
                <span>Pilih Armada Kapal</span>
              </a>

              <a
                href="#weather-map-section"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02]"
              >
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Lihat Peta Cuaca Maritim</span>
              </a>

              <button
                type="button"
                onClick={handleAskJuruMudi}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-cyan-200 font-medium text-sm transition-all duration-300"
              >
                <MessageSquare className="h-4 w-4 text-accent" />
                <span>Tanya Juru Mudi</span>
              </button>
            </div>
          </motion.div>

          {/* =====================================================================
              LAYER 4: z-30 (Kartu Kanan - Menggunakan Gambar 3 Sesuai Desain Gambar 1)
              y: ['0%', '-15%']
              ===================================================================== */}
          <motion.div
            className="lg:col-span-5 relative z-30 flex justify-center lg:justify-end"
            style={{
              y: cardY,
              willChange: "transform",
            }}
          >
            {/* Kartu Wisata Perahu persis seperti Desain Gambar 1 */}
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] rounded-[28px] overflow-hidden shadow-2xl border border-white/20 bg-slate-900 group">
              {/* Gambar 3: Foto Perahu Biru Ambulance / Wisata Cilacap */}
              <img
                src={heroBoatCard}
                alt="Kapal Wisata Bahari Cilacap - Kearifan Bahari Lokal"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient halus di background kartu */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

              {/* Badge Kanan Atas: NO. LAMBUNG: TPY-048 */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10">
                <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold tracking-wider text-[#1e3a5f] uppercase border border-white/50">
                  NO. LAMBUNG: TPY-048
                </div>
              </div>

              {/* Box Bawah: Kearifan Bahari Lokal */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 z-10">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0B132B]/95 backdrop-blur-md border border-white/15 shadow-xl">
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1.5 tracking-tight">
                    Kearifan Bahari Lokal
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-200/95 leading-relaxed font-normal">
                    &ldquo;Setiap nahkoda kami terdaftar resmi di Kantor Kesyahbandaran Cilacap dan dibekali asuransi perlindungan penumpang.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =========================================================================
          LAYER 3: z-20 (Layer Ombak Depan / Foreground SVG)
          Warna gelap #090D16 dan #0F172A
          x: ['0%', '-3%'] & ['0%', '3%']
          Menutupi teks saat teks bergerak turun
          ========================================================================= */}
      <div className="relative z-20 w-full pointer-events-none mt-auto">
        {/* Ombak Layer 1: Belakang (#0F172A) */}
        <motion.div
          className="w-[125%] -ml-[12%] -mb-16 sm:-mb-24"
          style={{ x: waveX2, willChange: "transform" }}
        >
          <svg
            viewBox="0 0 1440 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-28 sm:h-36 md:h-48 object-cover"
            preserveAspectRatio="none"
          >
            <path
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,260L1392,260C1344,260,1248,260,1152,260C1056,260,960,260,864,260C768,260,672,260,576,260C480,260,384,260,288,260C192,260,96,260,48,260L0,260Z"
              fill="#0F172A"
              fillOpacity="0.88"
            />
          </svg>
        </motion.div>

        {/* Ombak Layer 2: Depan (#090D16 Solid) */}
        <motion.div
          className="w-[125%] -ml-[8%] relative z-20"
          style={{ x: waveX1, willChange: "transform" }}
        >
          <svg
            viewBox="0 0 1440 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-24 sm:h-32 md:h-44 object-cover"
            preserveAspectRatio="none"
          >
            <path
              d="M0,144L48,133.3C96,123,192,101,288,112C384,123,480,165,576,176C672,187,768,165,864,144C960,123,1056,101,1152,112C1248,123,1344,165,1392,186.7L1440,208L1440,260L1392,260C1344,260,1248,260,1152,260C1056,260,960,260,864,260C768,260,672,260,576,260C480,260,384,260,288,260C192,260,96,260,48,260L0,260Z"
              fill="#090D16"
            />
          </svg>
        </motion.div>
      </div>

      {/* =========================================================================
          LAYER 4 (Bawah): z-30 Widget Cuaca Maritim AI & Bar Pencarian Rute
          Menumpuk di atas ombak dan menempel di perbatasan section berikutnya
          ========================================================================= */}
      <div className="relative z-30 w-full bg-[#090D16] px-4 sm:px-6 lg:px-8 pb-10 pt-2">
        <div className="container mx-auto">
          {/* Card Gabungan: Widget Cuaca Maritim AI + Bar Pencarian Rute */}
          <div className="rounded-3xl p-5 sm:p-6 bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-5">
            {/* 1. Baris Widget Cuaca Maritim AI */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Compass className="h-5 w-5 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Widget Cuaca Maritim AI
                    </h3>
                    <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      Live BMKG & Open-Meteo
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Kondisi maritim perairan Teluk Penyu & Pelabuhan Tanjung Intan
                  </p>
                </div>
              </div>

              {/* 3 Parameter Cuaca Spesifik yang Diminta User */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                {/* Tinggi Gelombang: 1.4 m */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <Waves className="h-4 w-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Tinggi Gelombang</div>
                    <div className="text-sm font-bold text-white">1.4 m</div>
                  </div>
                </div>

                {/* Kecepatan Angin: 12 knot */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <Wind className="h-4 w-4 text-sky-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Kecepatan Angin</div>
                    <div className="text-sm font-bold text-white">12 knot</div>
                  </div>
                </div>

                {/* Arus Laut: 1.8 m/s */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <Navigation2 className="h-4 w-4 text-emerald-400 rotate-45" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Arus Laut</div>
                    <div className="text-sm font-bold text-white">1.8 m/s</div>
                  </div>
                </div>

                {/* Link ke Peta Cuaca Maritim */}
                <a
                  href="#weather-map-section"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors ml-auto sm:ml-2"
                >
                  <span>Peta Cuaca Maritim</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* 2. Baris Pencarian Rute Kapal */}
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Input Dermaga */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary-light" />
                    <span>Dermaga / Rute</span>
                  </label>
                  <select
                    value={departurePoint}
                    onChange={(e) => setDeparturePoint(e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-white font-medium backdrop-blur-sm"
                  >
                    <option value="Teluk Penyu" className="bg-slate-900 text-white">Teluk Penyu</option>
                    <option value="Pelabuhan Tanjung Intan" className="bg-slate-900 text-white">Pelabuhan Tanjung Intan</option>
                    <option value="Pulau Nusakambangan" className="bg-slate-900 text-white">Pulau Nusakambangan</option>
                    <option value="Wisata Mangrove Segara Anakan" className="bg-slate-900 text-white">Mangrove Segara Anakan</option>
                  </select>
                </div>

                {/* Input Tanggal */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary-light" />
                    <span>Tanggal Berlayar</span>
                  </label>
                  <Input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="h-11 text-sm bg-white/10 border-white/20 rounded-xl text-white font-medium focus-visible:ring-cyan-400/50"
                  />
                </div>

                {/* Input Jumlah Penumpang */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary-light" />
                    <span>Jumlah Penumpang</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={passengers}
                    onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-11 text-sm bg-white/10 border-white/20 rounded-xl text-white font-medium focus-visible:ring-cyan-400/50"
                  />
                </div>

                {/* Tombol Submit Cari Kapal */}
                <div className="space-y-1 flex flex-col justify-end">
                  <Button
                    type="submit"
                    variant="hero"
                    className="h-11 w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm shadow-lg hover:shadow-cyan-500/20"
                  >
                    <Search className="h-4 w-4" />
                    <span>Cari Kapal</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
