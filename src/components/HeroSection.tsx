import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Anchor,
  Waves,
  Wind,
  Navigation2,
} from "lucide-react";
import heroBgSea from "@/assets/hero-bg-sea.png";
import heroBoatCard from "@/assets/hero-boat-card.png";

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  // Tujuan — diseragamkan dengan peta, paket tour, dan destinasi (4 tujuan):
  // Pantai Karang Bolong, Pantai Permisan, Mercusuar Cimiring, Laguna Segara Anakan.
  // Keberangkatan selalu dari Teluk Penyu (Dermaga Pandanarang).
  const [departurePoint, setDeparturePoint] = useState("Pantai Karang Bolong");
  const [departureDate, setDepartureDate] = useState("");
  const [passengers, setPassengers] = useState(2);

  // --- Cuaca asli via Open-Meteo (Plan B) ---
  // BMKG tidak punya tinggi gelombang, jadi gelombang dari Open-Meteo Marine.
  // Dipakai sementara karena Edge Function marine-conditions BOOT_ERROR.
  const [waveM, setWaveM] = useState<number | null>(null);
  const [windKn, setWindKn] = useState<number | null>(null);
  const [marineLevel, setMarineLevel] = useState<string>("Waspada");
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [marineError, setMarineError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadMarine() {
      try {
        const res = await fetch(
          "https://marine-api.open-meteo.com/v1/marine?latitude=-7.7401&longitude=109.017&current=wave_height,wave_direction,wave_period&timezone=Asia%2FJakarta"
        );
        const windRes = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-7.7401&longitude=109.017&current=wind_speed_10m,wind_direction_10m&timezone=Asia%2FJakarta"
        );
        const marine = await res.json();
        const wind = await windRes.json();
        const wave = marine.current?.wave_height ?? null;
        const windKmh = wind.current?.wind_speed_10m ?? null;
        if (mounted && wave !== null) setWaveM(wave);
        if (mounted && windKmh !== null) setWindKn(windKmh / 1.852);
        if (mounted) {
          setMarineLevel(wave !== null && wave > 1.5 ? "Waspada" : "Aman");
          setFetchedAt(new Date().toISOString());
        }
      } catch {
        if (mounted) setMarineError(true);
      }
    }

    loadMarine();
    return () => {
      mounted = false;
    };
  }, [departurePoint]);

  // Parallax Scroll Animation Controller via Framer Motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Spring bikin semua gerakan tidak kaku — mengikuti scroll dengan jeda halus.
  // Versi kuat: stiffness lebih rendah supaya lag-nya kelihatan.
  const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 20, mass: 0.6 });

  // Layer 1: Background laut — paling lambat, zoom makin besar.
  const bgY = useTransform(smooth, [0, 1], ["0%", "50%"]);
  const bgScale = useTransform(smooth, [0, 1], [1.1, 1.35]);

  // Layer 2: Teks kiri — paling cepat: turun 120% + hilang total.
  const textY = useTransform(smooth, [0, 1], ["0%", "75%"]);
  const textOpacity = useTransform(smooth, [0, 0.5, 1], [1, 0.4, 0]);
  const textScale = useTransform(smooth, [0, 1], [1, 0.9]);

  // Layer 4: Kartu kapal kanan — naik melawan arah scroll + miring jelas.
  const cardY = useTransform(smooth, [0, 1], ["0%", "-25%"]);
  const cardRotate = useTransform(smooth, [0, 1], [0, 2.5]);
  const cardScale = useTransform(smooth, [0, 1], [1, 0.88]);

  // Watermark raksasa SUAR — layer tengah, paling lambat.
  const watermarkY = useTransform(smooth, [0, 1], ["12%", "-18%"]);
  const watermarkOpacity = useTransform(smooth, [0, 0.6, 1], [0.5, 0.35, 0]);

  // --- Parallax mouse + tilt 3D ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardMouseX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });
  const cardMouseY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 18 });
  const bgMouseX = useSpring(useTransform(mouseX, [-0.5, 0.5], [6, -6]), { stiffness: 60, damping: 20 });

  // Tilt 3D: mouse ke kanan -> kartu miring ke kanan, mouse ke atas -> miring ke atas.
  // Maksimal 7-9 derajat supaya teks di kartu tetap bisa dibaca.
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 });
  // Background miring berlawanan arah, lebih pelan — jadi terasa jauh.
  const bgRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [-2, 2]), { stiffness: 60, damping: 20 });
  const bgRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [3, -3]), { stiffness: 60, damping: 20 });
  // Teks kiri miring sedikit berlawanan arah dengan kartu.
  const textRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [4, -4]), { stiffness: 100, damping: 20 });
  // Bayangan kartu bergerak berlawanan arah tilt.
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [12, -12]), { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(e.clientX / r.width - 0.5);
    mouseY.set(e.clientY / r.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden bg-[#090D16] text-white flex flex-col pt-24 [perspective:1200px]"
    >
      {/* =========================================================================
          LAYER 1: z-0 (Background Laut Parallax)
          ========================================================================= */}
      <motion.div
        data-testid="parallax-bg"
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          y: bgY,
          scale: bgScale,
          x: bgMouseX,
          rotateX: bgRotateX,
          rotateY: bgRotateY,
          transformPerspective: 1200,
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

      {/* Watermark raksasa SUAR — layer tengah, paling lambat */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center overflow-hidden"
        style={{ y: watermarkY, opacity: watermarkOpacity }}
      >
        <span className="text-[20vw] leading-none font-black tracking-tighter text-white/[0.03] select-none">
          SUAR
        </span>
      </motion.div>

      {/* =========================================================================
          HERO MAIN CONTENT AREA (Grid 2 Kolom)
          ========================================================================= */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative pt-6 pb-12">
        <div className="grid lg:grid-cols-12 gap-10 items-center [transform-style:preserve-3d]">
          {/* =====================================================================
              LAYER 2: z-10 (Teks Judul & CTA Kiri)
              ===================================================================== */}
          <motion.div
            className="lg:col-span-7 space-y-6 relative z-10"
            style={{
              y: textY,
              opacity: textOpacity,
              scale: textScale,
              rotateY: textRotateY,
              transformPerspective: 1200,
              willChange: "transform, opacity",
            }}
          >
            {/* Judul Besar */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
            >
              Jelajahi Pesisir Cilacap,{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-accent bg-clip-text text-transparent">
                Berlayar dengan Lebih Aman
              </span>
            </motion.h1>

            {/* Subjudul */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="text-base sm:text-lg text-slate-200/90 max-w-2xl leading-relaxed"
            >
              Platform wisata bahari pesisir Cilacap & Nusakambangan dengan sistem keselamatan maritim real-time, panduan Juru Mudi AI, dan perahu terverifikasi KSOP.
            </motion.p>

            {/* Tombol CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
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
            </motion.div>
          </motion.div>

          {/* =====================================================================
              LAYER 4: z-30 (Kartu Kapal Kanan — 3D tilt)
              ===================================================================== */}
          <motion.div
            className="lg:col-span-5 relative z-30 flex justify-center lg:justify-end [transform-style:preserve-3d]"
            style={{
              y: cardY,
              rotate: cardRotate,
              scale: cardScale,
              x: cardMouseX,
              rotateX,
              rotateY,
              transformPerspective: 1200,
              willChange: "transform",
            }}
          >
            {/* Bayangan 3D di bawah kartu */}
            <motion.div
              aria-hidden="true"
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-8 rounded-full bg-black/60 blur-xl"
              style={{ x: shadowX }}
            />

            {/* Kartu Wisata Perahu */}
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] rounded-[28px] overflow-hidden shadow-2xl border border-white/20 bg-slate-900 group [transform-style:preserve-3d]">
              {/* Gambar 3: Foto Perahu Biru */}
              <img
                src={heroBoatCard}
                alt="Kapal Wisata Bahari Cilacap - Kearifan Bahari Lokal"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient halus di background kartu */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

              {/* Badge Kanan Atas: NO. LAMBUNG: TPY-048 — paling depan (translateZ 50px) */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 [transform:translateZ(50px)]">
                <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold tracking-wider text-[#1e3a5f] uppercase border border-white/50">
                  NO. LAMBUNG: TPY-048
                </div>
              </div>

              {/* Box Bawah: Kearifan Bahari Lokal — tengah (translateZ 35px) */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 z-10 [transform:translateZ(35px)]">
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
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
            className="mt-14 rounded-3xl p-5 sm:p-6 bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-5"
          >
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
                      Prakiraan Open-Meteo
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Kondisi perairan Teluk Penyu & Pelabuhan Tanjung Intan
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {marineError
                      ? "Data cuaca tidak tersedia saat ini — status: Waspada."
                      : fetchedAt
                        ? `Diperbarui ${new Date(fetchedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB · Sumber: Open-Meteo Marine & Forecast`
                        : "Memuat prakiraan cuaca…"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <Waves className="h-4 w-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Tinggi Gelombang</div>
                    <div className="text-sm font-bold text-white">{waveM === null ? "—" : `${waveM.toFixed(2)} m`}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <Wind className="h-4 w-4 text-sky-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Kecepatan Angin</div>
                    <div className="text-sm font-bold text-white">{windKn === null ? "—" : `${Math.round(windKn)} knot`}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <Navigation2 className="h-4 w-4 text-emerald-400 rotate-45" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Status Pelayaran</div>
                    <div className="text-sm font-bold text-white capitalize">{marineLevel}</div>
                  </div>
                </div>

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
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary-light" />
                    <span>Tujuan</span>
                  </label>
                  <select
                    value={departurePoint}
                    onChange={(e) => setDeparturePoint(e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-white font-medium backdrop-blur-sm"
                  >
                    <option value="Pantai Karang Bolong" className="bg-slate-900 text-white">Pantai Karang Bolong</option>
                    <option value="Pantai Permisan" className="bg-slate-900 text-white">Pantai Permisan</option>
                    <option value="Mercusuar Cimiring" className="bg-slate-900 text-white">Mercusuar Cimiring</option>
                    <option value="Laguna Segara Anakan" className="bg-slate-900 text-white">Laguna Segara Anakan</option>
                  </select>
                </div>

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
          </motion.div>
      </div>

      {/* Aksen ombak tipis — SATU layer saja, isi warna section berikutnya (#f8fafc) */}
      <div className="relative w-full overflow-hidden leading-none -mb-px" aria-hidden="true">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60px] sm:h-[80px] block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 L1440,100 L0,100 Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
