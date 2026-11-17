import shieldGlb from "@/assets/3model/shield_protection_icon.glb?url";
import calendarGlb from "@/assets/3model/calendar.glb?url";
import paymentCardGlb from "@/assets/3model/payment_card.glb?url";
import whiteboardGlb from "@/assets/3model/whiteboard.glb?url";
import anchorGlb from "@/assets/3model/anchor.glb?url";

export interface ModelConfigItem {
  id: string;
  name: string;
  url: string;
  /** Rotasi koreksi [x, y, z] dalam satuan derajat */
  rotation: [number, number, number];
  targetHeight: number;
  offsetY?: number;
  envMapIntensity?: number;
}

/**
 * Tabel konfigurasi model 3D panggung fitur Angkara.
 * Rotasi ditetapkan dalam satuan derajat (deg), yang dikonversi ke radian
 * sebelum dihitung ulang bounding box dan dipusatkan ke pivot tengah.
 */
export const MODEL_CONFIG: Record<string, ModelConfigItem> = {
  "listing-terverifikasi": {
    id: "listing-terverifikasi",
    name: "Shield Protection",
    url: shieldGlb,
    rotation: [0, 0, 0],
    targetHeight: 1.40,
    offsetY: 0,
    envMapIntensity: 1.4,
  },
  "kalender-booking": {
    id: "kalender-booking",
    name: "Calendar Booking",
    url: calendarGlb,
    rotation: [0, 0, 0],
    targetHeight: 1.45,
    offsetY: 0,
    envMapIntensity: 1.0,
  },
  "pembayaran-online": {
    id: "pembayaran-online",
    name: "Payment Card",
    url: paymentCardGlb,
    rotation: [0, 0, 0],
    targetHeight: 1.35,
    offsetY: 0,
    envMapIntensity: 1.1,
  },
  "dashboard-analitik": {
    id: "dashboard-analitik",
    name: "Dashboard Whiteboard",
    url: whiteboardGlb,
    rotation: [0, 0, 0],
    targetHeight: 1.45,
    offsetY: 0,
    envMapIntensity: 1.0,
  },
  "paket-wisata": {
    id: "paket-wisata",
    name: "Maritime Anchor",
    url: anchorGlb,
    // Anchor tegak lurus sempurna: rotasi X 90 derajat menegakkan batang dengan ring di atas (+Y) dan lengkungan flukes di bawah (-Y)
    rotation: [90, 0, 0],
    targetHeight: 1.42,
    offsetY: 0,
    envMapIntensity: 1.4,
  },
};
