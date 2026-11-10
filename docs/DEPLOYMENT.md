# Panduan Deployment & Pipeline CI/CD

Dokumen ini mendokumentasikan arsitektur pipeline CI/CD proyek Angkara ke Netlify melalui GitHub Actions.

---

## 1. Diagram Alur Pipeline (Text Diagram)

```
[ Push ke branch non-main / Pull Request ]
                   │
                   ▼
       .github/workflows/ci.yml
                   │
                   ▼
       .github/workflows/_verify.yml
       ├── 1. Checkout (actions/checkout@v4)
       ├── 2. Setup Node.js 22 & cache npm
       ├── 3. npm ci
       ├── 4. npm run typecheck (BLOKIR)
       ├── 5. npm test (BLOKIR)
       ├── 6. npm run build (BLOKIR, env: vars.*)
       └── 7. npm run lint (HANYA LAPORAN / continue-on-error: true)
                   │
       [ Jika lolos pada Pull Request (same repo) ]
                   │
                   ▼
       .github/workflows/preview.yml
       ├── 1. Verify ulang (_verify.yml)
       ├── 2. netlify deploy --alias=pr-<no> --json
       └── 3. Buat / update komentar PR dengan URL preview

─────────────────────────────────────────────────────────────

[ Push / Merge ke branch main / Workflow Dispatch ]
                   │
                   ▼
       .github/workflows/deploy.yml
                   │
                   ├─► Job 1: verify (_verify.yml)
                   │          └── Typecheck + Test + Build + Lint
                   │
                   ▼ (setelah verify sukses)
       Job 2: deploy (environment: production)
       ├── 1. npm ci & npm run build
       ├── 2. netlify deploy --prod --no-build --message "$GITHUB_SHA"
       └── 3. Smoke Test (Curl root 200 + id="root", Curl /dashboard 200)
              └── Retry 3x, jeda 10 detik
```

---

## 2. Daftar Repository Variables dan Secrets

Semua proses build dan deployment dikonfigurasi melalui GitHub Repository Settings (`Settings > Secrets and variables > Actions`).

### A. Repository Variables (`vars.*`)
Digunakan pada tahap build dan testing publik (dapat diakses aman oleh workflow verifikasi dan PR):
- `VITE_SUPABASE_URL`
  URL instance Supabase proyek (contoh: `https://<project-ref>.supabase.co`).
- `VITE_SUPABASE_PUBLISHABLE_KEY`
  Supabase publishable anon key (`sb_publishable_...`).

> **PENTING:** Job `verify` pada `_verify.yml` **hanya** menggunakan `vars.*` dan tidak memerlukan secret apa pun, sehingga pull request dari kolaborator / fork tetap dapat menjalankan verifikasi kualitas kode secara otomatis.

### B. Repository Secrets (`secrets.*`)
Digunakan secara eksklusif pada job deploy produksi dan deploy preview:
- `NETLIFY_AUTH_TOKEN`
  Personal access token Netlify untuk autentikasi CLI.
- `NETLIFY_SITE_ID`
  ID situs Netlify target (API ID pada Project Settings di Netlify).

> **CATATAN KEAMANAN:** Kunci privat seperti `GEMINI_API_KEY` atau `SUPABASE_SECRET_KEY` **TIDAK PERNAH** disimpan di GitHub Actions maupun repository. Kunci tersebut hanya berada di Supabase Edge Function Secrets.

---

## 3. Prosedur Rollback

Jika terjadi insiden pada versi produksi yang telah dirilis:
1. Masuk ke dashboard [Netlify](https://app.netlify.com).
2. Buka situs proyek **Angkara**.
3. Navigasikan ke tab **Deploys**.
4. Cari riwayat deployment stabil sebelumnya yang ingin dipulihkan.
5. Klik pada entri deployment tersebut, lalu tekan tombol **Publish deploy**.
6. Netlify akan secara instan mengarahkan seluruh lalu lintas produksi ke versi tersebut dalam hitungan detik tanpa perlu melakukan rebuild di GitHub Actions.

---

## 4. Masalah Umum & Solusi (Troubleshooting)

### A. 404 Saat Refresh pada Halaman Selain Home (`/dashboard`, `/booking`)
- **Penyebab:** Konfigurasi SPA fallback belum terbaca oleh Netlify.
- **Solusi:** Pastikan file `public/_redirects` berisi baris `/* /index.html 200` dan disalin ke direktori `dist/` saat `npm run build`.

### B. Smoke Test Gagal pada Step Post-Deploy
- **Penyebab:** DNS atau CDN Netlify membutuhkan jeda beberapa detik untuk propagasi rilis baru, atau elemen `#root` tidak ditemukan di HTML.
- **Solusi:** Workflow secara otomatis melakukan retry hingga 3x dengan jeda 10 detik. Jika tetap gagal, periksa apakah bundle HTML `index.html` menyertakan elemen `<div id="root"></div>`.

### C. Gagal Autentikasi Netlify CLI (`UNAUTHORIZED`)
- **Penyebab:** `NETLIFY_AUTH_TOKEN` telah kedaluwarsa atau tidak valid.
- **Solusi:** Generate token baru di Netlify (`User Settings > Applications > Personal access tokens`) dan perbarui nilai secret di GitHub Repository Secrets.

### D. Galat Lint Meloloskan Pipeline
- **Karakteristik:** Step `Lint check (Report only)` pada `_verify.yml` sengaja diberi `continue-on-error: true`.
- **Alasan:** Repository memiliki baseline 16 galat warisan pada komponen bawaan lama yang tidak menghalangi runtime produksi. Langkah ini memunculkan log diagnostik tanpa menggagalkan proses build.
