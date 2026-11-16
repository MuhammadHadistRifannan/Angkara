# Angkara: Prompt Hero Section (untuk Gemini + UI UX taste + scrollcraft)

Tempel setelah blok "Gaya Kerja". Prompt ini hanya untuk **hero section**. Section lain dikerjakan di sesi berikutnya.

```
TUGAS SESI INI: HANYA HERO SECTION landing page "/" Angkara. Jangan mengerjakan section lain. Gunakan UI UX taste skill dan scrollcraft skill.

ASET (sudah ada, jangan tanya lagi)
- public/hero/hero.mp4 (H.264, tanpa audio, 1280x720, 10 dtk, ±1.4 MB)
- public/hero/hero.webm (VP9, tanpa audio)
- public/hero/poster.webp (frame pertama, 1920px)
- Isi video: kapal nelayan di laut lepas, camar beterbangan, langit biru keabuan. Kapal berada di tengah-bawah frame (sekitar 55-85% tinggi), garis horizon sekitar 70%.
- Gambar referensi navbar: pill kaca gelap dengan 5 ikon, indikator aktif berupa lingkaran biru bercahaya.

CERITA YANG DIINGINKAN
1. Saat halaman pertama dibuka: layar penuh hanya berisi video kapal. Tanpa navbar, tanpa teks. Hanya petunjuk "Gulir" yang sangat kecil dan halus di bawah tengah.
2. Saat user scroll perlahan: judul muncul di tengah video dengan fade-in disertai typing animation.
3. Lanjut scroll: navbar muncul bouncing dari tengah ke tepi (atas) dengan gaya liquid glass.
4. Hover pada tombol navbar: highlight kaca bergeser mengikuti tombol yang di-hover.

SPESIFIKASI

A. Struktur & scroll (scrollcraft)
- Wrapper tinggi 250vh, di dalamnya elemen sticky top-0 h-[100svh]. Gunakan satu sumber progres scroll (0-1) untuk semua animasi hero.
- Progres 0.00-0.06: hanya video (idle). Video pelan membesar scale 1 -> 1.08 sepanjang hero.
- Progres 0.06-0.12: overlay gradasi gelap muncul (hingga ±35%) agar teks putih lolos kontras AA di atas langit yang terang; petunjuk "Gulir" memudar.
- Progres 0.12: memicu typing judul (berbasis pemicu, BUKAN dikaitkan ke posisi scroll). Jika user scroll balik ke bawah ambang 0.08, judul memudar dan reset.
- Progres 0.30-0.45: navbar muncul (lihat C).
- Setelah 1.0: hero lepas dan section berikutnya (yang sudah ada) lanjut normal.

B. Judul & tipografi
- Posisi: tengah horizontal, vertikal di sekitar 30-38% tinggi layar (area LANGIT), supaya TIDAK menutupi kapal di tengah-bawah. Jangan taruh teks tepat di atas kapal.
- Teks: baris 1 "Berlayar lebih tenang." baris 2 "Cuaca sudah dihitung." Baris 2 diketik setelah baris 1 selesai.
- Typing: 40-50 ms per karakter, kursor tipis berkedip yang hilang 1.2 dtk setelah selesai. Fade-in 600 ms dengan blur 8px -> 0 dan naik 12px -> 0.
- Cegah layout shift: render teks penuh tak terlihat (visibility hidden) sebagai pengisi ruang, lalu timpa teks yang sedang diketik di posisi yang sama. Beri aria-label berisi teks penuh dan aria-hidden pada teks animasi.
- Font: satu display sans modern profesional (pilih salah satu: Geist, Plus Jakarta Sans, atau Inter Tight; muat lewat @fontsource atau font lokal, font-display: swap). Ukuran clamp(2.5rem, 7vw, 6rem), weight 600, tracking -0.03em, leading 1.05, warna putih, text-shadow sangat halus.

C. Navbar liquid glass (komponen baru src/components/landing/LiquidNav.tsx; JANGAN ubah src/components/Navbar.tsx karena dipakai 7 halaman lain)
- Bentuk: pill dengan ikon (lucide-react), seperti gambar referensi. Item: Beranda (Home), Kapal (Ship), Cuaca & Peta (CloudSun), Juru Mudi (Bot), Masuk/Dashboard (User). Tautan ke rute yang sudah ada: "/", "/boats", bagian peta, pembuka AssistantWidget, "/auth" atau "/dashboard". Pertahankan logika sesi Supabase yang sama dengan Navbar lama untuk item terakhir.
- Muncul: mulai dari pusat layar (scale 0.55, opacity 0, kecil seperti kapsul), lalu meluncur ke tepi atas (top: 20px + safe-area) sambil melebar ke ukuran akhir (maks 560px desktop, 92vw mobile). Pakai spring bouncy ala Apple: stiffness 300, damping 22, mass 0.9 (overshoot kecil ±6%). Item di dalamnya muncul bertahap, stagger 50 ms.
- Bahan kaca: background rgba(255,255,255,0.10-0.14), backdrop-filter: blur(20px) saturate(180%), border 1px rgba(255,255,255,0.28), inset highlight 0 1px 0 rgba(255,255,255,0.5), shadow 0 8px 32px rgba(0,0,0,0.25), pantulan cahaya diagonal tipis (gradient overlay). Opsional di Chromium: refraksi tepi dengan SVG feDisplacementMap; wajib ada fallback blur biasa untuk Safari/Firefox.
- Hover "geser seperti kaca": satu elemen highlight kaca (lingkaran/kapsul bercahaya biru-laut) yang BERPINDAH mulus ke tombol yang sedang di-hover memakai layoutId (framer-motion) atau FLIP, spring stiffness 380 damping 28. Saat mouse meninggalkan navbar, highlight kembali ke item aktif. Label teks item muncul sebagai tooltip kaca kecil (atau melebar di dalam highlight) saat hover/fokus.
- Keyboard: semua item bisa di-tab; fokus menampilkan highlight yang sama; tombol Enter/Spasi berfungsi. Ukuran tap minimal 44px.
- Mobile: tetap pill ikon di atas, tanpa tooltip hover; item aktif menampilkan label di dalam highlight.

D. Video
- <video autoPlay muted loop playsInline preload="auto" poster="/hero/poster.webp"> dengan source mp4 dan webm, object-cover, object-position: 50% 65% (jaga kapal tetap terlihat di layar potret).
- Awal dan akhir klip berbeda (kamera bergeser), sehingga loop akan terlihat "lompat". Tangani dengan crossfade 600 ms antara dua elemen video yang saling bergantian, atau putar sekali lalu tahan frame terakhir. Pilih yang paling stabil dan jelaskan alasannya.
- Resolusi sumber 720p, jadi jangan beri filter yang memperlihatkan kabur. Tambahkan lapisan noise/grain sangat tipis (opacity 0.04) untuk menyamarkan upscaling.
- prefers-reduced-motion atau navigator.connection.saveData: tampilkan poster saja (tanpa video), teks judul tampil langsung tanpa typing, navbar langsung di posisi akhir tanpa bounce, tanpa scale/parallax.

E. Performa & kualitas
- Hanya animasi transform, opacity, filter. Tidak ada layout thrash. LCP < 2.5 dtk di Lighthouse mobile (poster dimuat dengan fetchpriority=high).
- Satu library animasi saja (ikuti rekomendasi scrollcraft; jika GSAP, jangan campur framer-motion).
- Hapus kotak pencarian dan statistik palsu ("50+ kapal", "4.8/5") dari Hero lama. Hero baru hanya berisi video, judul, petunjuk gulir, dan navbar.
- Rubber-band iOS bawaan Safari jangan dimatikan (jangan set overscroll-behavior: none pada body). Tidak perlu meniru efek ini di desktop.

BATAS LINGKUP
- Boleh: src/pages/Index.tsx, src/components/Hero.tsx, src/components/landing/* (baru), src/index.css, tailwind.config.ts, public/hero/*.
- Jangan sentuh: Navbar.tsx, Supabase, assistant, booking, test yang ada.
- Tambahkan test unit untuk fungsi murni (mis. pemetaan progres -> status animasi, logika typing).
- Verifikasi: npm run build, npm run lint, npm test.

KELUARAN
1. Storyboard hero dalam tabel (progres, elemen, animasi, easing/spring) dan daftar file, tunggu persetujuan saya.
2. Setelah disetujui: kode lengkap per file.
3. Catatan singkat keputusan desain + penggunaan AI untuk README/proposal.
```

## Catatan untukmu

- **Penafsiran navbar.** Kalimat "bouncing dari tengah ke tepi" saya terjemahkan sebagai: kapsul kecil muncul di tengah layar lalu meluncur ke tepi atas sambil melebar dengan spring bouncy. Kalau maksudmu hanya melebar ke kiri-kanan di posisi atas, ubah bagian C di prompt.
- **Kapal tertutup teks.** Kapal ada di tengah-bawah frame, jadi judul sengaja ditaruh di area langit (30–38% dari atas), bukan di tengah persis.
- **Video.** File asli punya trek audio dan berformat WebM saja. Versi di folder `hero/` sudah tanpa audio dan tersedia MP4 untuk Safari/iOS. Letakkan semuanya di `public/hero/`.
