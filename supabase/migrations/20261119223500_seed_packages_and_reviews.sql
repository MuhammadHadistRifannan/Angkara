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
