/**
 * Data demo SUAR — 12 kapal + 8 paket tour yang sama dengan yang tampil
 * di landing page (ReadyFleetSection, TourPackagesSection).
 *
 * Dipakai sebagai FALLBACK saat Supabase gagal / tabel masih kosong, supaya
 * halaman Booking dan /tour-packages tidak pernah menampilkan ringkasan
 * kosong atau "Gagal memuat paket tour".
 *
 * PENTING: `id` di sini adalah UUID TETAP yang sama dengan yang dipakai
 * seed SQL `seed-demo-12-kapal-8-paket.sql`. Setelah Hadist menjalankan
 * seed itu di Supabase, baris-baris ini ada di database dengan id yang
 * sama — halaman Booking menemukannya lewat Supabase dan RPC
 * `create_booking` bisa memproses pemesanan sampai selesai. Sebelum seed
 * dijalankan, Booking tetap menampilkan ringkasan + DP, tapi tombol
 * "Lanjut ke Pembayaran" memberi tahu dengan jujur bahwa kapal demo
 * belum terdaftar di sistem pemesanan.
 *
 * Data ini adalah data demo (bukan data operasional nyata). Jangan
 * menampilkan klaim "Terverifikasi KSOP" / "Live" untuk data ini.
 */

export interface DemoBoat {
  id: string;
  name: string;
  description: string;
  base_price: number;
  capacity: number;
  type: "speedboat" | "kapal_kayu";
  location: string;
  captainName: string;
  boatTypeTag: string;
}

export interface DemoPackage {
  id: string;
  name: string;
  description: string;
  destination: string;
  category: "keluarga" | "mangrove" | "mancing";
  durationLabel: string;
  durationHours: number;
  price: number;
  unit: string;
  includes: string[];
}

export const DEMO_BOATS: DemoBoat[] = [
  {
    "id": "10000000-0000-4000-8000-000000000001",
    "name": "KM Sri Rejeki 03",
    "description": "Jukung Tradisional — Nahkoda Pak Slamet Riyadi (24 th pengalaman). 12 Jaket Pelampung SOLAS. Mesin: Yamaha Marine 15PK.",
    "base_price": 350000,
    "capacity": 10,
    "type": "kapal_kayu",
    "location": "Teluk Penyu",
    "captainName": "Pak Slamet Riyadi (24 th pengalaman)",
    "boatTypeTag": "Jukung Tradisional"
  },
  {
    "id": "10000000-0000-4000-8000-000000000002",
    "name": "KM Nusantara Express 01",
    "description": "Speedboat Fiber Cepat — Nahkoda Mas Budiarto (Sertifikasi KSOP). 24 Pelampung + Life Raft. Mesin: Twin Yamaha 200HP.",
    "base_price": 650000,
    "capacity": 20,
    "type": "speedboat",
    "location": "Teluk Penyu",
    "captainName": "Mas Budiarto (Sertifikasi KSOP)",
    "boatTypeTag": "Speedboat Fiber Cepat"
  },
  {
    "id": "10000000-0000-4000-8000-000000000003",
    "name": "KM Segara Anakan 07",
    "description": "Kapal Ekowisata — Nahkoda Kang Darmo (Pemandu Mangrove). Sound Guide + Binokular. Mesin: Mesin Diesel Silent 40PK.",
    "base_price": 400000,
    "capacity": 12,
    "type": "kapal_kayu",
    "location": "Teluk Penyu",
    "captainName": "Kang Darmo (Pemandu Mangrove)",
    "boatTypeTag": "Kapal Ekowisata"
  },
  {
    "id": "10000000-0000-4000-8000-000000000004",
    "name": "KM Camar Laut 02",
    "description": "Speedboat Fiber Cepat — Nahkoda Pak Tarno. 10 Jaket Pelampung SOLAS. Mesin: Yamaha 40PK.",
    "base_price": 550000,
    "capacity": 8,
    "type": "speedboat",
    "location": "Teluk Penyu",
    "captainName": "Pak Tarno",
    "boatTypeTag": "Speedboat Fiber Cepat"
  },
  {
    "id": "10000000-0000-4000-8000-000000000005",
    "name": "KM Baruna Jaya 05",
    "description": "Kapal Kayu Tradisional — Nahkoda Pak Karso. 18 Jaket Pelampung SOLAS. Mesin: Diesel 30PK.",
    "base_price": 300000,
    "capacity": 15,
    "type": "kapal_kayu",
    "location": "Teluk Penyu",
    "captainName": "Pak Karso",
    "boatTypeTag": "Kapal Kayu Tradisional"
  },
  {
    "id": "10000000-0000-4000-8000-000000000006",
    "name": "KM Samudra Kilat 01",
    "description": "Speedboat Fiber Cepat — Nahkoda Mas Agus. 14 Pelampung + Life Raft. Mesin: Twin Yamaha 115HP.",
    "base_price": 600000,
    "capacity": 12,
    "type": "speedboat",
    "location": "Teluk Penyu",
    "captainName": "Mas Agus",
    "boatTypeTag": "Speedboat Fiber Cepat"
  },
  {
    "id": "10000000-0000-4000-8000-000000000007",
    "name": "KM Lumba-Lumba 04",
    "description": "Speedboat Fiber Cepat — Nahkoda Pak Dedi. 8 Jaket Pelampung SOLAS. Mesin: Yamaha 40PK.",
    "base_price": 450000,
    "capacity": 6,
    "type": "speedboat",
    "location": "Teluk Penyu",
    "captainName": "Pak Dedi",
    "boatTypeTag": "Speedboat Fiber Cepat"
  },
  {
    "id": "10000000-0000-4000-8000-000000000008",
    "name": "KM Bahari Sejahtera 09",
    "description": "Kapal Kayu Tradisional — Nahkoda Pak Joko. 22 Jaket Pelampung SOLAS. Mesin: Diesel 40PK.",
    "base_price": 350000,
    "capacity": 20,
    "type": "kapal_kayu",
    "location": "Teluk Penyu",
    "captainName": "Pak Joko",
    "boatTypeTag": "Kapal Kayu Tradisional"
  },
  {
    "id": "10000000-0000-4000-8000-000000000009",
    "name": "KM Albatros 06",
    "description": "Speedboat Fiber Cepat — Nahkoda Mas Rian. 12 Pelampung + Life Raft. Mesin: Yamaha 85HP.",
    "base_price": 500000,
    "capacity": 10,
    "type": "speedboat",
    "location": "Teluk Penyu",
    "captainName": "Mas Rian",
    "boatTypeTag": "Speedboat Fiber Cepat"
  },
  {
    "id": "10000000-0000-4000-8000-000000000010",
    "name": "KM Mangrove Explorer 02",
    "description": "Kapal Ekowisata — Nahkoda Kang Udin. Sound Guide + Binokular. Mesin: Mesin Diesel Silent 40PK.",
    "base_price": 425000,
    "capacity": 12,
    "type": "kapal_kayu",
    "location": "Teluk Penyu",
    "captainName": "Kang Udin",
    "boatTypeTag": "Kapal Ekowisata"
  },
  {
    "id": "10000000-0000-4000-8000-000000000011",
    "name": "KM Pesisir Indah 08",
    "description": "Kapal Kayu Tradisional — Nahkoda Pak Warto. 16 Jaket Pelampung SOLAS. Mesin: Diesel 30PK.",
    "base_price": 325000,
    "capacity": 14,
    "type": "kapal_kayu",
    "location": "Teluk Penyu",
    "captainName": "Pak Warto",
    "boatTypeTag": "Kapal Kayu Tradisional"
  },
  {
    "id": "10000000-0000-4000-8000-000000000012",
    "name": "KM Cahaya Selatan 10",
    "description": "Speedboat Fiber Cepat — Nahkoda Mas Fajar. 18 Pelampung + Life Raft. Mesin: Twin Yamaha 150HP.",
    "base_price": 625000,
    "capacity": 16,
    "type": "speedboat",
    "location": "Teluk Penyu",
    "captainName": "Mas Fajar",
    "boatTypeTag": "Speedboat Fiber Cepat"
  }
];

export const DEMO_PACKAGES: DemoPackage[] = [
  {
    "id": "20000000-0000-4000-8000-000000000001",
    "name": "Penyeberangan Teluk Penyu – Pantai Pasir Putih Permisan",
    "description": "Menyeberangi selat tenang menuju Pantai Permisan di Nusakambangan. Jelajah pantai pasir putih alami dengan ombak teduh yang ramah keluarga.",
    "destination": "Pantai Permisan",
    "category": "keluarga",
    "durationLabel": "15 Menit",
    "durationHours": 0.25,
    "price": 35000,
    "unit": "/ orang",
    "includes": [
      "Perairan Tenang",
      "Gratis Pelampung Anak"
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000000002",
    "name": "Jelajah Hutan Mangrove & Laguna Segara Anakan",
    "description": "Menyusuri ekosistem mangrove terbesar di Pulau Jawa. Termasuk kunjungan ke tambak kepiting bakau dan susur perairan tenang.",
    "destination": "Laguna Segara Anakan",
    "category": "mangrove",
    "durationLabel": "2 Jam",
    "durationHours": 2.0,
    "price": 350000,
    "unit": "/ group",
    "includes": [
      "Pemandu Lokal",
      "Donasi 1 Pohon Bakau"
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000000003",
    "name": "Trip Memancing & View Mercusuar Cimiring 1870",
    "description": "Sensasi memancing ikan kakap putih dan tenggiri di spot karang laut dalam dengan latar spektakuler mercusuar bersejarah peninggalan kolonial.",
    "destination": "Mercusuar Cimiring",
    "category": "mancing",
    "durationLabel": "4 Jam",
    "durationHours": 4.0,
    "price": 550000,
    "unit": "/ paket",
    "includes": [
      "Fishfinder Sonar",
      "Alat Pancing Lengkap"
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000000004",
    "name": "Sunset Teluk Penyu – Pantai Karang Bolong",
    "description": "Berlayar sore dari Teluk Penyu menuju Pantai Karang Bolong, pulang saat matahari terbenam di Laut Selatan.",
    "destination": "Pantai Karang Bolong",
    "category": "keluarga",
    "durationLabel": "2 Jam",
    "durationHours": 2.0,
    "price": 75000,
    "unit": "/ orang",
    "includes": [
      "Perairan Tenang",
      "Spot Foto Sunset"
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000000005",
    "name": "Snorkeling Pantai Karang Bolong",
    "description": "Snorkeling di perairan jernih Pantai Karang Bolong dengan pemandu lokal.",
    "destination": "Pantai Karang Bolong",
    "category": "keluarga",
    "durationLabel": "3 Jam",
    "durationHours": 3.0,
    "price": 150000,
    "unit": "/ orang",
    "includes": [
      "Alat Snorkeling",
      "Pemandu Lokal"
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000000006",
    "name": "Susur Sungai & Tambak Kepiting Laguna Segara Anakan",
    "description": "Menyusuri sungai dan tambak kepiting bakau di Segara Anakan bersama pemandu lokal.",
    "destination": "Laguna Segara Anakan",
    "category": "mangrove",
    "durationLabel": "3 Jam",
    "durationHours": 3.0,
    "price": 275000,
    "unit": "/ group",
    "includes": [
      "Pemandu Lokal",
      "Edukasi Mangrove"
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000000007",
    "name": "Mancing Malam & Sunrise Mercusuar Cimiring",
    "description": "Mancing malam di spot karang, lalu menunggu matahari terbit dengan latar Mercusuar Cimiring 1870.",
    "destination": "Mercusuar Cimiring",
    "category": "mancing",
    "durationLabel": "6 Jam",
    "durationHours": 6.0,
    "price": 750000,
    "unit": "/ paket",
    "includes": [
      "Alat Pancing Lengkap",
      "Fishfinder Sonar"
    ]
  },
  {
    "id": "20000000-0000-4000-8000-000000000008",
    "name": "Jelajah Sehari – Permisan, Karang Bolong & Mercusuar Cimiring",
    "description": "Satu hari penuh: Pantai Pasir Putih Permisan, Karang Bolong, dan view Mercusuar Cimiring dari laut.",
    "destination": "Pantai Permisan, Pantai Karang Bolong & Mercusuar Cimiring",
    "category": "keluarga",
    "durationLabel": "6 Jam",
    "durationHours": 6.0,
    "price": 250000,
    "unit": "/ orang",
    "includes": [
      "Perairan Tenang",
      "Pemandu Lokal"
    ]
  }
];

export const findDemoBoat = (
  id: string | null | undefined
): DemoBoat | undefined =>
  !id ? undefined : DEMO_BOATS.find((b) => b.id === id);

const PACKAGE_SLUG_MAP: Record<string, string> = {
  "pkg-teluk-penyu": "20000000-0000-4000-8000-000000000001",
  "pkg-segara-anakan": "20000000-0000-4000-8000-000000000002",
  "pkg-mancing-mercusuar": "20000000-0000-4000-8000-000000000003",
  "pkg-sunset-karang-bolong": "20000000-0000-4000-8000-000000000004",
  "pkg-snorkeling-karang-bolong": "20000000-0000-4000-8000-000000000005",
  "pkg-susur-tambak": "20000000-0000-4000-8000-000000000006",
  "pkg-mancing-malam": "20000000-0000-4000-8000-000000000007",
  "pkg-nusakambangan-sehari": "20000000-0000-4000-8000-000000000008",
};

export const findDemoPackage = (
  id: string | null | undefined
): DemoPackage | undefined => {
  if (!id) return undefined;
  const direct = DEMO_PACKAGES.find((p) => p.id === id);
  if (direct) return direct;
  const mappedId = PACKAGE_SLUG_MAP[id];
  return mappedId ? DEMO_PACKAGES.find((p) => p.id === mappedId) : undefined;
};
