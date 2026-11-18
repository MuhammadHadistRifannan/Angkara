import {
  Shield,
  Calendar,
  CreditCard,
  BarChart3,
  Anchor,
  Calculator,
  Cloud,
  Star,
  MessageCircle,
} from "lucide-react";
import type { Feature3DItem, SecondaryFeatureItem } from "./types";
import { MODEL_CONFIG } from "./modelConfig";

// 5 model fitur utama yang terhubung ke tabel konfigurasi orientasi
export const MAIN_FEATURES_3D: Feature3DItem[] = [
  {
    id: "listing-terverifikasi",
    audience: "Wisatawan",
    title: "Listing Terverifikasi",
    description:
      "Kapal dan nakhoda baru tampil di daftar setelah dokumen, kelaikan armada, dan sertifikasinya diperiksa.",
    modelUrl: MODEL_CONFIG["listing-terverifikasi"].url,
    icon: Shield,
    targetHeight: MODEL_CONFIG["listing-terverifikasi"].targetHeight,
    initialRotation: [0, 0, 0],
  },
  {
    id: "kalender-booking",
    audience: "Wisatawan",
    title: "Kalender Booking",
    description:
      "Pilih tanggal dan lihat sisa kursi. Bila kuota minimal belum terpenuhi, trip bisa digabung agar biaya terbagi.",
    modelUrl: MODEL_CONFIG["kalender-booking"].url,
    icon: Calendar,
    targetHeight: MODEL_CONFIG["kalender-booking"].targetHeight,
    initialRotation: [0, 0, 0],
  },
  {
    id: "pembayaran-online",
    audience: "Wisatawan",
    title: "Pembayaran Online",
    description:
      "Bayar uang muka lewat QRIS atau e-wallet. Dana ditampung dengan sistem escrow.",
    modelUrl: MODEL_CONFIG["pembayaran-online"].url,
    icon: CreditCard,
    targetHeight: MODEL_CONFIG["pembayaran-online"].targetHeight,
    initialRotation: [0, 0, 0],
  },
  {
    id: "dashboard-analitik",
    audience: "Operator kapal",
    title: "Dashboard Analitik",
    description:
      "Operator kapal memantau okupansi rute dan performa armada dalam satu halaman.",
    modelUrl: MODEL_CONFIG["dashboard-analitik"].url,
    icon: BarChart3,
    targetHeight: MODEL_CONFIG["dashboard-analitik"].targetHeight,
    initialRotation: [0, 0, 0],
  },
  {
    id: "paket-wisata",
    audience: "Wisatawan",
    title: "Paket Wisata Bahari",
    description:
      "Paket kurasi lokal yang siap dipesan, misalnya sunset Teluk Penyu dan susur mangrove.",
    modelUrl: MODEL_CONFIG["paket-wisata"].url,
    icon: Anchor,
    targetHeight: MODEL_CONFIG["paket-wisata"].targetHeight,
    initialRotation: MODEL_CONFIG["paket-wisata"].rotation,
  },
];

// 4 fitur pelengkap di bawah panggung (Card Slider interaktif)
export const SECONDARY_FEATURES: SecondaryFeatureItem[] = [
  {
    id: "kalkulator-tarif",
    title: "Kalkulator Tarif",
    description:
      "Estimasi biaya transparan dengan breakdown detail bahan bakar, jasa nakhoda, dan sewa kapal tanpa biaya tersembunyi.",
    icon: Calculator,
    href: "#armada",
    tag: "Transparansi Biaya",
    badge: "Nol Biaya Tersembunyi",
    actionText: "Hitung Tarif Sekarang",
  },
  {
    id: "peringatan-cuaca",
    title: "Peringatan Cuaca BMKG",
    description:
      "Integrasi data BMKG real-time dengan status keselamatan deterministik: tinggi gelombang, angin, dan rekomendasi aman berlayar.",
    icon: Cloud,
    href: "/cuaca",
    tag: "Sensor & Radar Maritim",
    badge: "Live Telemetri WIB",
    actionText: "Pantau Cuaca Real-Time",
  },
  {
    id: "rating-terverifikasi",
    title: "Rating Terverifikasi",
    description:
      "Ulasan otentik pasca-trip hanya dari penumpang yang telah menyelesaikan pelayaran dengan verifikasi GPS & foto trip.",
    icon: Star,
    href: "#armada",
    tag: "Validasi Penumpang",
    badge: "100% Penumpang Sah",
    actionText: "Lihat Ulasan Armada",
  },
  {
    id: "asisten-juru-mudi",
    title: "Asisten AI Juru Mudi",
    description:
      "Konsultasi cerdas rekomendasi waktu berlayar, pencarian kapal terbaik, dan panduan keselamatan maritim 24/7.",
    icon: MessageCircle,
    href: "#",
    tag: "Kecerdasan Buatan Bahari",
    badge: "Gemini 2.5 Safe Window",
    actionText: "Konsultasi Juru Mudi",
  },
];
