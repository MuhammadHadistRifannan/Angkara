import React from "react";
import { motion, type Variants } from "framer-motion";
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-24 bg-white text-slate-900 relative overflow-hidden border-t border-slate-200/60"
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section matching SUAR Coastal Theme */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-3"
        >

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Cara Kerja{" "}
            <span className="text-sky-700">
              Platform SUAR
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Booking kapal wisata kini semudah 4 langkah transparan tanpa calo dan terproteksi sistem kelaikan laut.
          </p>
        </motion.div>

        {/* Steps Grid matching SUAR Coastal Theme */}
        <div className="relative">
          {/* Connecting line on desktop with entrance animation */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeInOut", delay: 0.2 }}
            className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-sky-300 via-cyan-400 to-sky-300 -z-0"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ y: -8, transition: { duration: 0.25 } }}
                  className="relative group flex"
                >
                  <div className="relative p-7 pt-8 rounded-3xl bg-[#F8FAFC]/90 border border-slate-200/90 hover:border-sky-300 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full w-full">
                    {/* Floating Number Badge */}
                    <div className="absolute -top-4 -left-3 bg-[#0B1528] text-white rounded-2xl w-12 h-12 flex items-center justify-center font-black text-lg shadow-md border border-cyan-400/20 group-hover:scale-110 group-hover:bg-sky-800 transition-all duration-300">
                      {step.number}
                    </div>

                    <div>
                      {/* Icon Container & Tag */}
                      <div className="flex items-center justify-between mb-4 mt-2">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                          <Icon className="h-6 w-6" />
                        </div>

                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-800 transition-colors">
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
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
