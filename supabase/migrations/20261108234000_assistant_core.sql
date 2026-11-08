-- ====================================================================
-- Migrasi: 20261108234000_assistant_core.sql
-- Modul: Juru Mudi Core (seats_left, create_booking, cache, rate-limit)
-- ====================================================================

-- 1. Tabel weather_cache (cache prakiraan cuaca maritim & darat)
CREATE TABLE IF NOT EXISTS public.weather_cache (
  key text PRIMARY KEY,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

-- Aktifkan RLS tanpa policy (hanya service_role yang memiliki akses bypass RLS)
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- 2. Tabel rate_limits (pencatatan frekuensi panggilan per jendela waktu)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

-- Aktifkan RLS tanpa policy (hanya service_role yang memiliki akses bypass RLS)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 3. Fungsi hit_rate_limit
-- Menghitung kuota panggilan per jendela waktu (window_seconds)
CREATE OR REPLACE FUNCTION public.hit_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_limit integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_count integer;
BEGIN
  -- Pembulatan waktu awal jendela berdasarkan epoch
  v_window_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, v_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count <= p_limit;
END;
$$;

-- Hak akses: hanya service_role
REVOKE ALL ON FUNCTION public.hit_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(text, integer, integer) TO service_role;

-- 4. Fungsi seats_left
-- Menghitung sisa kursi pada kapal, tanggal, dan jam tertentu
CREATE OR REPLACE FUNCTION public.seats_left(
  p_boat_id uuid,
  p_date date,
  p_time time
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity integer;
  v_booked integer;
BEGIN
  SELECT capacity INTO v_capacity
  FROM public.boats
  WHERE id = p_boat_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(passengers), 0) INTO v_booked
  FROM public.bookings
  WHERE boat_id = p_boat_id
    AND booking_date = p_date
    AND departure_time = p_time
    AND booking_status IN ('pending', 'confirmed');

  RETURN GREATEST(v_capacity - v_booked, 0);
END;
$$;

-- Hak akses: anon dan authenticated dapat mengecek ketersediaan kursi
REVOKE ALL ON FUNCTION public.seats_left(uuid, date, time) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seats_left(uuid, date, time) TO anon, authenticated, service_role;

-- 5. Fungsi create_booking
-- Transaksi pemesanan kapal dengan penguncian baris (FOR UPDATE), validasi kapasitas & tanggal
CREATE OR REPLACE FUNCTION public.create_booking(
  p_boat_id uuid,
  p_date date,
  p_time time,
  p_passengers integer,
  p_notes text DEFAULT NULL
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_boat public.boats%ROWTYPE;
  v_today date;
  v_booked_seats integer;
  v_available_seats integer;
  v_total_price integer;
  v_booking public.bookings%ROWTYPE;
BEGIN
  -- 1. Validasi Autentikasi User
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- 2. Mengunci baris kapal dan verifikasi ketersediaan (available)
  SELECT * INTO v_boat
  FROM public.boats
  WHERE id = p_boat_id
  FOR UPDATE;

  IF NOT FOUND OR v_boat.available IS NOT TRUE THEN
    RAISE EXCEPTION 'boat_unavailable';
  END IF;

  -- 3. Validasi tanggal tidak boleh lampau menurut zona waktu Asia/Jakarta
  v_today := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  IF p_date < v_today THEN
    RAISE EXCEPTION 'date_in_past';
  END IF;

  -- 4. Validasi jumlah penumpang per pemesanan
  IF p_passengers < 1 OR p_passengers > v_boat.capacity THEN
    RAISE EXCEPTION 'invalid_passengers';
  END IF;

  -- 5. Validasi ketersediaan kursi
  SELECT COALESCE(SUM(passengers), 0) INTO v_booked_seats
  FROM public.bookings
  WHERE boat_id = p_boat_id
    AND booking_date = p_date
    AND departure_time = p_time
    AND booking_status IN ('pending', 'confirmed');

  v_available_seats := v_boat.capacity - v_booked_seats;
  IF p_passengers > v_available_seats THEN
    RAISE EXCEPTION 'not_enough_seats';
  END IF;

  -- 6. Perhitungan total harga
  v_total_price := v_boat.base_price * p_passengers;

  -- 7. Simpan data pemesanan
  INSERT INTO public.bookings (
    user_id,
    boat_id,
    booking_date,
    departure_time,
    passengers,
    total_price,
    booking_status,
    payment_status,
    notes
  ) VALUES (
    v_user_id,
    p_boat_id,
    p_date,
    p_time,
    p_passengers,
    v_total_price,
    'pending',
    'pending',
    p_notes
  )
  RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

-- Hak akses: hanya authenticated user
REVOKE ALL ON FUNCTION public.create_booking(uuid, date, time, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking(uuid, date, time, integer, text) TO authenticated, service_role;
