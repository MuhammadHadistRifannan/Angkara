import React from "react";
import { Compass, Landmark, Trees } from "lucide-react";
import { useNavigate } from "react-router-dom";
import imgKarangBolong from "@/assets/dest-karang-bolong.jpg";
import imgMercusuarCimiring from "@/assets/dest-mercusuar-cimiring.png";
import imgSegaraAnakan from "@/assets/dest-segara-anakan.png";

const destinations = [
  {
    id: "karang-bolong",
    title: "Pantai Karang Bolong & Benteng",
    tag: "PENYEBERANGAN 15 MENIT",
    icon: Compass,
    description:
      "Pasir putih eksotis di sisi timur Pulau Nusakambangan yang berpadu dengan situs cagar benteng kolonial bersejarah.",
    image: imgKarangBolong,
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

export const IconicDestinations: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="destinasi-ikonik" className="py-20 sm:py-24 bg-white text-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Destinasi Ikonik
            <span className="block mt-1">di Pantai Nusakambangan</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Jelajahi keajaiban bentang alam karst selatan, peninggalan benteng kolonial, dan
            mercusuar legendaris yang hanya dapat diakses melalui jalur laut yang aman.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {destinations.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigate("/tour-packages")}
                className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/60"
              >
                {/* Background Image with Zoom */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay for optimal legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                {/* Card Content placed at the bottom */}
                <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-end text-white">
                  {/* Badge */}
                  <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-2.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.tag}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {item.description}
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

export default IconicDestinations;
