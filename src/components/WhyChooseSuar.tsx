import React from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const reasons = [
  {
    number: "01",
    tag: "Telemetri Maritim",
    title: "Analisis AI & BMKG Terpadu",
    description:
      "Sistem kami memadukan data prakiraan gelombang terbaru dengan riwayat arus Teluk Penyu. Status pelayaran Aman, Waspada, atau Tunda mengikuti data terbaru, supaya nahkoda dan wisatawan bisa memutuskan sebelum berangkat.",
    linkText: "Lihat Peta Cuaca Maritim",
    action: "scroll-weather",
  },
  {
    number: "02",
    tag: "Ekonomi Nelayan",
    title: "Ekonomi Nelayan Berkelanjutan",
    description:
      "Tanpa perantara dan tanpa calo di dermaga. Harga tertera di depan, dan biaya sewa dibayar langsung kepada nelayan yang bertugas saat Anda berlayar.",
    linkText: "Transparansi bagi hasil",
    action: "scroll-boats",
  },
  {
    number: "03",
    tag: "Lisensi KSOP",
    title: "Standar Keamanan Bahari Ketat",
    description:
      "Setiap armada perahu kayu maupun speedboat melalui verifikasi fisik berkala: kelengkapan rompi pelampung standar ISO, kotak P3K maritim, GPS beacon darurat, serta izin syahbandar.",
    linkText: "Cek lisensi nahkoda",
    action: "permit-info",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const WhyChooseSuar: React.FC = () => {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    if (action === "scroll-weather") {
      const el = document.getElementById("weather-map-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (action === "scroll-boats") {
      const el = document.getElementById("boats-ready-section") || document.getElementById("boats");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (action === "permit-info") {
      navigate("/permit-info");
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-[#F8FAFC] text-slate-900 relative overflow-hidden">
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title with Scroll-Reveal Animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/90 border border-sky-200/80 text-sky-900 text-xs font-semibold uppercase tracking-wider mb-3.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
            <span>Komitmen Keamanan &amp; Pemberdayaan</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Mengapa Wisatawan Memilih Platform SUAR?
          </h2>

          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Standar pelayaran wisata pesisir Cilacap dengan perlindungan keselamatan terpadu dan keadilan tarif bagi nelayan lokal.
          </p>
        </motion.div>

        {/* 
          3 Cards: Icon dan Background Icon Dihilangkan,
          Fokus pada nomor monospaced elegan, tag maritim, judul tegas, dan deskripsi rapi.
        */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid md:grid-cols-3 gap-6 sm:gap-8"
        >
          {reasons.map((item, index) => {
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group rounded-3xl p-7 sm:p-8 bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Subtle Shimmer Highlight on Hover */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top Bar: Nomor Besar & Tag Maritim (Tanpa Icon & Tanpa Background Icon) */}
                  <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-sky-700 tracking-tight group-hover:text-sky-600 transition-colors">
                      {item.number}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wide uppercase bg-sky-50 border border-sky-200/60 text-sky-800">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-sky-800 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Footer link */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleAction(item.action)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-sky-700 transition-colors group/btn"
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1.5 transition-transform text-sky-600" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseSuar;
