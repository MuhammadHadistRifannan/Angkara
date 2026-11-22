import {
  Shield,
  Calendar,
  CreditCard,
  BarChart3,
  Anchor,
  Ticket,
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
      "Kapal dan nakhoda tampil di daftar beserta dokumen dan sertifikat yang mereka daftarkan.",
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
      "Bayar uang muka 30% di awal, sisanya dibayar saat berangkat.",
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
    id: "etiket-asuransi",
    title: "E-Tiket Digital",
    description:
      "Tiket digital dengan kode QR yang ditunjukkan ke nakhoda di dermaga saat berangkat.",
    icon: Ticket,
    href: "/dashboard",
    tag: "Tiket Digital",
    badge: "Tiket QR Digital",
    actionText: "Lihat E-Tiket",
  },
  {
    id: "peringatan-cuaca",
    title: "Peringatan Cuaca BMKG",
    description:
      "Prakiraan gelombang dan angin terbaru, lengkap dengan status Aman, Waspada, atau Tunda untuk tiap jenis kapal.",
    icon: Cloud,
    href: "/cuaca",
    tag: "Gelombang & Angin",
    badge: "Prakiraan Terbaru",
    actionText: "Lihat Peta Cuaca",
  },
  {
    id: "rating-terverifikasi",
    title: "Rating Terverifikasi",
    description:
      "Ulasan hanya bisa ditulis penumpang yang sudah menyelesaikan pelayaran, bukan dari sembarang akun.",
    icon: Star,
    href: "#armada",
    tag: "Validasi Penumpang",
    badge: "Ulasan Terverifikasi",
    actionText: "Lihat Ulasan Armada",
  },
  {
  id: "asisten-juru-mudi",
  title: "Asisten AI Juru Mudi",
  description:
    "Tanya rekomendasi waktu berlayar, cari kapal yang cocok, dan panduan keselamatan sebelum berangkat.",
  icon: MessageCircle,
  href: "#",
  tag: "Tanya AI",
  badge: "Juru Mudi AI",
  actionText: "Konsultasi Juru Mudi",
},
];
