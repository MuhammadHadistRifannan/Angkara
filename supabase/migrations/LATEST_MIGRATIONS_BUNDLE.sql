-- Migrasi: Kebijakan RLS untuk Role Admin Platform SUAR
-- Memungkinkan pengguna dengan user_metadata.role = 'admin' mengawasi dan memoderasi platform.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 1. Operators: Admin dapat melihat semua operator (termasuk yang unverified) dan mengubah status verifikasi
CREATE POLICY "Admins can view all operators"
  ON public.operators FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update operator verification"
  ON public.operators FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Boats: Admin dapat melihat semua kapal (termasuk yang tidak available) dan mengubah status ketersediaan
CREATE POLICY "Admins can view all boats"
  ON public.boats FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update boat availability"
  ON public.boats FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Tour Packages: Admin dapat melihat semua paket tour dan mengubah status aktif/nonaktif
CREATE POLICY "Admins can view all tour packages"
  ON public.tour_packages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update tour package availability"
  ON public.tour_packages FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Bookings: Admin dapat melihat seluruh data reservasi di platform
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.is_admin());

-- 5. Reviews: Admin dapat menghapus ulasan yang bermasalah / spam
CREATE POLICY "Admins can delete inappropriate reviews"
  ON public.reviews FOR DELETE
  USING (public.is_admin());
-- Seed Data: Tour Packages dan Sample Reviews untuk Konsol Moderasi Admin

DO $$
DECLARE
  v_op_bahari uuid;
  v_op_marine uuid;
  v_op_samudra uuid;
  v_booking_1 uuid;
  v_user_id uuid;
  v_boat_1 uuid;
BEGIN
  -- Dapatkan ID operator
  SELECT id INTO v_op_bahari FROM public.operators WHERE company_name = 'UD Bahari Sejahtera' LIMIT 1;
  SELECT id INTO v_op_marine FROM public.operators WHERE company_name = 'PT Cilacap Marine Tour' LIMIT 1;
  SELECT id INTO v_op_samudra FROM public.operators WHERE company_name = 'CV Samudra Jaya' LIMIT 1;

  -- 1. Seed Paket Wisata (Tour Packages)
  IF v_op_bahari IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.tour_packages WHERE name = 'Jelajah Mangrove & Laguna Segara Anakan') THEN
    INSERT INTO public.tour_packages (operator_id, name, description, duration_hours, price, includes, max_participants, available)
    VALUES (
      v_op_bahari,
      'Jelajah Mangrove & Laguna Segara Anakan',
      'Trip susur keindahan hutan mangrove rimbun dan perairan tenang Laguna Segara Anakan.',
      2,
      150000,
      ARRAY['Life Jacket Standar SOLAS', 'Pemandu Lokal Berlisensi', 'Air Mineral'],
      12,
      true
    );
  END IF;

  IF v_op_marine IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.tour_packages WHERE name = 'Eksplorasi Karang Bolong & Mercusuar Cimiring') THEN
    INSERT INTO public.tour_packages (operator_id, name, description, duration_hours, price, includes, max_participants, available)
    VALUES (
      v_op_marine,
      'Eksplorasi Karang Bolong & Mercusuar Cimiring',
      'Wisata bahari seru ke tebing karst ikonik Karang Bolong dan mercusuar bersejarah Cimiring di Nusakambangan.',
      3.5,
      250000,
      ARRAY['Life Jacket', 'Asuransi Penyeberangan', 'Snack', 'Tiket Kawasan Cagar Alam'],
      15,
      true
    );
  END IF;

  IF v_op_samudra IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.tour_packages WHERE name = 'Paket Mancing Karang & Teluk Penyu') THEN
    INSERT INTO public.tour_packages (operator_id, name, description, duration_hours, price, includes, max_participants, available)
    VALUES (
      v_op_samudra,
      'Paket Mancing Karang & Teluk Penyu',
      'Petualangan memancing di spot karang potensial Teluk Penyu bersama nelayan lokal berpengalaman.',
      4,
      350000,
      ARRAY['Umpan Segar', 'Coolbox Penyimpanan Ikan', 'Life Jacket', 'Kopi & Teh Hangat'],
      8,
      true
    );
  END IF;

  -- 2. Seed Sample Review untuk Moderasi
  SELECT id, user_id, boat_id INTO v_booking_1, v_user_id, v_boat_1 FROM public.bookings LIMIT 1;
  IF v_booking_1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.reviews WHERE booking_id = v_booking_1) THEN
    INSERT INTO public.reviews (booking_id, user_id, boat_id, rating, safety_rating, service_rating, comment, created_at)
    VALUES (
      v_booking_1,
      v_user_id,
      v_boat_1,
      5,
      5,
      5,
      'Pelayanan nakhoda sangat ramah, jaket pelampung lengkap, dan informasi cuaca dari aplikasi SUAR sangat akurat!',
      NOW() - INTERVAL '1 day'
    );
  END IF;

END $$;
-- Migrasi: Menambahkan kolom boat_id ke tabel tour_packages
-- Memungkinkan operator menetapkan kapal armada tertentu untuk paket tour

ALTER TABLE public.tour_packages
ADD COLUMN IF NOT EXISTS boat_id UUID REFERENCES public.boats(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tour_packages_boat_id ON public.tour_packages(boat_id);
-- Migrasi: Kebijakan RLS agar pengguna operator dapat mengklaim profil operator yang user_id-nya masih NULL
-- Memastikan jika akun operator sebelumnya dibuat via seed atau admin tanpa user_id, 
-- user yang login dengan email yang cocok dapat menautkan user_id mereka secara aman.

CREATE POLICY "Operators can claim unlinked operator profile with matching email"
  ON public.operators FOR UPDATE
  USING (
    user_id IS NULL AND 
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  WITH CHECK (
    auth.uid() = user_id
  );
-- Migrasi: Tabel Pool AI API Key (Gemini Multi-Key & Failover Engine)
-- Mengadaptasi pola arsitektur AI API Key Manager untuk kehandalan Juru Mudi AI.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_key_status') THEN
    CREATE TYPE public.ai_key_status AS ENUM ('ACTIVE', 'INACTIVE', 'DEPLETED', 'ERROR');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ai_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'GOOGLE',
  api_key TEXT NOT NULL,
  base_url TEXT NULL,
  priority INT NOT NULL DEFAULT 0,
  status public.ai_key_status NOT NULL DEFAULT 'ACTIVE',
  tokens_used BIGINT NOT NULL DEFAULT 0,
  tokens_limit BIGINT NULL,
  error_msg TEXT NULL,
  last_used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index performa query rotasi kunci
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_lookup 
  ON public.ai_api_keys (provider, status, priority ASC);

-- Row Level Security (RLS)
ALTER TABLE public.ai_api_keys ENABLE ROW LEVEL SECURITY;

-- 1. Hanya Admin platform yang dapat melihat & mengelola kunci API dari frontend
DROP POLICY IF EXISTS "Admins can view ai_api_keys" ON public.ai_api_keys;
CREATE POLICY "Admins can view ai_api_keys"
  ON public.ai_api_keys FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert ai_api_keys" ON public.ai_api_keys;
CREATE POLICY "Admins can insert ai_api_keys"
  ON public.ai_api_keys FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update ai_api_keys" ON public.ai_api_keys;
CREATE POLICY "Admins can update ai_api_keys"
  ON public.ai_api_keys FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete ai_api_keys" ON public.ai_api_keys;
CREATE POLICY "Admins can delete ai_api_keys"
  ON public.ai_api_keys FOR DELETE
  USING (public.is_admin());
