import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logoSuar from "@/assets/logo-suar.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090D16] text-white border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl inline-flex items-center shadow-md border border-white/20">
                <img
                  src={logoSuar}
                  alt="SUAR - Berlayar Aman, Berdaya Bersama"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Platform reservasi kapal wisata bahari pesisir Cilacap & Nusakambangan dengan standar keselamatan KSOP dan panduan AI navigasi cuaca BMKG.
            </p>
            <div className="flex gap-2.5 pt-1">
              <a
                href="#"
                aria-label="Facebook SUAR"
                className="bg-white/5 hover:bg-white/15 p-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram SUAR"
                className="bg-white/5 hover:bg-white/15 p-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter SUAR"
                className="bg-white/5 hover:bg-white/15 p-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="font-bold text-base mb-4 text-white">Layanan Pelayaran</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a href="#boats" className="hover:text-cyan-300 transition-colors">
                  Armada Kapal Siap Berlayar
                </a>
              </li>
              <li>
                <a href="#pilihan-paket-tour" className="hover:text-cyan-300 transition-colors">
                  Pilihan Paket Tour Nusakambangan
                </a>
              </li>
              <li>
                <a href="#destinasi-ikonik" className="hover:text-cyan-300 transition-colors">
                  Destinasi Ikonik Pesisir
                </a>
              </li>
              <li>
                <a href="#weather-map-section" className="hover:text-cyan-300 transition-colors">
                  Peta Cuaca Maritim & Telemetri
                </a>
              </li>
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="font-bold text-base mb-4 text-white">Standar & Informasi</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a href="/permit-info" className="hover:text-cyan-300 transition-colors">
                  Sertifikasi & Kelaikan KSOP
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-300 transition-colors">
                  Cara Kerja Platform SUAR
                </a>
              </li>
              <li>
                <a href="#tanya-sebelum-berlayar" className="hover:text-cyan-300 transition-colors">
                  Konsultasi AI Juru Mudi
                </a>
              </li>
              <li>
                <a href="tel:115" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Pos Siaga Basarnas (Hotline 115)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="font-bold text-base mb-4 text-white">Dermaga & Kontak</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-1 text-cyan-400" />
                <span>Pos Dermaga Wisata Teluk Penyu & Pandanarang, Cilacap, Jawa Tengah</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-cyan-400" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-cyan-400" />
                <span>kontak@suarcilacap.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; 2026 SUAR Cilacap — Berlayar Aman, Berdaya Bersama. Semua hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">Kepatuhan Keselamatan Maritim KSOP & BMKG</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
