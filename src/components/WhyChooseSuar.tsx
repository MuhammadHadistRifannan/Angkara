import React from "react";
import { Brain, Handshake, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const reasons = [
  {
    number: "01",
    icon: Brain,
    title: "Analisis AI & BMKG Terpadu",
    description:
      "Sistem kami memadukan data telemetri gelombang BMKG Tunggul Wulung dengan riwayat arus batimetri Teluk Penyu. Jadwal penyeberangan dikunci otomatis demi pencegahan insiden laut.",
    linkText: "Pelajari model keselamatan",
    action: "scroll-weather",
  },
  {
    number: "02",
    icon: Handshake,
    title: "Ekonomi Nelayan Berkelanjutan",
    description:
      "Tanpa perantara dan tanpa spekulasi calo dermaga. 100% biaya sewa tertera transparan dan masuk ke rekening nelayan tradisional Pandanarang Cilacap yang bertugas saat Anda berlayar.",
    linkText: "Transparansi bagi hasil",
    action: "scroll-boats",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Standar Keamanan Bahari Ketat",
    description:
      "Setiap armada perahu kayu maupun speedboat melalui verifikasi fisik berkala: kelengkapan rompi pelampung standar ISO, kotak P3K maritim, GPS beacon darurat, serta izin syahbandar.",
    linkText: "Cek lisensi nahkoda",
    action: "permit-info",
  },
];

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
    <section className="py-20 sm:py-24 bg-white text-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Mengapa Wisatawan Memilih Platform SUAR?
          </h2>
        </div>

        {/* 3 Cards matching Image 2 */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {reasons.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-2xl p-7 sm:p-8 bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon with Light Blue Container */}
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-primary mb-6">
                    <Icon className="h-6 w-6 text-sky-700" />
                  </div>

                  {/* Number */}
                  <div className="text-xs font-bold text-slate-400 tracking-wider mb-2">
                    {item.number}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer link */}
                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => handleAction(item.action)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-primary transition-colors group"
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSuar;
