-- Migrasi Seed Demo Kapal dan Booking (Task 11)
-- Memastikan ketersediaan kapal aktif (total >= 8) di kedua titik berangkat (Teluk Penyu & Pelabuhan Tanjung Intan),
-- kapal non-aktif untuk pengujian, serta data booking sampel berbasis zona waktu Asia/Jakarta.
-- Idempoten: aman dieksekusi berulang kali tanpa duplikasi.

DO $$
BEGIN
  -- Pastikan operator tersedia sebelum memasukkan kapal
  IF (SELECT count(*) FROM public.operators) = 0 THEN
    RAISE NOTICE 'Seed kapal dilewati: belum ada operator terdaftar di tabel operators. Harap buat operator terlebih dahulu.';
    RETURN;
  END IF;

  -- 1. Tambahkan kapal baru jika belum ada berdasarkan nama kapal
  INSERT INTO public.boats (name, description, type, capacity, base_price, location, operator_id, features, available, min_passengers)
  SELECT 
    b.name,
    b.description,
    b.type,
    b.capacity,
    b.base_price,
    b.location,
    COALESCE(o.id, fallback_op.id),
    b.features,
    b.available,
    b.min_passengers
  FROM (
    VALUES
      ('Speedboat Camar Laut', 'Speedboat lincah untuk trip cepat ke Nusakambangan dan perairan Teluk Penyu', 'speedboat'::boat_type, 8, 55000, 'Teluk Penyu', 'CV Samudra Jaya', ARRAY['Life Jacket', 'GPS Tracker', 'First Aid'], true, 2),
      ('Kapal Kayu Segara Anakan', 'Perahu kayu tradisional untuk jelajah mangrove dan wisata pesisir', 'kapal_kayu'::boat_type, 15, 30000, 'Pelabuhan Tanjung Intan', 'UD Bahari Sejahtera', ARRAY['Life Jacket', 'Kanopi', 'Toilet'], true, 5),
      ('Speedboat Samudra Kilat', 'Speedboat bertenaga tinggi untuk perjalanan efisien', 'speedboat'::boat_type, 12, 60000, 'Teluk Penyu', 'PT Cilacap Marine Tour', ARRAY['Life Jacket', 'GPS Tracker', 'Radio VHF', 'Kanopi'], true, 4),
      ('Kapal Kayu Baruna Wisata', 'Perahu kayu lapang cocok untuk rombongan santai keluarga', 'kapal_kayu'::boat_type, 20, 35000, 'Pelabuhan Tanjung Intan', 'UD Bahari Sejahtera', ARRAY['Life Jacket', 'Kanopi', 'Sound System', 'Coolbox'], true, 6),
      ('Speedboat Albatros', 'Kapal cepat berkapasitas sedang dengan kenyamanan kabin terbuka', 'speedboat'::boat_type, 10, 50000, 'Pelabuhan Tanjung Intan', 'CV Samudra Jaya', ARRAY['Life Jacket', 'First Aid', 'Kanopi'], true, 3),
      ('Speedboat Lumba-Lumba', 'Speedboat cepat untuk patroli dan carter (sementara proses pemeliharaan rutin)', 'speedboat'::boat_type, 6, 45000, 'Teluk Penyu', 'PT Cilacap Marine Tour', ARRAY['Life Jacket', 'Radio'], false, 2),
      ('Kapal Kayu Samudra Asri', 'Kapal kayu wisata (sementara dalam jadwal docking tahunan)', 'kapal_kayu'::boat_type, 25, 30000, 'Pelabuhan Tanjung Intan', 'CV Samudra Jaya', ARRAY['Life Jacket', 'Kanopi'], false, 5)
  ) AS b(name, description, type, capacity, base_price, location, operator_name, features, available, min_passengers)
  LEFT JOIN public.operators o ON o.company_name = b.operator_name
  CROSS JOIN (SELECT id FROM public.operators ORDER BY created_at ASC LIMIT 1) AS fallback_op
  WHERE NOT EXISTS (
    SELECT 1 FROM public.boats existing WHERE existing.name = b.name
  );
END $$;

-- 2. Tambahkan data booking sampel (Hanya bila terdapat user di auth.users)
DO $$
DECLARE
  v_demo_user_id uuid;
  v_today date;
  v_camar_id uuid;
  v_segara_id uuid;
  v_baruna_id uuid;
BEGIN
  SELECT id INTO v_demo_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF v_demo_user_id IS NULL THEN
    RAISE NOTICE 'Demo bookings dilewati: tidak ada pengguna terdaftar di auth.users. Buat pengguna manual terlebih dahulu.';
    RETURN;
  END IF;

  v_today := (now() AT TIME ZONE 'Asia/Jakarta')::date;

  SELECT id INTO v_camar_id FROM public.boats WHERE name = 'Speedboat Camar Laut' LIMIT 1;
  SELECT id INTO v_segara_id FROM public.boats WHERE name = 'Kapal Kayu Segara Anakan' LIMIT 1;
  SELECT id INTO v_baruna_id FROM public.boats WHERE name = 'Kapal Kayu Baruna Wisata' LIMIT 1;

  -- Booking hari ini (v_today) menurut WIB: Kapal Kayu Segara Anakan
  IF v_segara_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.bookings WHERE boat_id = v_segara_id AND booking_date = v_today AND departure_time = '09:00:00'
  ) THEN
    INSERT INTO public.bookings (user_id, boat_id, booking_date, departure_time, passengers, total_price, booking_status, payment_status, notes)
    VALUES (v_demo_user_id, v_segara_id, v_today, '09:00:00', 4, 4 * 30000, 'confirmed', 'fully_paid', 'Wisata keluarga pagi hari');
  END IF;

  -- Booking H+1 (v_today + 1): Kapal kecil hampir penuh (Camar Laut kapasitas 8, terisi 7) untuk uji not_enough_seats
  IF v_camar_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.bookings WHERE boat_id = v_camar_id AND booking_date = (v_today + 1) AND departure_time = '09:00:00'
  ) THEN
    INSERT INTO public.bookings (user_id, boat_id, booking_date, departure_time, passengers, total_price, booking_status, payment_status, notes)
    VALUES (v_demo_user_id, v_camar_id, v_today + 1, '09:00:00', 7, 7 * 55000, 'confirmed', 'fully_paid', 'Rombongan survei pesisir (sisa 1 kursi)');
  END IF;

  -- Booking H+3 (v_today + 3): Kapal Kayu Baruna Wisata
  IF v_baruna_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.bookings WHERE boat_id = v_baruna_id AND booking_date = (v_today + 3) AND departure_time = '10:00:00'
  ) THEN
    INSERT INTO public.bookings (user_id, boat_id, booking_date, departure_time, passengers, total_price, booking_status, payment_status, notes)
    VALUES (v_demo_user_id, v_baruna_id, v_today + 3, '10:00:00', 6, 6 * 35000, 'pending', 'pending', 'Pemesanan trip akhir pekan');
  END IF;

  -- Booking H+7 (v_today + 7): Kapal Kayu Segara Anakan
  IF v_segara_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.bookings WHERE boat_id = v_segara_id AND booking_date = (v_today + 7) AND departure_time = '08:30:00'
  ) THEN
    INSERT INTO public.bookings (user_id, boat_id, booking_date, departure_time, passengers, total_price, booking_status, payment_status, notes)
    VALUES (v_demo_user_id, v_segara_id, v_today + 7, '08:30:00', 5, 5 * 30000, 'confirmed', 'fully_paid', 'Trip eksplorasi mangrove');
  END IF;
END $$;
