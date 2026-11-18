import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Calendar,
  Anchor,
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
    icon: Anchor,
    tag: "Dermaga Resmi",
    title: "Akses Pandanarang",
    description:
      "Titik keberangkatan legal dan tertib di dermaga wisata Teluk Penyu dengan pos kelaikan kapal dan pemandu bersertifikasi.",
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="py-20 sm:py-24 bg-white text-slate-900 relative overflow-hidden"
    >
      {/* Ambient background decorative elements */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.16, 0.08] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-400 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section with Smooth Scroll-Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 space-y-4"
        >

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Fitur Unggulan untuk{" "}
            <span className="text-sky-700">Pelayaran Modern & Aman</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            10 kapabilitas inti yang dirancang khusus untuk memodernisasi reservasi kapal wisata di pesisir Cilacap dengan standar keselamatan tertinggi.
          </p>
        </motion.div>

        {/* Feature Cards Grid with Staggered Entrance & Micro-Interactions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group relative p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Category Tag Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 group-hover:bg-sky-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                      <Icon className="h-6 w-6 text-sky-700" />
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-800 transition-colors">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-800 transition-colors tracking-tight mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
