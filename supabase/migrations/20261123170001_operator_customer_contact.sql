-- O5-CUSTOMER-CONTACT-SUAR-2026-11-23
-- Biar operator bisa chat wisatawan yang booking kapalnya (Batch O5).
-- Nomor HP wisatawan selama ini hanya tersimpan di metadata akun (auth.users),
-- yang tidak bisa dibaca operator. profiles.phone selama ini kosong karena
-- handle_new_user hanya menyalin nama. Migrasi ini:
-- 1) menyalin nomor HP yang sudah diisi wisatawan ke profiles.phone;
-- 2) memberi izin baca ke operator untuk wisatawan yang punya booking di kapalnya.
-- (Ke depan, halaman profil wisatawan juga menyimpan nomornya ke profiles.phone
-- supaya tetap sinkron - lihat src/pages/Dashboard.tsx.)

-- 1. Salin nomor HP dari metadata akun ke profiles.phone (hanya yang masih kosong).
UPDATE public.profiles p
SET phone = u.raw_user_meta_data->>'phone'
FROM auth.users u
WHERE p.id = u.id
  AND (p.phone IS NULL OR p.phone = '')
  AND NULLIF(u.raw_user_meta_data->>'phone', '') IS NOT NULL;

-- 2. Operator boleh membaca nama + nomor HP wisatawan yang booking kapalnya.
CREATE POLICY "Operators can view customer contact"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.bookings b
      JOIN public.boats bo ON bo.id = b.boat_id
      JOIN public.operators o ON o.id = bo.operator_id
      WHERE b.user_id = profiles.id
        AND o.user_id = auth.uid()
    )
  );