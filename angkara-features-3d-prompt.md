# Angkara: Prompt Section Fitur 3D "Character Select"

Tempel setelah blok "Gaya Kerja". Prompt ini hanya untuk **section Fitur**. Hero dikerjakan di sesi terpisah.

## Pemetaan model ke fitur (usulan, ubah sesuai model yang kamu punya)

| Model | Fitur | Catatan |
|---|---|---|
| shield_protection_icon.glb | Listing Terverifikasi | sesuai rencanamu |
| calendar.glb | Kalender Booking | sesuai rencanamu |
| payment_card.glb | Pembayaran Online | DP 30% + escrow |
| whiteboard.glb | Dashboard Analitik | papan laporan data |
| wooden_plate.glb | Informasi Izin | papan petunjuk regulasi KSOP |
| anchor.glb | Paket Wisata | ikon pelayaran |

Repo punya 10 fitur, sedangkan model yang terlihat di screenshot ada 6. Untuk gaya character select, 6 pilihan utama lebih kuat daripada 10 yang sempit. Sisanya (Kalkulator Tarif, Peringatan Cuaca, Rating, Chat) dipertahankan sebagai deretan kartu kecil 2D di bawah panggung dengan judul "Dan masih banyak lagi".

## Prompt

```
TUGAS SESI INI: HANYA section Fitur (src/components/Features.tsx) pada landing page Angkara. Gunakan UI UX taste skill dan scrollcraft skill. Jangan sentuh Hero atau section lain.

KONSEP
Section Fitur dirancang seperti layar "character selection" gim: satu panggung utama dengan model 3D di atas turntable (piringan putar), roster pilihan di sisi, dan panel info fitur. Karakter diganti model 3D fitur.

Referensi visual (ambil tata letak dan suasananya, bukan karakternya):
- Latar bermotif papan catur diagonal dengan gradasi warna cerah.
- Piringan bundar gelap di tengah dengan cincin lampu titik-titik dan tepi menyala.
- Model berdiri di atas piringan, berputar pelan.

ASET (sudah ada, jangan tanya lagi)
src/assets/3model/: anchor.glb, calendar.glb, payment_card.glb, shield_protection_icon.glb, whiteboard.glb, wooden_plate.glb. Skala, titik pusat, dan orientasi tiap model BERBEDA, jadi wajib dinormalisasi otomatis (lihat bagian Model).

STACK (repo memakai React 18.3 dan Vite 5)
- Instal three, @react-three/fiber@^8, @react-three/drei@^9. PENTING: @react-three/fiber v9 butuh React 19, jangan pakai v9. Tambahkan @types/three yang sesuai.
- Impor model dengan "?url" (mis. import shield from "@/assets/3model/shield_protection_icon.glb?url") atau tambahkan assetsInclude: ["**/*.glb"] di vite.config.ts (perubahan minimal, jangan ubah yang lain).
- Gunakan SATU <Canvas> saja untuk seluruh section (satu WebGL context). Jangan membuat satu Canvas per model.

DESAIN
1. Palet: ikuti token Angkara (pasir, tinta laut, koral, seafoam). Latar papan catur diagonal bergradasi seafoam -> teal laut (halus, kontras rendah agar model menjadi fokus), dibuat dengan CSS/SVG, bukan gambar berat. Jangan meniru warna ungu referensi.
2. Piringan: cakram gelap dengan cincin titik amber/koral dan tepi bercahaya seafoam. Buat dengan geometri three (CylinderGeometry + titik instanced) atau tekstur kecil, dengan ContactShadows lembut.
3. Layout desktop: panggung 3D di tengah (±55% lebar), roster vertikal di kiri (6 ikon fitur, item aktif menyala), panel info di kanan (nama fitur besar, deskripsi 1-2 kalimat, 3 poin kunci dari deskripsi yang sudah ada di Features.tsx, dan tautan "Lihat selengkapnya" bila ada rute terkait). Jangan membuat statistik atau angka palsu.
4. Tipografi: sama dengan hero (satu display sans), judul fitur 40-64px.
5. Baris "Dan masih banyak lagi": 4 kartu 2D kecil untuk fitur yang tidak punya model.

INTERAKSI
- Pilih fitur lewat klik roster, tombol panah kiri/kanan keyboard, swipe di mobile, atau scroll (scrollcraft).
- Scroll: section di-pin (tinggi sekitar 80vh per fitur, total maksimal ±500vh). Progres scroll memajukan pilihan aktif; klik manual boleh menimpa dan menyinkronkan posisi scroll.
- Transisi ganti model (±700 ms): model lama berputar cepat sambil mengecil dan memudar, model baru jatuh dari atas lalu memantul kecil di piringan (spring stiffness 220, damping 16). Cincin lampu piringan berdenyut sekali. Teks panel info berganti dengan fade + geser 12px bertahap.
- Idle: model berputar pelan (±0.4 rad/dtk) dan melayang tipis (Float). Drag untuk memutar manual (PresentationControls atau OrbitControls tanpa zoom/pan, batasi sumbu vertikal). Setelah dilepas, kembali berputar otomatis.
- Hover model: sedikit membesar (1.04) dan cahaya rim menguat.

MODEL (wajib)
- Normalisasi otomatis: hitung bounding box tiap model, pusatkan di sumbu x/z, letakkan dasar tepat di permukaan piringan, skalakan ke tinggi seragam (mis. 1.6 unit). Buat helper <FitModel /> yang dipakai semua model.
- Pencahayaan: Environment preset yang hangat (mis. "sunset" atau "city") dengan intensitas rendah + key light + rim light. Pastikan material PBR tidak terlalu gelap atau pantul berlebihan; sesuaikan envMapIntensity per model bila perlu.
- useGLTF.preload untuk model aktif dan model berikutnya; sisanya dimuat malas.
- Tampilkan skeleton/placeholder ringan di panggung selama model dimuat. Tidak boleh ada layar kosong.

PERFORMA
- Section dimuat dengan React.lazy + Suspense dan hanya dirender ketika mendekati viewport (IntersectionObserver), supaya bundle three.js tidak membebani LCP hero.
- dpr={[1, 1.5]}, antialias aktif, tanpa shadow map real-time (pakai ContactShadows yang di-bake/frames={1} bila memungkinkan).
- Hentikan render saat section tidak terlihat (frameloop="never" atau pause ketika di luar viewport) dan saat tab tidak aktif.
- Target ukuran: tiap .glb di bawah 500 KB, total model di bawah 3 MB. Jika lebih besar, kompres dengan @gltf-transform/cli (optimize, draco atau meshopt, texture ke webp/ktx2) dan siapkan DRACOLoader/MeshoptDecoder yang dimuat dari paket lokal, bukan CDN eksternal.
- Hindari useFrame yang memicu setState. Gunakan ref.

AKSESIBILITAS & FALLBACK
- Canvas aria-hidden; roster dan panel info adalah elemen HTML nyata yang bisa diakses keyboard (role="tablist"/"tab"/"tabpanel", aria-selected, fokus terlihat jelas).
- prefers-reduced-motion: tanpa auto-rotate, tanpa pin, ganti model dengan crossfade singkat.
- Tanpa WebGL atau saat gagal memuat model (error boundary): tampilkan grid kartu 2D yang sudah ada sebagai fallback penuh.
- Mobile (<768px): tanpa pin; panggung 3D di atas, roster berupa baris ikon yang bisa digeser, panel info di bawah. Kurangi dpr ke 1.25 dan matikan efek berat.

BATAS LINGKUP
- Boleh: src/components/Features.tsx, src/components/features3d/* (baru), src/index.css, tailwind.config.ts, vite.config.ts (hanya assetsInclude bila perlu), package.json (hanya dependency three dan drei/fiber di atas).
- Jangan sentuh: Navbar, Hero, Supabase, assistant, booking, test yang ada.
- Tambahkan unit test untuk fungsi murni (normalisasi bounding box -> skala/posisi, pemetaan progres scroll -> indeks fitur).
- Verifikasi: npm run build, npm run lint, npm test. Laporkan ukuran bundle chunk three.js.

KELUARAN
1. Rencana: struktur komponen, token desain, storyboard transisi (tabel), daftar file. Tunggu persetujuan saya.
2. Setelah disetujui: implementasi per file dengan kode utuh.
3. Catatan keputusan desain, daftar library, dan sumber/lisensi aset 3D untuk README dan proposal.
```

## Hal yang perlu kamu cek sebelum menempel

- **Lisensi model 3D.** Pastikan sumber dan lisensi tiap `.glb` (mis. dari Sketchfab, biasanya CC-BY wajib atribusi). Guidebook mewajibkan semua aset open-source dicantumkan di proposal dan README.
- **Ukuran file.** Cek ukuran tiap `.glb` (klik kanan > Properties). Model dari Sketchfab sering 5–30 MB dan akan memperlambat web. Kalau besar, minta Gemini menyiapkan perintah `gltf-transform` untuk mengompresnya.
- **Model yang tersisa.** Screenshot hanya menampilkan sampai `wooden_plate.glb`. Kalau ada model lain di bawahnya, tambahkan ke tabel pemetaan.
- **Waktu.** Batas pengumpulan tinggal sekitar 3 hari (20 November, 23.59 WIB). Section 3D ini bagian paling berisiko, jadi minta fallback kartu 2D tetap ada.
