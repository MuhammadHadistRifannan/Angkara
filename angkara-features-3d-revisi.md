# Angkara: Revisi Section Fitur 3D

Tempel di sesi Gemini yang sama dengan section Fitur. Prompt ini **menggantikan** bagian desain, interaksi, dan pemetaan model dari prompt sebelumnya. Bagian stack, performa, aksesibilitas, dan batas lingkup tetap berlaku.

## Pemetaan model yang benar (5 model fitur + 1 alas)

| Model | Peran |
|---|---|
| wooden_plate.glb | **Tatakan/alas tetap** untuk semua model (bukan fitur) |
| shield_protection_icon.glb | Listing Terverifikasi |
| calendar.glb | Kalender Booking |
| payment_card.glb | Pembayaran Online |
| whiteboard.glb | Dashboard Analitik |
| anchor.glb | Paket Wisata (ubah bila kamu ingin fitur lain) |

## Prompt revisi

```
REVISI SECTION FITUR 3D. Ikuti persis, jangan menambah elemen lain.

1. TATAKAN (PLATE)
- src/assets/3model/wooden_plate.glb adalah alas model 3D. Muat dan tampilkan file itu sebagai tatakan satu-satunya. DILARANG membuat ground, piringan, cincin lampu, atau cakram buatan sendiri. Hapus semua geometri ground buatan yang sudah ada.
- Plate tetap diam di tengah panggung dan tidak diganti saat ganti fitur. Hanya model fitur yang berganti.
- Normalisasi plate: skalakan ke lebar seragam, pusatkan, lalu hitung permukaan atasnya dari bounding box (titik y tertinggi). Setiap model fitur diletakkan TEPAT di permukaan atas itu (dasar model menyentuh plate, tidak melayang atau tenggelam), dipusatkan di x/z, dan diskalakan ke tinggi seragam (agar kelimanya tampak setara besar).
- Hanya 5 model fitur (shield, calendar, payment_card, whiteboard, anchor). Hapus fitur ke-6 dan semua model buatan Gemini yang bukan dari folder 3model.

2. LAYOUT: TIDAK ADA APA PUN DI SAMPING MODEL
- Hapus roster fitur di kiri dan panel info di kanan. Tidak ada teks, kartu, atau daftar di kiri maupun kanan model.
- Isi section hanya: judul section (ringkas, di atas), panggung 3D di tengah, dan dua tombol panah kiri/kanan.
- Satu-satunya keterangan yang boleh ada: nama fitur satu baris kecil, rata tengah, tepat di bawah plate (konstanta SHOW_CAPTION = true agar mudah dimatikan). Tanpa deskripsi. Untuk pembaca layar, umumkan nama fitur aktif lewat elemen aria-live yang tidak terlihat.
- Judul section dipadatkan (clamp 2rem-3.5rem) supaya seluruh panggung terlihat dalam satu layar (judul + panggung maksimal 100svh). Pada tampilan saat ini model terpotong di bawah layar.
- Hapus pinning dan perpindahan model berdasarkan scroll untuk sementara. Section tinggi normal. Scrollcraft hanya dipakai untuk momen masuk (lihat poin 4).
- Canvas harus transparan (alpha) dan cukup besar sehingga plate dan model TIDAK terpotong. Tidak boleh ada tepi persegi hitam yang terlihat di kiri-kanan plate seperti pada tampilan saat ini.

3. LATAR: SERASI DENGAN HERO DI ATASNYA
- Saat ini bagian bawah hero memudar ke warna pucat kebiruan/putih, lalu section Fitur berganti tiba-tiba ke navy gelap. Ini yang salah.
- Ambil warna akhir overlay/fade di bagian bawah hero (baca dari kode Hero) dan jadikan CSS variable bersama (mis. --hero-bottom). Bagian atas section Fitur dimulai TEPAT dengan warna itu, lalu bergradasi halus ke warna laut yang lebih dalam (teal gelap dari token Angkara di index.css, bukan navy baru) menuju area panggung. Efeknya seperti turun dari langit ke kedalaman laut, tanpa garis batas yang keras.
- Gunakan hanya token warna yang sudah ada (pasir, tinta laut, seafoam, koral). Jangan memakai hex navy baru. Motif papan catur/berlian, bila dipertahankan, hanya muncul samar (opacity maks 0.05) di bagian yang sudah gelap.
- Pastikan teks judul tetap kontras AA di sepanjang gradasi.

4. LAMPU SOROT
- Model disorot lampu dari atas: three SpotLight hangat (putih-krem) mengarah ke model, sudut sempit dengan penumbra lembut, ditambah cahaya isi (fill) redup dan rim light tipis dari belakang supaya siluet model terbaca.
- Sekeliling gelap secara halus (vignette), pusat panggung terang. Tambahkan berkas cahaya (beam) tipis dari atas ke plate memakai gradasi CSS atau SpotLight volumetric dari drei; pilih yang lebih ringan dan sediakan fallback tanpa volumetric di mobile.
- Momen masuk (scrollcraft): ketika section mencapai ~35% viewport, lampu "menyala" (intensitas 0 -> 1 dalam 800 ms, easing halus, tanpa berkedip), lalu model pertama muncul dengan bounce membesar (lihat poin 6).
- Bayangan lembut di atas permukaan plate memakai ContactShadows yang diletakkan di permukaan plate (bukan ground baru).

5. HOVER: BOUNCE MEMBESAR
- Saat pointer berada di atas model: scale animasi dari 1 ke ±1.18 dengan spring yang overshoot (mis. stiffness 260, damping 10, mass 1), cursor: pointer. Saat pointer keluar: kembali ke 1 dengan spring yang sama.
- Di layar sentuh: ketuk model memicu bounce yang sama.
- Implementasikan lewat ref di useFrame atau @react-spring/three, tanpa setState per frame. Putar pelan model di tempat (±0.35 rad/dtk) dan hentikan rotasi saat hover.

6. GANTI MODEL DENGAN PANAH
- Dua tombol panah (kiri dan kanan) di tepi panggung, vertikal tengah, bergaya kaca yang selaras dengan navbar liquid glass (blur, border tipis terang). Ukuran minimal 48px, ikon lucide-react ChevronLeft/ChevronRight, aria-label "Fitur sebelumnya"/"Fitur berikutnya".
- Dukungan keyboard ArrowLeft/ArrowRight (saat panggung fokus atau dalam viewport), swipe kiri/kanan di mobile. Navigasi berputar (setelah fitur terakhir kembali ke pertama).
- Animasi ganti: model lama mengecil ke 0 dengan cepat (±180 ms, ease-in) langsung di atas plate; model baru muncul dari skala 0 dengan bounce membesar (overshoot sampai ±1.15 lalu mengendap ke 1, spring stiffness 220, damping 12) sambil sedikit berputar (±180 derajat, selesai bersama bounce). Bersamaan, intensitas spotlight berdenyut tipis (+15% lalu kembali).
- Selama transisi, abaikan klik tambahan atau antrekan hanya yang terakhir. Tombol punya efek tekan (scale 0.94, spring).
- Titik indikator 5 buah di bawah caption BOLEH ditambahkan hanya bila kecil dan rata tengah. Jika ragu, jangan tambahkan.

7. YANG TETAP BERLAKU
- Satu Canvas, lazy-load, berhenti render saat di luar viewport, fallback kartu 2D bila WebGL gagal, prefers-reduced-motion (ganti bounce dengan crossfade singkat, tanpa rotasi otomatis), batas ukuran .glb.
- Jangan sentuh Hero dan Navbar selain membaca warna akhir fade hero untuk variable bersama.

KELUARAN
1. Ringkasan perubahan dan daftar file yang akan diubah. Tunggu persetujuan saya.
2. Kode lengkap per file, lalu hasil npm run build, npm run lint, npm test.
```

## Catatan

- Aku salah memetakan `wooden_plate.glb` sebagai model fitur di prompt sebelumnya. Revisi ini memperbaikinya.
- Caption nama fitur di bawah plate adalah satu-satunya tambahan di luar permintaanmu, agar pengunjung tahu arti tiap model. Cukup ubah `SHOW_CAPTION` ke `false` kalau tidak mau.
- Pin dan scroll-switch kuhapus dulu agar sederhana sesuai "seperti itu dulu". Bisa ditambah lagi setelah panggungnya terasa pas.
