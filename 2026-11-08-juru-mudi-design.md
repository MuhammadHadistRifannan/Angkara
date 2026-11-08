# Juru Mudi — Asisten AI Pelayaran & Peta Cuaca Laut (Angkara)

Tanggal: 2026-11-08 · Status: menunggu review · Tenggat kompetisi: 20 Nov 2026 23.59 WIB (IT RUSH 2026, Gelombang 2)

## 1. Tujuan

Wisatawan menceritakan rencana perjalanannya dalam bahasa Indonesia sehari-hari. Agen AI mencari kapal yang cocok, memeriksa cuaca dan gelombang nyata, menilai keselamatan, mengusulkan jendela berangkat yang lebih aman bila perlu, lalu menyusun draf booking. Wisatawan menekan satu tombol konfirmasi untuk memesan.

Peta cuaca laut menampilkan lokasi pengunjung dan titik berangkat dengan grafik prakiraan. Peta ini menggantikan `WeatherWidget` yang sekarang memakai data acak.

**Kriteria keberhasilan (bisa diverifikasi juri di live site):**
1. Pengunjung anonim dapat bertanya dan mendapat rekomendasi yang berasal dari data nyata (DB kapal, cuaca).
2. Setiap angka cuaca menampilkan sumber, waktu data, dan jenisnya (resmi / estimasi model / tidak tersedia).
3. Verdict keselamatan konsisten antara peta dan chat, dan tidak berubah oleh bahasa LLM.
4. Booking hanya terjadi setelah pengguna login dan menekan tombol konfirmasi. Kapasitas dan harga dihitung di server.
5. Saat sumber cuaca gagal, sistem berkata jujur dan tidak menyatakan "aman".

**Bukan tujuan (v1):** pembayaran, notifikasi push, fitur operator/nelayan (masuk tahap 2, bagian 16), peringatan dini maritim BMKG per perairan (belum ada endpoint JSON terdokumentasi yang terverifikasi), prediksi buatan sendiri, analitik bisnis.

## 2. Keputusan yang sudah disepakati

| Topik | Keputusan |
|---|---|
| Pengguna utama | Wisatawan; chat terbuka untuk anonim, booking butuh login |
| LLM | Google Gemini, dipanggil hanya dari Edge Function |
| Aksi agen | Menyusun draf booking; eksekusi lewat tombol konfirmasi dengan sesi login user |
| Pendekatan | A: agen ber-tool di Supabase Edge Function. Fallback B: alur tetap tanpa function-calling |
| Peta | Lokasi pengunjung + titik berangkat; bila izin ditolak, pusat peta di Cilacap |
| Nama fitur | "Juru Mudi" (nama kerja) |

## 3. Kondisi repo saat ini (hasil analisis)

- Stack nyata: Vite + React 18 + TypeScript + shadcn/ui + Tailwind + Supabase (Postgres, RLS, Auth); deploy Netlify. `readme.md` menyebut Next.js, ASP.NET, MySQL dan port 5173; ini tidak cocok dan harus diperbaiki.
- `supabase/` hanya berisi `config.toml` dan 2 migrasi. Belum ada Edge Function. Tabel: `profiles`, `operators`, `boats`, `bookings`, `reviews`, `tour_packages`. Seed: 3 operator, 5 kapal.
- `src/components/WeatherWidget.tsx`: data acak (`Math.random()`) berlabel "Data dari BMKG • real-time".
- `src/components/ChatWidget.tsx`: balasan palsu lewat `setTimeout`.
- `src/components/FareCalculator.tsx`: tarif hardcoded; bug `passengers >= 10 ? 0.9 : passengers >= 20 ? 0.85` membuat diskon 15% tak pernah tercapai.
- `src/pages/Booking.tsx`: insert langsung dari klien; `total_price = base_price * passengers`; tidak ada pengecekan kapasitas antar-booking.
- `bookings` tidak punya batasan kapasitas per kapal/tanggal/jam.

## 4. Arsitektur

```
Browser (React)                      Supabase
┌────────────────────────┐   ┌─────────────────────────────────────────┐
│ AssistantWidget         │──▶│ Edge Function: juru-mudi                 │
│  MessageList + kartu    │◀──│  agent loop (Gemini, maks. 6 putaran)    │
│ WeatherMapPanel         │   │  tools (argumen & hasil divalidasi zod)  │
│  Leaflet + MarineChart  │   │  rate limit per IP                       │
│ useUserLocation         │   ├─────────────────────────────────────────┤
│                         │──▶│ Edge Function: marine-conditions         │
│                         │   │  BMKG + Open-Meteo, cache 30 menit       │
│ Tombol "Pesan sekarang" │──▶│ SQL: rpc create_booking (JWT user, RLS)  │
└────────────────────────┘   └─────────────────────────────────────────┘
```

### Prinsip
1. **LLM tidak pernah menulis ke DB.** Agen mengembalikan `{ text, cards[] }`. Penulisan hanya lewat `create_booking` yang dipanggil klien dengan JWT user.
2. **Verdict dihitung `safety/rules.ts`** (fungsi murni). LLM hanya menjelaskan dan tidak dapat mengubah verdict.
3. **Setiap angka cuaca** membawa `source` (`official` | `model` | `unavailable`) dan `fetched_at`.
4. **Harga dan kapasitas** ditentukan di SQL, bukan oleh LLM atau klien.
5. **Satu sumber data cuaca**: `marine-conditions` dipakai oleh peta dan oleh tool agen, sehingga angka selalu sama.

### Struktur berkas baru
```
supabase/functions/
  _shared/            (zod schemas, cors, rate-limit, cache)
  juru-mudi/          index.ts, agent.ts, tools/*.ts, prompt.ts
  marine-conditions/  index.ts, bmkg.ts, openmeteo.ts
  _shared/safety/     rules.ts, thresholds.json, rules.test.ts
supabase/migrations/  <ts>_assistant_core.sql
src/components/assistant/   AssistantWidget, MessageList, cards/*
src/components/weather/     WeatherMapPanel, MarineChart
src/hooks/useUserLocation.ts
src/lib/assistantClient.ts
```

## 5. Tool agen

| Tool | Fungsi | Catatan |
|---|---|---|
| `search_boats` | Cari kapal tersedia menurut kapasitas, tipe, lokasi, harga | Baca `boats` lewat RLS (kapal `available = true`) |
| `get_marine_conditions` | Deret waktu per jam 7 hari untuk titik berangkat | Memanggil `marine-conditions` |
| `evaluate_departure_windows` | Menilai jendela berangkat dan mengurutkan | Memakai `rules.ts`; LLM tidak menghitung sendiri |
| `check_availability` | Sisa kursi per kapal/tanggal/jam | Sama dengan logika `create_booking` |
| `permit_checklist` | Checklist izin KSOP untuk rute | Sumber: data halaman `PermitInfo` dipindah ke modul bersama |
| `quote_fare` | Harga = `base_price × penumpang`, DP 30% | Sama dengan aturan `create_booking` |
| `propose_booking` | Menyusun kartu draf (tidak menulis DB) | Memvalidasi ulang kapasitas dan verdict |

Semua tool menerima argumen yang divalidasi zod. Tanggal lampau, penumpang di luar `1..capacity`, atau `boat_id` asing ditolak dengan alasan yang bisa dibaca model. Hasil tool selalu berbentuk `{ ok: true, data } | { ok: false, reason }`.

## 6. Mesin aturan keselamatan

`rules.ts` menerima satu jam prakiraan (`wave_m`, `wind_kn`, `rain_mm`, `thunder`) dan tipe kapal, lalu mengembalikan `{ level: aman | waspada | tunda, reasons[] }`.

**Sumber ambang:** imbauan BMKG yang dikutip berulang di media (Antara, Kompas TV, detik): perahu nelayan berisiko bila angin > 15 knot dan gelombang > 1,25 m; kapal tongkang > 16 knot dan > 1,5 m; feri > 21 knot dan > 2,5 m; kapal besar > 27 knot dan > 4,0 m.

**Keputusan desain (asumsi yang harus disetujui reviewer):** BMKG tidak punya kategori untuk speedboat wisata atau kapal kayu wisata. Untuk `speedboat` dan `kapal_kayu`, v1 memakai ambang **perahu nelayan** (paling konservatif): angin 15 knot, gelombang 1,25 m. Ambang disimpan di `thresholds.json` beserta sumbernya, sehingga bisa diubah tanpa mengubah kode.

**Aturan level:**
- `tunda`: gelombang > batas gelombang, atau angin > batas angin, atau ada petir, atau hujan ≥ batas hujan "sangat lebat" (angka dari klasifikasi intensitas BMKG, diverifikasi saat implementasi dan disimpan di `thresholds.json`). Penambahan hujan ekstrem ini membuat warna merah di heatmap selalu sejalan dengan verdict.
- `waspada`: gelombang atau angin ≥ 80% batas, atau curah hujan ≥ 5 mm/jam.
- `aman`: selain itu.
- Angka 80% dan 5 mm/jam adalah **heuristik produk**, bukan standar BMKG; keduanya ada di `thresholds.json` dan dinyatakan demikian di dokumentasi.
- Bila `wave_m` tidak tersedia (`unavailable`), level maksimal `waspada` dengan alasan "data gelombang tidak tersedia". **Tidak pernah `aman`.**

Satuan: angin dari BMKG dan Open-Meteo dalam km/jam dikonversi ke knot (÷ 1,852). Seluruh perhitungan memakai satuan akhir yang sama.

**Jendela berangkat teraman:** untuk tiap hari, jendela 07.00–15.00 WIB dinilai per jam. Level hari = level terburuk dalam jendela. Jendela 07.00–15.00 WIB mencakup sampel jam 7 sampai 15 (inklusif, 9 sampel); bila tidak ada sampel di jendela, level hari `waspada` dengan alasan data tidak tersedia. Peringkat: `aman` > `waspada` > `tunda`, lalu hari terdekat.

## 7. Sumber data cuaca

| Data | Sumber | Jenis | Catatan |
|---|---|---|---|
| Cuaca titik berangkat (hujan, angin, petir, suhu) | BMKG `api.bmkg.go.id/publik/prakiraan-cuaca?adm4=<kode>` | `official` | Wajib mencantumkan BMKG sebagai sumber |
| Tinggi gelombang titik berangkat | Open-Meteo Marine API | `model` | Model global; bisa kasar di dekat pantai; dilabeli estimasi |
| Cuaca lokasi pengunjung | Open-Meteo Forecast | `model` | Gelombang `unavailable` bila di daratan |

- Kode `adm4` titik berangkat belum ditetapkan. Kandidat kecamatan: Cilacap Selatan `33.01.21`, Cilacap Tengah `33.01.22`, Cilacap Utara `33.01.23`, Kampung Laut `33.01.24`. Kode desa/kelurahan dan koordinat Teluk Penyu serta Tanjung Intan diverifikasi saat implementasi (tugas hari 1) dan disimpan di tabel/konstanta `departure_points`.
- Open-Meteo gratis untuk non-komersial dan tanpa API key; atribusi wajib (CC BY 4.0).
- Cache: tabel `weather_cache(key, payload, fetched_at)`, TTL 30 menit. Bila sumber gagal dan cache ada, kembalikan cache dengan `stale: true`.
- Label di UI: "Diperbarui berkala · data per <waktu>". Kata "real-time" tidak digunakan.

## 8. `create_booking` (SQL)

`create_booking(p_boat_id uuid, p_date date, p_time time, p_passengers int, p_notes text) returns bookings`

- `SECURITY DEFINER` dengan `search_path` terkunci; `user_id` selalu `auth.uid()` (tidak ada parameter user); ditolak bila tidak login; `EXECUTE` hanya untuk `authenticated`. Alasan: RLS `bookings` hanya mengizinkan user melihat booking miliknya, dan user biasa tidak boleh `UPDATE`/mengunci baris `boats`; dengan `SECURITY INVOKER` penjumlahan kapasitas akan salah dan penguncian gagal. Fungsi bantu `seats_left(boat, date, time)` juga `SECURITY DEFINER` (hanya mengembalikan angka) dan dapat dipanggil `anon` agar agen dapat mengecek ketersediaan.
- Validasi: kapal ada dan `available`; tanggal ≥ hari ini (zona waktu Asia/Jakarta); `1 ≤ p_passengers ≤ capacity`.
- Kapasitas: `SELECT … FOR UPDATE` pada baris kapal; jumlahkan penumpang booking dengan `booking_status IN ('pending','confirmed')` pada kapal/tanggal/jam yang sama; tolak bila melebihi `capacity`.
- Harga: `total_price = base_price * p_passengers` (aturan yang sama dengan `Booking.tsx` hari ini). DP 30% tetap dihitung di UI.
- `Booking.tsx` dialihkan memakai RPC yang sama agar hanya ada satu jalur pembuatan booking.
- Verdict cuaca **tidak** ditegakkan di SQL pada v1. Kartu draf menampilkan verdict dan peringatan; keputusan akhir ada pada wisatawan. Penegakan keras ditunda dan dicatat sebagai keputusan terbuka.

## 9. Antarmuka

**AssistantWidget** menggantikan `ChatWidget`. Kartu terstruktur: `WeatherVerdictCard`, `BoatOptionsCard`, `SafestWindowCard`, `BookingDraftCard` (tombol "Pesan sekarang"; bila belum login → `/auth`, draf dipulihkan setelah login lewat `sessionStorage` dengan try/catch).

**WeatherMapPanel** (Leaflet + OpenStreetMap): penanda lokasi pengunjung dan titik berangkat; warna penanda titik berangkat mengikuti verdict saat ini. Klik penanda → `MarineChart` (recharts) 48–72 jam: gelombang, angin, hujan, dengan garis ambang dan area berwarna per level, serta tombol "Tanya Juru Mudi" yang membawa konteks titik tersebut. Menggantikan `WeatherWidget` di `Index`.

**State wajib:** memuat (skeleton), izin lokasi ditolak (pusat Cilacap + keterangan), sumber gagal (cache bertanda *tertunda*), kosong, dan kesalahan jaringan. Responsif untuk ponsel, tablet, dan desktop. Atribusi BMKG, Open-Meteo, OpenStreetMap di footer panel.

**Privasi:** koordinat diminta lewat izin browser, dibulatkan ke 0,1° sebelum dikirim, tidak disimpan di DB maupun log.

## 10. Penanganan error dan keamanan

- Gemini 429/timeout: retry sekali dengan backoff; bila tetap gagal, pesan jujur ke pengguna (bukan jawaban tebakan).
- Sumber cuaca gagal: cache bertanda tertunda; tanpa cache → `unavailable` dan tidak pernah `aman`.
- Batas: maks. 6 putaran agen, input pesan ≤ 1.000 karakter, riwayat ≤ 20 pesan, timeout total 25 detik.
- Rate limit per IP (tabel `rate_limits`, jendela 1 menit dan 1 jam) untuk `juru-mudi` dan `marine-conditions`.
- Prompt injection: teks dari DB (deskripsi kapal, ulasan) diperlakukan sebagai data di dalam blok yang dibatasi; agen tidak punya tool tulis.
- Secret `GEMINI_API_KEY` hanya di Supabase secrets. Tidak ada kunci di klien.
- Log terstruktur: ID permintaan, tool yang dipanggil, durasi, hasil `ok/reason`. Tanpa isi pesan pengguna lengkap dan tanpa koordinat.
- Konten: sistem prompt membatasi domain ke pelayaran/wisata Angkara; pertanyaan di luar topik dijawab singkat dengan pengarahan kembali.

## 11. Pengujian

- **Unit (vitest, ditambahkan sebagai devDependency):** `rules.ts` (batas tepat, satuan, `unavailable`), peringkat jendela, kalkulasi tarif/ketersediaan.
- **SQL:** `create_booking` — kapasitas penuh, penumpang 0 atau melebihi kapasitas, tanggal lampau, tanpa login, dua booking bersamaan.
- **Evaluasi agen (~12 prompt Indonesia):** cuaca buruk → disarankan geser; penumpang melebihi kapasitas; pertanyaan di luar topik; prompt injection di deskripsi kapal; anonim meminta booking; sumber cuaca dimatikan; tanggal ambigu ("Sabtu depan").
- **Manual E2E di live site**, termasuk ponsel, izin lokasi ditolak, dan akun demo.
- Definisi selesai: lint dan build lulus, semua uji di atas lulus, fitur lama (booking, dashboard, auth) tetap berfungsi.

## 12. Pekerjaan pendamping (dalam cakupan)

- Hapus `ChatWidget` dan `WeatherWidget` lama.
- Perbaiki bug diskon `FareCalculator` dan baca tarif dari DB (atau modul tarif bersama).
- Perbarui `readme.md`: stack sebenarnya, cara menjalankan, arsitektur AI, **pencantuman penggunaan AI coding assistant dan Gemini**, atribusi data, akun demo.
- Dokumen kompetisi: proposal (PDF), pernyataan orisinalitas dan AI, video demo 3–5 menit. Cerita harus konsisten antara web, kode, proposal, dan video.

## 13. Jadwal (hari 1 = 9 Nov)

| Hari | Pekerjaan |
|---|---|
| 1–2 | `marine-conditions`, `departure_points`, `rules.ts` + uji |
| 3–4 | `juru-mudi`: agent loop dan tool |
| 5 | Migrasi `create_booking`, rate limit, uji SQL |
| 6–7 | UI asisten, peta, grafik |
| 8 | Heatmap cuaca (bagian 17) |
| 9 | README, FareCalculator, `Booking.tsx` → RPC |
| 10 | Evaluasi dan hardening |
| 11 | Proposal, video demo, pernyataan AI, akun demo |
| 12 | Penyangga dan pengumpulan (kirim sebelum 23.59 WIB, jangan menunggu menit terakhir) |

Pemicu fallback ke pendekatan B: bila function-calling Gemini belum stabil pada akhir hari 4, ganti agen dengan alur tetap (ambil data → satu prompt) tanpa mengubah tool, `rules.ts`, `create_booking`, maupun UI.

## 14. Risiko dan hal yang butuh tindakan pemilik repo

- **Akses Supabase:** secret `GEMINI_API_KEY`, penerapan migrasi, dan `supabase functions deploy` memerlukan akses ke proyek Supabase `rfmgvmcitsbyapcvaffy` yang tidak saya miliki. Pemilik repo menjalankannya atau menyediakan jalurnya.
- **Kuota Gemini:** ditahan oleh rate limit, tetapi lonjakan juri tetap bisa menghabiskan kuota; siapkan kunci cadangan atau batas harian.
- **Akurasi gelombang model:** bisa meleset di dekat pantai; mitigasi berupa label estimasi dan tingkat `waspada` saat data tidak lengkap. Tidak ada klaim akurasi prediktif.
- **Ambang untuk kapal wisata** adalah asumsi konservatif (bagian 6), bukan standar resmi untuk speedboat wisata; ini dinyatakan di UI dan dokumentasi.
- **Jadwal ketat** bila pemilik repo mengerjakan proyek lain bersamaan.
- **Riwayat commit** tidak boleh dihapus atau dimanipulasi (aturan kompetisi).

## 15. Keputusan terbuka

1. Apakah verdict `tunda` pada v1 hanya memperingatkan (usulan) atau memblokir tombol "Pesan sekarang"?
2. Kode `adm4` dan koordinat final titik berangkat (diverifikasi hari 1).
3. Apakah `Booking.tsx` dialihkan ke RPC pada hari 8 (usulan) atau dibiarkan?

## 16. Tahap 2 — Papan Keputusan Operator (stretch)

**Syarat mulai:** alur wisatawan (bagian 1–12) dan heatmap (bagian 17) stabil dan lulus evaluasi lebih awal dari jadwal (minimal 2 hari lebih cepat). Dengan heatmap masuk jadwal inti, tahap ini praktis tidak muat; jika syarat tidak terpenuhi, perlakukan sebagai roadmap di proposal dan jangan menggeser dokumentasi (hari 11).

**Inti:** operator dibantu memutuskan apakah kapalnya aman berangkat dan mengurus penumpangnya bila tidak. Memakai ulang mesin yang sama dengan sisi wisatawan: `rules.ts`, `marine-conditions`, `evaluate_departure_windows`, `check_availability`.

**Role:** operator = pengguna yang punya baris di `operators` dengan `user_id` miliknya (tanpa kolom role baru). Rute `/operator-dashboard` sudah memeriksa ini.

### Komponen
1. **Papan Go/No-Go.** Tabel kapal × 7 hari berisi level `aman / waspada / tunda`, alasan numerik, sumber, dan waktu data. Terdapat di `OperatorDashboard`.
2. **Peta operator.** `WeatherMapPanel` yang sama dengan sisi wisatawan, ditambah:
   - **Overlay dampak booking:** pada tiap titik berangkat, jumlah booking dan penumpang per hari, dengan hari `tunda` ditandai. Data dari `bookings` lewat RLS operator yang sudah ada; wisatawan tidak melihat lapisan ini karena kueri tidak mengembalikan data bagi non-operator.
   - **Detail teknis 7 hari per jam:** gelombang, angin, hujan, petir, ditambah periode swell dan arus laut dari Open-Meteo Marine, dengan garis ambang per kapal. Wisatawan tetap melihat ringkasan 48–72 jam.
3. **Bantu geser jadwal.** Untuk booking pada hari `tunda`, sistem mengusulkan tanggal aman terdekat yang kursinya masih cukup. Gemini menyusun teks pemberitahuan ke penumpang. Operator memeriksa lalu menyalinnya atau membuka tautan WhatsApp; **tidak ada pengiriman otomatis**. Perubahan jadwal booking memakai kebijakan UPDATE operator yang sudah ada dan butuh konfirmasi eksplisit operator.

### Batasan
- "Keistimewaan" operator adalah data miliknya (booking, ambang kapal), ditegakkan oleh RLS, bukan sekadar disembunyikan di UI. Data cuaca sendiri tidak dirahasiakan dan sama dengan yang dilihat wisatawan.
- Label tetap "diperbarui berkala" dengan waktu data; tidak ada klaim real-time.
- Tidak ada posisi kapal bergerak: skema hanya menyimpan teks lokasi, bukan data GPS.
- Di luar cakupan: ambang kustom per kapal dan laporan nakhoda (kandidat tahap 3 bila jadwal longgar). Laporan nakhoda butuh tabel baru, kontrol siapa boleh memposting, dan penanganan laporan keliru.

### Pengujian tambahan
- Wisatawan dan operator lain tidak dapat membaca overlay booking milik operator A (uji RLS).
- Usulan geser jadwal tidak pernah melebihi kapasitas dan tidak memilih hari `tunda`.
- Operator tanpa baris `operators` diarahkan keluar dari dashboard.
- Akun operator demo disiapkan dan dicantumkan di proposal agar juri dapat mencobanya.

### Jadwal dan penyangga
Perkiraan 2–2,5 hari kerja (Papan Go/No-Go 0,5; peta operator 1; geser jadwal 1). Dikerjakan hanya bila syarat mulai terpenuhi; evaluasi dan hardening tetap diprioritaskan, dan dokumentasi (hari 11) tidak boleh bergeser. Jika terlambat, potong dari bawah: geser jadwal dulu, lalu detail teknis, lalu overlay.

## 17. Heatmap Cuaca di Peta

**Tujuan:** pengunjung melihat sekilas area mana yang hujannya paling deras atau cuacanya ekstrem. Skala warna **hijau (aman) → kuning (waspada) → merah (ekstrem/tunda)**.

**Kejujuran data:** heatmap dibangun dari titik-titik grid prakiraan model Open-Meteo (nilai "saat ini" per titik), **bukan radar**. Label di UI: "Prakiraan model · diperbarui berkala · data per <waktu>". Tidak memakai kata "real-time". Model tidak menangkap sel hujan konvektif kecil secara tepat; ini dinyatakan di tooltip bantuan.

**Metrik warna:** indeks keparahan 0–100 per titik, dihitung `rules.ts` (satu sumber kebenaran dengan verdict peta dan chat):
- Hujan (mm/jam), angin (knot), dan tinggi gelombang (hanya titik laut) masing-masing dipetakan ke skor 0–100 terhadap ambangnya; indeks = skor tertinggi dari ketiganya.
- Ambang hujan per jam mengikuti klasifikasi intensitas BMKG (ringan / sedang / lebat / sangat lebat). **Angka batasnya diverifikasi ke sumber BMKG saat implementasi** dan disimpan di `thresholds.json`; belum dikutip di spec ini.
- Warna: 0–33 hijau, 34–66 kuning, 67–100 merah, dengan interpolasi halus. Skala yang sama dipakai legenda dan penanda titik berangkat, sehingga `aman/waspada/tunda` selalu konsisten dengan warna.
- Lapisan dapat dipilih: Gabungan (default), Hujan, Angin, Gelombang. Legenda dan label satuan selalu tampil; warna tidak menjadi satu-satunya penanda (ikon dan teks pada penanda untuk aksesibilitas).

**Implementasi:**
- Edge Function `marine-conditions` mendapat endpoint grid: satu permintaan Open-Meteo berisi banyak koordinat (Open-Meteo mendukung banyak lokasi per permintaan).
- Grid **tetap** untuk area Cilacap–Nusakambangan (sekitar 8×8) dan grid kasar (sekitar 6×6) di sekitar lokasi pengunjung bila jauh dari Cilacap. Grid tetap dengan cache 30 menit dipakai bersama oleh semua pengunjung, sehingga jumlah panggilan ke Open-Meteo tidak naik seiring jumlah pengunjung. Anggaran panggilan harian dijaga di server dan dicatat; bila habis, heatmap menampilkan cache terakhir bertanda *tertunda*.
- Klien menginterpolasi (IDW) titik grid menjadi lapisan kanvas di atas Leaflet; wilayah daratan tidak diberi nilai gelombang.
- **Radar (opsional, tidak masuk jadwal inti):** RainViewer menyediakan tile radar gratis, tetapi per 1 Jan 2026 dibatasi (zoom maks. 7, satu skema warna, tanpa prakiraan), hanya untuk penggunaan pribadi/edukasi, tanpa jaminan ketersediaan, dan liputan radar di selatan Jawa belum diverifikasi. Skema warnanya tetap sehingga tidak bisa mengikuti skala merah–hijau kita. Jika ingin dipakai, hanya sebagai toggle terpisah dengan atribusi, setelah liputan dan syaratnya diverifikasi.

**State:** memuat, sumber gagal (cache tertunda), kuota harian habis, dan area tanpa data. Responsif di ponsel; kontrol lapisan dapat diakses dengan keyboard.

**Pengujian:** unit test pemetaan skor ke warna (batas tepat 33/34 dan 66/67), titik laut vs darat, dan indeks bernilai `unavailable`; cek visual di ponsel; pastikan warna penanda titik berangkat sama dengan verdict di chat.

**Perkiraan:** 1 hari (hari 8). Pemotongan bila terlambat: kurangi lapisan menjadi Gabungan saja, lalu turunkan resolusi grid.
