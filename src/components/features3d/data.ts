import {
  ShieldCheck,
  CalendarCheck2,
  Wallet,
  BarChart3,
  Sailboat,
  TicketCheck,
  CloudSun,
  StarHalf,
  BotMessageSquare,
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
    icon: ShieldCheck,
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
    icon: CalendarCheck2,
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
    icon: Wallet,
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
    icon: Sailboat,
    targetHeight: MODEL_CONFIG["paket-wisata"].targetHeight,
    initialRotation: MODEL_CONFIG["paket-wisata"].rotation,
  },
];

// 4 fitur pelengkap di bawah panggung (Card Slider interaktif)
export const SECONDARY_FEATURES: SecondaryFeatureItem[] = [
  {
    id: "etiket-asuransi",
    title: "E-Tiket & Asuransi",
    description: "Tiket QR digital, sudah termasuk asuransi kecelakaan laut.",
    icon: TicketCheck,
    href: "#",
    tag: "Asuransi",
    badge: "Asuransi",
    actionText: "Cek Ketentuan Asuransi",
  },
  {
    id: "peringatan-cuaca",
    title: "Peringatan Cuaca BMKG",
    description: "Cuaca laut real-time, dijelaskan sederhana: aman, waspada, atau tunda.",
    icon: CloudSun,
    href: "/cuaca",
    tag: "Cuaca",
    badge: "Cuaca",
    actionText: "Pantau Cuaca Real-Time",
  },
  {
    id: "rating-terverifikasi",
    title: "Ulasan Terverifikasi",
    description: "Hanya dari penumpang yang benar-benar sudah berlayar.",
    icon: StarHalf,
    href: "#armada",
    tag: "Ulasan",
    badge: "Ulasan",
    actionText: "Lihat Ulasan Armada",
  },
  {
    id: "asisten-juru-mudi",
    title: "Juru Mudi, Asisten AI",
    description: "Tanya waktu berlayar terbaik dan kapal yang cocok, kapan saja.",
    icon: BotMessageSquare,
    href: "#",
    tag: "Asisten AI",
    badge: "Asisten AI",
    actionText: "Konsultasi Juru Mudi",
  },
];
