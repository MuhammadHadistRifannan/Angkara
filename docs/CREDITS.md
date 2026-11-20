# Dokumentasi Aset, Lisensi, & Pernyataan AI — Platform SUAR

Dokumen ini memuat catatan lengkap kepatuhan hak cipta aset, lisensi pustaka, dan deklarasi penggunaan kecerdasan buatan (AI) untuk kepatuhan administrasi kompetisi **IT RUSH 2026**.

---

## 1. Maskot Orisinal & Aset Visual

| Aset | Format / Komponen | Sumber & Atribusi | Lisensi | Status Modifikasi |
| :--- | :--- | :--- | :--- | :--- |
| **Maskot "Si Suar"** | Komponen SVG Murni (`src/components/illustrations/Mascot.tsx`) | **Karya Orisinal Tim SUAR** didesain dan dikodekan dengan bantuan AI Coding Assistant (Google Gemini). Menggambarkan karakter suar navigasi pelampung laut ramah dengan lentera menyala di kepala. Dilarang dan tidak meniru karya pihak ketiga. | Proprietary (Hak Cipta Tim SUAR) | Desain Asli Baru (100% SVG) |
| **Ilustrasi Kapal Armada Suar** | Komponen SVG Murni (`src/components/illustrations/BoatCardIllustration.tsx`) | **Karya Orisinal Tim SUAR**: Ilustrasi ramah membulat perahu jukung tradisional, speedboat fiber, dan kapal ekowisata mangrove dengan Si Suar sebagai kapten nakhoda. | Proprietary (Hak Cipta Tim SUAR) | Desain Asli Baru (100% SVG) |
| **Stiker Maskot Tematik** | Komponen SVG Murni (`src/components/illustrations/MascotSticker.tsx`) | **Karya Orisinal Tim SUAR**: Lencana stiker Si Suar beraksesori payung pantai, masker snorkel, dan joran pancing untuk kartu paket tour. | Proprietary (Hak Cipta Tim SUAR) | Desain Asli Baru (100% SVG) |
| **Font Judul Membulat (Fredoka)** | WOFF2 / WebFont (`@fontsource/fredoka`) | Tipografi judul kartu SuarCard & section ramah membulat (subset latin 600/700, di-bundle mandiri ~32 KB). | Open Font License (OFL) | Self-hosted via @fontsource |
| **Font Judul Playful (Bagel Fat One)** | WOFF2 / WebFont (`@fontsource/bagel-fat-one`) | Tipografi judul tebal membulat halaman autentikasi (subset latin 400, di-bundle mandiri ~24 KB). | Open Font License (OFL) | Self-hosted via @fontsource |
| **Ilustrasi 4 Langkah Alur (Cara Kerja)** | Komponen SVG Murni (`src/components/illustrations/scenes/*.tsx`) | **Karya Orisinal Tim SUAR**: `StepSearch` (dermaga & kaca pembesar), `StepWeather` (payung & matahari cuaca BMKG), `StepBooking` (kunci gembok & escrow DP 30%), `StepDepart` (jaket pelampung SOLAS & e-tiket). | Proprietary (Hak Cipta Tim SUAR) | Desain Asli Baru (100% SVG) |
| **Logo Resmi SUAR** | PNG / Vektor WebP | Desain logo resmi tim SUAR | Proprietary (Hak Cipta Tim SUAR) | Desain Asli |
| **Ikon Antarmuka** | SVG / React Component | [Lucide Icons](https://lucide.dev) | ISC License | Dipakai langsung via paket npm |
| **Peta Pesisir Cilacap** | Tile Layer Web Leaflet | [OpenStreetMap & CartoDB](https://www.openstreetmap.org) | ODbL / OpenStreetMap Contributors | Integrasi Leaflet |
| **Model 3D Maritim** | GLTF / GLB (`public/assets/*.glb`) | Tameng KSOP, Kalender, Kartu Escrow, Analitik, Jangkar | CC0 / CC-BY (Creative Commons Attribution) | Dikonversi & Dioptimasi |

---

## 2. Deklarasi Penggunaan Kecerdasan Buatan (AI)

Sesuai dengan ketentuan transparansi integritas kompetisi:
1. **Google Gemini LLM (Edge Functions):** Digunakan pada fungsi `juru-mudi` sebagai mesin penalaran asisten bahasa alami (Natural Language Processing) hanya dalam mode baca (*read-only tool calling*). Gemini **tidak pernah** menulis langsung ke basis data.
2. **AI Coding Assistant (Antigravity / Gemini CLI):** Digunakan selama proses pengembangan sebagai asisten pemrograman (penulisan unit test TDD, refactoring komponen, pembuatan kode SVG murni maskot "Si Suar", dan integrasi API cuaca).
3. **Pernyataan Orisinalitas:** Semua logika perhitungan keselamatan maritim (`rules.ts`), ambang batas (`thresholds.json`), dan aturan booking anti-overbooking (`create_booking` RPC) adalah hasil formulasi deterministik tim berdasarkan standar BMKG dan KSOP Kelas II Cilacap.
