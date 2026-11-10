# 🛥️ ANGKARA Web App

**Platform Digital Angkutan Segara – Solusi Cerdas Ekonomi Laut Nusantara**
*“Menghubungkan laut, nelayan, dan wisatawan dalam satu gerakan.”*

[![CI](https://github.com/MuhammadHadistRifannan/Angkara/actions/workflows/ci.yml/badge.svg)](https://github.com/MuhammadHadistRifannan/Angkara/actions/workflows/ci.yml)
[![Deploy](https://github.com/MuhammadHadistRifannan/Angkara/actions/workflows/deploy.yml/badge.svg)](https://github.com/MuhammadHadistRifannan/Angkara/actions/workflows/deploy.yml)

---

## 📝 Deskripsi Singkat

**ANGKARA (Angkutan Segara)** adalah aplikasi web yang dirancang untuk menghubungkan wisatawan, nelayan, dan operator kapal dalam satu sistem digital terpadu. Melalui platform ini, pengguna dapat melakukan pemesanan kapal wisata, penyewaan kapal mancing, atau sewa kapal nelayan secara **mudah, aman, dan transparan**.

---

## 🧰 Tech Stack

### Backend

* **ASP .Net** — API
* **MySQL** — Database

### Frontend

* **Next.js** — Web Framework
* **Tailwind CSS** — Styling

---

## ⚙️ Cara Menjalankan Project

### 1️⃣ Clone Repository

```bash
git clone https://github.com/MuhammadHadistRifannan/AngkaraWebApp.git
cd AngkaraWebApp
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Jalankan Project

```bash
npm run dev
```

Lalu buka di browser: [http://localhost:5173](http://localhost:5173)

**Backend Repository:**
👉 [https://github.com/MuhammadHadistRifannan/AngkaraBE.git](https://github.com/MuhammadHadistRifannan/AngkaraBE.git)

---

## 🧩 Fitur Utama

- ⚓ **Listing Terverifikasi**
Semua operator kapal terdaftar dan diverifikasi KSOP dengan dokumen izin lengkap.

- 📅 **Kalender Booking Otomatis**
Sistem minimal penumpang otomatis dan opsi sharing trip untuk efisiensi maksimal.

- 💰 **Kalkulator Tarif Transparan**
Estimasi biaya dengan rincian jelas – tanpa biaya tersembunyi.

- 🪪 **Informasi Izin KSOP**
Panduan dan checklist izin untuk setiap rute perjalanan.

- 🌤️ **Peringatan Cuaca BMKG**
Data cuaca laut real-time dengan notifikasi keselamatan otomatis.

- 💳 **Pembayaran Online Aman**
Sistem DP 30% via e-wallet dengan escrow system agar transaksi lebih aman.

- ⭐ **Rating & Review Terverifikasi**
Ulasan pasca-perjalanan yang dikonfirmasi dengan GPS dan foto nyata.

- 🏝️ **Paket Wisata Fleksibel**
Pilihan trip siap pakai seperti keliling Nusakambangan, sunset tour, atau edukasi bahari.

- 📊 **Dashboard Analitik**
Laporan lengkap aktivitas kapal, data wisatawan, dan pendapatan operator untuk transparansi dan evaluasi pemerintah.

---

## 🚀 Progres Saat Ini

* ✅ Sudah terdapat **landing page** dengan informasi proyek dan layanan
* ✅ Fitur **booking kapal** dasar sudah berjalan
* ✅ Tampilan **dashboard operator** dan **pencarian kapal**
* 🚧 Tahap berikutnya: optimasi sistem pembayaran dan notifikasi cuaca BMKG
* 🚧 Tahap berikutnya: integrasi dengan backend api asp .net
* 🚧 Tahap berikutnya: mengembangkan fitur chat realtime dengan integrasi ai


---

## 🧱 Struktur Folder

```
seabook-web/
│
├── public/             # File publik (logo, ikon, manifest)
├── src/
│   ├── assets/         # Gambar, ikon, font
│   ├── components/     # Komponen UI (Navbar, Footer, Card, dsb)
│   ├── pages/          # Halaman utama (Home, Booking, About, Login)
│   ├── services/       # API & konfigurasi data
│   ├── context/        # Context Provider (Auth, Booking, Theme)
│   ├── hooks/          # Custom hooks (useFetch, useAuth)
│   ├── styles/         # Tailwind / CSS
│   └── utils/          # Helper functions
│
├── docs/               # Dokumentasi proyek
│   ├── proposal.pdf
│   └── desain-ui/
│
├── .env.example        # Contoh konfigurasi environment
├── .gitignore
├── package.json
├── README.md
└── vite.config.js / next.config.js
```

---

## 🌊 Tentang Proyek

Dikembangkan oleh **mahasiswa pesisir Cilacap**, proyek ini lahir dari semangat untuk **memajukan industri maritim lokal melalui teknologi yang berakar pada budaya pesisir**.
Nama *Angkutan Segara* bermakna penghubung laut — simbol dari rezeki yang mengalir, gotong royong, dan semangat maju bersama masyarakat nelayan.

---
