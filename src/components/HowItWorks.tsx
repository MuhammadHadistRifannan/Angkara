import React from "react";
import { Search, Compass, Ship, ThumbsUp, ArrowRight, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    tag: "Dermaga Cilacap",
    title: "Cari & Filter Kapal",
    description:
      "Pilih dermaga keberangkatan (Teluk Penyu atau Tanjung Intan), tanggal trip, jumlah penumpang, dan tipe armada kapal.",
  },
  {
    icon: Compass,
    number: "02",
    tag: "AI & BMKG Safety",
    title: "Analisis Cuaca & Review",
    description:
      "Periksa status keselamatan gelombang maritim dan ulasan asli nakhoda berlisensi KSOP sebelum Anda memesan.",
  },
  {
    icon: Ship,
    number: "03",
    tag: "Escrow Terjamin",
    title: "Booking & Bayar DP",
    description:
      "Kunci kursi Anda via transaksi database atomik anti-overbooking dan bayar DP 30% terlindungi sistem escrow aman.",
  },
  {
    icon: ThumbsUp,
    number: "04",
    tag: "Perjalanan Nyaman",
    title: "Nikmati Perjalanan",
    description:
      "Tunjukkan e-tiket digital pada nakhoda di dermaga, kenakan jaket pelampung, dan nikmati pesona bahari Nusakambangan.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-28 bg-[#090D16] text-white relative overflow-hidden border-t border-white/5"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[25rem] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs sm:text-sm font-semibold text-cyan-300 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Alur Pemesanan Sederhana</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Cara Kerja{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-accent bg-clip-text text-transparent">
              Angkara
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed">
            Booking kapal wisata kini semudah 4 langkah transparan tanpa calo dan terproteksi sistem kelaikan laut.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting gradient line on desktop */}
          <div className="hidden lg:block absolute top-20 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-cyan-500/30 via-primary-light/40 to-cyan-400/30 -z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="relative p-7 pt-8 rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/15 hover:-translate-y-1.5 flex flex-col justify-between h-full">
                  {/* Floating Number Badge */}
                  <div className="absolute -top-4 -left-3 bg-gradient-to-br from-primary via-primary-light to-accent text-white rounded-2xl w-12 h-12 flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/25 border border-white/20 group-hover:scale-105 transition-transform">
                    {step.number}
                  </div>

                  <div>
                    {/* Icon Container */}
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-300 group-hover:scale-110 group-hover:text-cyan-200 transition-all duration-300 shadow-sm">
                        <Icon className="h-7 w-7" />
                      </div>

                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                        {step.tag}
                      </span>
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors tracking-tight mb-2">
                      {step.title}
                    </h3>

                    <p className="text-sm text-slate-300/85 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Step bottom arrow */}
                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1 text-xs font-semibold text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span>Langkah {step.number}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
