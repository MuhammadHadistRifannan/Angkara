import type React from "react";
import {
  QrCode,
  Building2,
  CreditCard,
  Banknote,
} from "lucide-react";

export interface StepItem {
  id: number;
  label: string;
  description?: string;
}

export const DEFAULT_CHECKOUT_STEPS: StepItem[] = [
  { id: 1, label: "Detail Trip", description: "Jadwal & armada kapal" },
  { id: 2, label: "Metode Pembayaran", description: "Pilihan Midtrans & DP" },
  { id: 3, label: "E-Tiket", description: "Boarding pass resmi" },
];

export type PaymentMethodId =
  | "midtrans_qris"
  | "midtrans_va"
  | "midtrans_card"
  | "dock_cash";

export type PaymentScheme = "dp_30" | "full_100";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subBadges?: string[];
  isMidtrans: boolean;
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  {
    id: "midtrans_qris",
    name: "QRIS (GoPay, OVO, ShopeePay, Dana)",
    description: "Scan instan dari semua aplikasi m-Banking dan e-Wallet di Indonesia.",
    icon: QrCode,
    badge: "Instan & Populer",
    subBadges: ["GoPay", "OVO", "ShopeePay", "Dana", "BCA QR"],
    isMidtrans: true,
  },
  {
    id: "midtrans_va",
    name: "Virtual Account Bank",
    description: "Nomor VA otomatis untuk transfer bank dengan konfirmasi langsung.",
    icon: Building2,
    badge: "Bebas Admin",
    subBadges: ["BCA", "Mandiri", "BNI", "BRI", "Permata"],
    isMidtrans: true,
  },
  {
    id: "midtrans_card",
    name: "Kartu Kredit / Debit Online",
    description: "Pembayaran aman dengan proteksi 3D Secure Midtrans PCI-DSS Level 1.",
    icon: CreditCard,
    badge: "3D Secure",
    subBadges: ["Visa", "Mastercard", "JCB"],
    isMidtrans: true,
  },
  {
    id: "dock_cash",
    name: "Bayar Tunai di Dermaga",
    description: "Bayar DP atau pelunasan langsung ke loket nakhoda di Dermaga Pandanarang.",
    icon: Banknote,
    badge: "Opsi Offline",
    isMidtrans: false,
  },
];

export const BOAT_DESTINATIONS = [
  "Pantai Karang Bolong (Pulau Nusakambangan)",
  "Pantai Permisan (Pasir Putih Nusakambangan)",
  "Mercusuar Cimiring (Cagar Budaya Maritim 1870)",
  "Laguna Segara Anakan (Susur Mangrove)",
  "Kustom / Carter Bebas (Sesuai Kesepakatan)",
];
