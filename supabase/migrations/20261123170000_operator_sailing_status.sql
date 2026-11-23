-- O4-SAILING-STATUS-SUAR-2026-11-23
-- Status berlayar harian yang diisi operator tiap pagi (Batch O4).
-- 'auto' = ikut cuaca otomatis (Open-Meteo); selain itu status manual operator yang dipakai
-- untuk kapal-kapalnya. Kolom ini ditambahkan ke tabel operators supaya tidak perlu
-- tabel baru; operator sudah bisa mengubah baris operators miliknya sendiri
-- (dipakai form profil), jadi tidak perlu kebijakan RLS baru.
ALTER TABLE public.operators
  ADD COLUMN IF NOT EXISTS sailing_status text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS sailing_status_note text,
  ADD COLUMN IF NOT EXISTS sailing_status_updated_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'operators_sailing_status_check'
  ) THEN
    ALTER TABLE public.operators
      ADD CONSTRAINT operators_sailing_status_check
      CHECK (sailing_status IN ('auto', 'aman', 'waspada', 'tunda'));
  END IF;
END $$;
