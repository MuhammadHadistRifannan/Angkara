# Pedoman AI Agent — Proyek Angkara (Juru Mudi)

Dokumen ini memuat aturan operasional dan batasan global bagi agen AI yang bekerja pada proyek ini.

## Aturan Kerja Agen
1. **Satu Task Per Sesi**: Kerjakan **hanya satu task** per sesi dari rencana kerja (`2026-11-08-juru-mudi.md`). Jangan melompat atau mengerjakan task lain.
2. **Lingkup Berkas Terbatas**: Jangan mengubah atau membuat berkas di luar daftar berkas yang ditentukan untuk task yang sedang dikerjakan.
3. **Disiplin TDD**: Selalu ikuti alur Red-Green-Refactor. Tulis tes yang gagal terlebih dahulu, verifikasi kegagalannya dengan `npm test`, lalu implementasikan kode hingga tes lulus.
4. **Verifikasi Kualitas**: Setelah task selesai, selalu pastikan:
   - `npm test` lulus (PASS).
   - `npm run build` berhasil tanpa error.
   - `npm run lint` tidak memunculkan error baru.
   - Gunakan CLI proxy `rtk` (misal: `rtk npm test`, `rtk git status`) untuk menghemat konsumsi token.

## Ringkasan Global Constraints
1. **Stack Nyata**: Proyek menggunakan Vite + React 18 + TypeScript + Supabase. Jangan terpengaruh deskripsi README lama (Next.js/ASP.NET/MySQL).
2. **Keamanan Kredensial**: Tidak ada API key di repo atau sisi klien. `GEMINI_API_KEY` hanya disimpan di Supabase secrets. Berkas `.env` tidak boleh di-track oleh git.
3. **Batas Akses LLM**: LLM tidak pernah menulis ke database secara langsung. Kartu UI dibuat dari data terstruktur hasil pemanggilan tool (zod schema), bukan dari teks bebas LLM. Pembuatan booking hanya dilakukan melalui RPC `create_booking` yang dipanggil klien dengan JWT sesi user.
4. **Mesin Keselamatan Deterministik**: Verdict keselamatan dihitung murni oleh `rules.ts` (mengacu pada `thresholds.json`). Ambang konservatif perahu nelayan untuk `speedboat` dan `kapal_kayu`: angin 15 knot, gelombang 1,25 m. Status `tunda` bila melebihi batas, ada petir, atau hujan lebat ekstrem. Status `waspada` bila ≥ 80% batas atau hujan ≥ 5 mm/jam. Selain itu `aman`. Bila data gelombang `null` (`unavailable`), verdict maksimal `waspada` dan **tidak pernah `aman`**.
5. **Standar Satuan**: Gelombang dalam meter (m), kecepatan angin dalam knot (km/jam ÷ 1,852), curah hujan dalam mm/jam.
6. **Zona Waktu & Jendela Keberangkatan**: Semua perbandingan tanggal dan jam wajib menggunakan zona waktu `Asia/Jakarta` (WIB). Jendela keberangkatan teraman dinilai pada rentang jam 07.00–15.00 WIB (sampel jam 7 hingga 15 inklusif).
7. **Integritas Git & Riwayat Commit**: Riwayat commit tidak boleh dihapus atau di-force push (kepatuhan aturan kompetisi). Buat commit terpisah yang rapi per task.
8. **Verifikasi Data Eksternal**: Setiap integrasi API eksternal (BMKG, Open-Meteo, kode wilayah `adm4`) harus diverifikasi dengan pemanggilan nyata dan disimpan sebagai fixture uji; dilarang berasumsi atau menebak format field.

## Cara Menjalankan Tes & Tooling
- **Menjalankan Unit Test**: `npm test` (menjalankan vitest pada `src/**/*.test.ts` dan `supabase/functions/**/*.test.ts`)
- **Menjalankan Build**: `npm run build`
- **Menjalankan Linter**: `npm run lint`
