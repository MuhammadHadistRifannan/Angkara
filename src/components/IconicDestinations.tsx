import React from "react";
import { motion, type Variants } from "framer-motion";
import { Compass, Landmark, Trees } from "lucide-react";
import imgKarangBolong from "@/assets/dest-karang-bolong.png";
import imgMercusuarCimiring from "@/assets/dest-mercusuar-cimiring.png";
import imgSegaraAnakan from "@/assets/dest-segara-anakan.png";
import imgPermisan from "@/assets/tour-teluk-penyu.png";

const destinations = [
  {
    id: "karang-bolong",
    title: "Pantai Karang Bolong",
    tag: "PENYEBERANGAN 15 MENIT",
    icon: Compass,
    description:
      "Pasir putih eksotis di sisi timur Pulau Nusakambangan, dengan formasi karang berlubang yang menjadi ikon pesisir Cilacap.",
    image: imgKarangBolong,
  },
  {
    id: "permisan",
    title: "Pantai Permisan",
    tag: "PASIR PUTIH NUSAKAMBANGAN",
    icon: Compass,
    description:
      "Pantai pasir putih di Pulau Nusakambangan, tujuan penyeberangan paling populer untuk wisata keluarga dari Teluk Penyu.",
    image: imgPermisan,
  },
  {
    id: "mercusuar-cimiring",
    title: "Mercusuar Cimiring",
    tag: "CAGAR BUDAYA MARITIM 1870",
    icon: Landmark,
    description:
      "Mercusuar legendaris di tebing karang penuntun jalur pelayaran Samudera Hindia dengan panorama samudera lepas yang memukau.",
    image: imgMercusuarCimiring,
  },
  {
    id: "segara-anakan",
    title: "Laguna Segara Anakan",
    tag: "KONSERVASI & WISATA EDUKASI",
    icon: Trees,
    description:
      "Hutan bakau terbesar di Pulau Jawa, surga burung endemik dan habitat biota laut yang tenang untuk jelajah perahu edukasi.",
    image: imgSegaraAnakan,
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
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export const IconicDestinations: React.FC = () => {
  return (
    <section id="destinasi-ikonik" className="py-20 sm:py-24 bg-[#F8FAFC] text-slate-900 relative overflow-hidden border-t border-slate-200/60">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto mb-14 sm:mb-16"
        >

          <h2 className="text-[1.6rem] sm:text-[1.75rem] sm:whitespace-nowrap lg:text-4xl xl:text-[2.75rem] font-black text-slate-900 tracking-tight leading-tight">
            Destinasi Ikonik di Pesisir Cilacap
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Empat tujuan wisata bahari dari Teluk Penyu: Pantai Karang Bolong, Pantai
            Permisan, Mercusuar Cimiring, dan Laguna Segara Anakan — semuanya hanya dapat
            diakses melalui jalur laut.
          </p>
        </motion.div>

        {/* 4 Cards — diseragamkan dengan widget, peta & paket tour */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {destinations.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/70 hover:border-sky-700/50"
              >
                {/* Background Image with Zoom */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay for optimal legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/65 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300"
                />

                {/* Card Content placed at the bottom */}
                <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-end text-white">
                  {/* Badge */}
                  <div className="flex items-center gap-1.5 text-sky-300 text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-2.5">
                    <Icon className="h-3.5 w-3.5 animate-pulse" />
                    <span>{item.tag}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-sky-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-3 group-hover:text-white transition-colors">
                    {item.description}
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

export default IconicDestinations;
