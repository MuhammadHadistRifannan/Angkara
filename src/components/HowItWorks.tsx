import React from "react";
import { Search, Compass, Ship, ThumbsUp, Sparkles } from "lucide-react";

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

const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-24 bg-[#F8FAFC] text-slate-900 relative overflow-hidden border-t border-slate-200/60"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section matching SUAR Coastal Theme */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs sm:text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-sky-700" />
            <span>Alur Pemesanan Sederhana</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Cara Kerja{" "}
            <span className="text-sky-700">
              Platform SUAR
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Booking kapal wisata kini semudah 4 langkah transparan tanpa calo dan terproteksi sistem kelaikan laut.
          </p>
        </div>

        {/* Steps Grid matching SUAR Coastal Theme */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-sky-200/80 -z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="relative p-7 pt-8 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
                  {/* Floating Number Badge */}
                  <div className="absolute -top-4 -left-3 bg-[#090D16] text-white rounded-2xl w-12 h-12 flex items-center justify-center font-black text-lg shadow-md border border-slate-800 group-hover:scale-105 group-hover:bg-sky-800 transition-all">
                    {step.number}
                  </div>

                  <div>
                    {/* Icon Container & Tag */}
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-105 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>

                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {step.tag}
                      </span>
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-800 transition-colors tracking-tight mb-2">
                      {step.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
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
