import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Send, Ship } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AskBeforeSailingSection: React.FC = () => {
  const navigate = useNavigate();
  const [questionInput, setQuestionInput] = useState("");

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const promptToSend =
      questionInput.trim() ||
      "Apakah besok pagi aman menyeberang ke Nusakambangan naik kapal kayu untuk 8 orang?";

    window.dispatchEvent(
      new CustomEvent("open-assistant", {
        detail: {
          prompt: promptToSend,
        },
      })
    );
    setQuestionInput("");
  };

  const handleSelectBoat = () => {
    navigate("/booking?boat=sri-rejeki-03");
  };

  return (
    <section id="tanya-sebelum-berlayar" className="py-20 sm:py-24 bg-[#F8FAFC] text-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Descriptive info & Key Points matching Image 5 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold shadow-sm">
              <span className="h-2 w-2 rounded-full bg-sky-600 animate-pulse" />
              <span>Asisten Cerdas Navigasi & Cuaca</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Tanya Apa Saja Sebelum Berlayar ke Laut Selatan
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tidak perlu ragu menanyakan kondisi gelombang, kelayakan kapal kayu untuk anak-anak, atau
              estimasi waktu pasang surut. <strong className="text-slate-900 font-bold">SUAR AI Navigator</strong> terhubung langsung ke telemetri BMKG Stasiun Meteorologi Tunggul Wulung dan izin syahbandar KSOP Cilacap.
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
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: AI Navigator Window Mockup matching Image 5 */}
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
                  <span className="font-bold text-sm tracking-tight">SUAR AI Navigator</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <span>Teluk Penyu Online</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
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
                      Halo! Berdasarkan prakiraan resmi <strong className="font-bold text-slate-900">BMKG Stasiun Tunggul Wulung</strong> besok pukul <strong className="font-bold text-slate-900">07.00 – 11.00 WIB</strong>, kondisi perairan Teluk Penyu sangat bersahabat:
                    </p>

                    {/* Blue Telemetry Box */}
                    <div className="rounded-xl p-3.5 bg-sky-50/80 border border-sky-100 space-y-1.5 text-slate-800 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Tinggi Gelombang:</span>
                        <span className="font-bold text-slate-900">1,1 meter (Tenang)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Kecepatan Angin:</span>
                        <span className="font-bold text-slate-900">10 knot (Tenggara)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Status Ijin KSOP:</span>
                        <span className="font-bold text-emerald-600">HIJAU (Aman Berlayar)</span>
                      </div>
                      <div className="pt-1.5 border-t border-sky-200/60 flex justify-between items-center text-[11px]">
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
                    <div className="rounded-xl p-3 border border-cyan-200 bg-cyan-50/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
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

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSelectBoat}
                        className="px-4 py-1.5 rounded-lg bg-[#0B1528] hover:bg-[#1E293B] text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        Pilih
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendQuestion} className="p-4 bg-white border-t border-slate-200/90 flex items-center gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Tanya kondisi ombak, rute kapal, atau aturan anak-anak..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Kirim Pertanyaan"
                  className="w-10 h-10 rounded-xl bg-[#0B1528] hover:bg-[#1E293B] text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AskBeforeSailingSection;
