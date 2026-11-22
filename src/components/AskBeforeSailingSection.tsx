import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Send, Ship } from "lucide-react";

export const AskBeforeSailingSection: React.FC = () => {
  return (
    <section id="tanya-sebelum-berlayar" className="py-20 sm:py-24 bg-white text-slate-900 relative overflow-hidden border-t border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Descriptive info & Key Points matching Image 5 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 space-y-6"
          >

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Tanya Apa Saja Sebelum Berlayar ke Laut Selatan
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tidak perlu ragu menanyakan kondisi gelombang, kelayakan kapal kayu untuk anak-anak, atau
              estimasi waktu pasang surut. <strong className="text-slate-900 font-bold">Juru Mudi AI</strong> memakai prakiraan gelombang sebagai panduan sebelum berangkat — keputusan akhir tetap mengikuti instruksi resmi KSOP Cilacap.
            </p>

            {/* 3 Checklist Items */}
            <div className="space-y-3.5 pt-2">
              {[
                "Rekomendasi jenis lambung kapal (Kayu vs Speedboat)",
                "Prediksi jam tenang bebas gelombang pecah",
                "Kontak siaga darurat SAR Pos Cilacap 115",
              ].map((text, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.12 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0B1528] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Juru Mudi AI Window Mockup matching Image 5 */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-2xl">
              {/* Window Header */}
              <div className="bg-[#0B1528] text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-cyan-400" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">Juru Mudi AI</span>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="max-h-[360px] overflow-y-auto p-4 sm:p-5 bg-slate-50/50 space-y-4">
                {/* User Message Bubble */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="max-w-md bg-[#0B1528] text-white rounded-2xl rounded-tr-sm p-4 text-xs sm:text-sm leading-relaxed shadow-sm">
                    <p>
                      Apakah besok pagi aman menyeberang ke Nusakambangan naik kapal kayu untuk 8 orang?
                    </p>
                    <div className="text-right text-[10px] text-slate-400 mt-1.5">
                      09:41 WIB
                    </div>
                  </div>
                </motion.div>

                {/* AI Response Bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0B1528] text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-1 shadow">
                    AI
                  </div>

                  <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm text-xs sm:text-sm">
                    <p className="text-slate-800 leading-relaxed mb-3">
                      Halo! Berdasarkan contoh prakiraan besok pukul <strong className="font-bold text-slate-900">07.00 – 11.00 WIB</strong>, kondisi perairan Teluk Penyu sangat bersahabat:
                    </p>

                    {/* Blue Telemetry Box */}
                    <div className="rounded-2xl p-4 bg-sky-50/90 border border-sky-200/80 space-y-2 text-slate-800 mb-3 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Tinggi Gelombang:</span>
                        <span className="font-bold text-slate-900">1,1 meter (Tenang)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Kecepatan Angin:</span>
                        <span className="font-bold text-slate-900">10 knot (Tenggara)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Status Pelayaran:</span>
                        <span className="font-bold text-emerald-600">HIJAU (Aman Berlayar)</span>
                      </div>
                      <div className="pt-2 border-t border-sky-200/70 flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Rekomendasi Waktu:</span>
                        <span className="font-bold text-slate-800">07:15 – 10:45 WIB</span>
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed mb-3">
                      Kapal kayu tradisional dengan kapasitas 10 pax berstatus <strong className="font-bold text-slate-900">AMAN & LAYAK</strong>. Seluruh penumpang wajib mengenakan pelampung SOLAS yang telah disediakan di kapal.
                    </p>

                    <div className="text-right text-[10px] text-slate-400 mb-3">
                      09:42 WIB
                    </div>

                    {/* Recommended Boat Card */}
                    <div className="rounded-2xl p-3.5 border border-sky-200 bg-white shadow-sm flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                          <Ship className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                            KM Sri Rejeki 03
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            Rp 350.000 (PP) • 10 Pelampung SOLAS
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed shadow-none"
                        title="Simulasi rekomendasi armada kapal"
                      >
                        Pilih
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Penjelasan contoh — simulasi informatif */}
              <p className="px-5 sm:px-6 pt-3 pb-1 text-[11px] leading-relaxed text-slate-400 bg-slate-50/50">
                Percakapan di atas merupakan simulasi ilustratif. Fitur interaktif Juru Mudi AI dapat diakses langsung melalui Dashboard Wisatawan.
              </p>

              {/* Chat Input Bar (Dinonaktifkan di Landing Page) */}
              <form onSubmit={(e) => e.preventDefault()} className="p-4 bg-white border-t border-slate-200/90 flex items-center gap-2.5">
                <input
                  type="text"
                  disabled
                  placeholder="Chat Juru Mudi AI aktif di Dashboard setelah masuk..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs sm:text-sm text-slate-400 placeholder-slate-400 cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  aria-label="Kirim Pertanyaan"
                  className="w-10 h-10 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0 shadow-none cursor-not-allowed transition-colors"
                  title="Fitur chat interaktif dinonaktifkan di landing page"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AskBeforeSailingSection;
