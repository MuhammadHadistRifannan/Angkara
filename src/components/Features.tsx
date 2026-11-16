import React from "react";
import {
  Shield,
  Calendar,
  Calculator,
  FileText,
  Cloud,
  CreditCard,
  Star,
  MessageCircle,
  Package,
  BarChart3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    tag: "KSOP Resmi",
    title: "Listing Terverifikasi",
    description:
      "Semua operator kapal terverifikasi KSOP dengan dokumen legalitas lengkap, uji kelaikan berkala, dan badge resmi.",
  },
  {
    icon: Calendar,
    tag: "Anti-Overbooking",
    title: "Kalender Booking",
    description:
      "Sistem kapasitas kursi real-time dengan minimal penumpang otomatis dan opsi sharing trip untuk efisiensi maksimal.",
  },
  {
    icon: Calculator,
    tag: "Diskon Rombongan",
    title: "Kalkulator Tarif",
    description:
      "Estimasi biaya transparan dengan breakdown detail harga dasar per orang dan skema diskon kelompok tanpa biaya siluman.",
  },
  {
    icon: FileText,
    tag: "Regulasi KSOP",
    title: "Informasi Izin",
    description:
      "Panduan lengkap kepatuhan undang-undang pelayaran, sertifikasi nakhoda, dan checklist keselamatan untuk setiap rute perjalanan.",
  },
  {
    icon: Cloud,
    tag: "BMKG & Open-Meteo",
    title: "Peringatan Cuaca",
    description:
      "Pemantauan parameter tinggi gelombang, kecepatan angin, dan petir dengan kalkulasi keselamatan deterministik aman/waspada/tunda.",
  },
  {
    icon: CreditCard,
    tag: "Escrow Aman",
    title: "Pembayaran Online",
    description:
      "Opsi pembayaran DP 30% via e-wallet dan transfer bank terlindungi sistem escrow untuk jaminan kepastian berangkat.",
  },
  {
    icon: Star,
    tag: "GPS Verified",
    title: "Rating Terverifikasi",
    description:
      "Ulasan otentik pasca-perjalanan dari wisatawan asli dengan verifikasi GPS untuk transparansi reputasi operator perahu.",
  },
  {
    icon: MessageCircle,
    tag: "Asisten Cerdas",
    title: "Chat Real-time",
    description:
      "Komunikasi langsung dengan nahkoda kapal serta konsultasi instan bersama AI Juru Mudi untuk rekomendasi trip.",
  },
  {
    icon: Package,
    tag: "Rute Populer",
    title: "Paket Wisata",
    description:
      "Paket perjalanan kurasi terfavorit: jelajah Nusakambangan, sunset Teluk Penyu, dan wisata edukasi mangrove Segara Anakan.",
  },
  {
    icon: BarChart3,
    tag: "Pusat Kendali",
    title: "Dashboard Analitik",
    description:
      "Papan kendali terpadu bagi operator dan otoritas pelabuhan untuk memantau trafik penumpang serta keselamatan pelayaran.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="py-24 sm:py-28 bg-gradient-to-b from-[#090D16] via-[#0D1527] to-[#090D16] text-white relative overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs sm:text-sm font-semibold text-cyan-300 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Ekosistem Maritim Terpadu</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Fitur Unggulan untuk{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-accent bg-clip-text text-transparent">
              Pelayaran Modern & Aman
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed">
            10 kapabilitas inti yang dirancang khusus untuk memodernisasi reservasi kapal wisata di pesisir Cilacap dengan standar keselamatan tertinggi.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-7 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between"
              >
                {/* Top border glowing highlight line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div>
                  {/* Icon & Category Tag Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-300 group-hover:scale-110 group-hover:text-cyan-200 transition-all duration-300 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300/90 group-hover:border-cyan-400/30 group-hover:bg-cyan-500/10 transition-colors">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors duration-200 tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-300/85 leading-relaxed mt-2.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
