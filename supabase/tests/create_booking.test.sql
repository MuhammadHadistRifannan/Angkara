BEGIN;

-- Setup pgTAP extension
CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(12);

-- Setup test data
DO $$
DECLARE
  v_user_a uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_user_b uuid := '22222222-2222-2222-2222-222222222222'::uuid;
BEGIN
  -- Insert dummy test users into auth.users if not present
  INSERT INTO auth.users (id, email)
  VALUES 
    (v_user_a, 'usera@test.com'),
    (v_user_b, 'userb@test.com')
  ON CONFLICT (id) DO NOTHING;

  -- Insert dummy profiles
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES 
    (v_user_a, 'User A', '0811111111'),
    (v_user_b, 'User B', '0822222222')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Setup test operator and test boats
DO $$
DECLARE
  v_op_id uuid := '33333333-3333-3333-3333-333333333333'::uuid;
  v_boat_active uuid := '44444444-4444-4444-4444-444444444444'::uuid;
  v_boat_inactive uuid := '55555555-5555-5555-5555-555555555555'::uuid;
BEGIN
  INSERT INTO public.operators (id, company_name, phone, email, verified)
  VALUES (v_op_id, 'Test Operator', '08123456789', 'testop@email.com', true)
  ON CONFLICT (id) DO NOTHING;

  -- Kapal aktif dengan kapasitas 35 dan base_price 50000
  INSERT INTO public.boats (id, operator_id, name, type, capacity, base_price, location, available)
  VALUES (v_boat_active, v_op_id, 'Kapal Uji 35', 'speedboat', 35, 50000, 'Teluk Penyu', true)
  ON CONFLICT (id) DO NOTHING;

  -- Kapal tidak aktif / available = false
  INSERT INTO public.boats (id, operator_id, name, type, capacity, base_price, location, available)
  VALUES (v_boat_inactive, v_op_id, 'Kapal Rusak', 'speedboat', 20, 50000, 'Teluk Penyu', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- 1. Test: tanpa login -> not_authenticated
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claim.sub" = '';
SET LOCAL "request.jwt.claims" = '';

SELECT throws_ok(
  format('SELECT public.create_booking(''%s'', ((now() at time zone ''Asia/Jakarta'')::date + interval ''1 day'')::date, ''09:00:00''::time, 2)', '44444444-4444-4444-4444-444444444444'),
  'not_authenticated',
  'create_booking harus melempar not_authenticated jika user belum login'
);

-- Set user A sebagai authenticated
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111"}';

-- 2. Test: kapal available = false -> boat_unavailable
SELECT throws_ok(
  format('SELECT public.create_booking(''%s'', ((now() at time zone ''Asia/Jakarta'')::date + interval ''1 day'')::date, ''09:00:00''::time, 2)', '55555555-5555-5555-5555-555555555555'),
  'boat_unavailable',
  'create_booking harus melempar boat_unavailable jika kapal tidak aktif'
);

-- 3a. Test: p_date kemarin (WIB) -> date_in_past
SELECT throws_ok(
  format('SELECT public.create_booking(''%s'', ((now() at time zone ''Asia/Jakarta'')::date - interval ''1 day'')::date, ''09:00:00''::time, 2)', '44444444-4444-4444-4444-444444444444'),
  'date_in_past',
  'create_booking harus melempar date_in_past jika tanggal keberangkatan kemarin'
);

-- 3b. Test: p_date hari ini (WIB) pada 00.30 WIB -> diterima
SELECT lives_ok(
  format('SELECT public.create_booking(''%s'', (now() at time zone ''Asia/Jakarta'')::date, ''10:00:00''::time, 2)', '44444444-4444-4444-4444-444444444444'),
  'create_booking harus menerima tanggal hari ini menurut Asia/Jakarta'
);

-- 4a. Test: p_passengers 0 -> invalid_passengers
SELECT throws_ok(
  format('SELECT public.create_booking(''%s'', ((now() at time zone ''Asia/Jakarta'')::date + interval ''2 days'')::date, ''09:00:00''::time, 0)', '44444444-4444-4444-4444-444444444444'),
  'invalid_passengers',
  'create_booking harus melempar invalid_passengers jika penumpang 0'
);

-- 4b. Test: p_passengers capacity + 1 (36) -> invalid_passengers
SELECT throws_ok(
  format('SELECT public.create_booking(''%s'', ((now() at time zone ''Asia/Jakarta'')::date + interval ''2 days'')::date, ''09:00:00''::time, 36)', '44444444-4444-4444-4444-444444444444'),
  'invalid_passengers',
  'create_booking harus melempar invalid_passengers jika penumpang melebihi kapasitas kapal'
);

-- 5. Skenario Balapan Kapasitas & Seats Left:
-- Target tanggal & jam khusus: tanggal +3 hari jam 08:00
-- User A memesan 30 kursi pada kapal kapasitas 35
DO $$
DECLARE
  v_test_date date := ((now() at time zone 'Asia/Jakarta')::date + interval '3 days')::date;
BEGIN
  PERFORM public.create_booking('44444444-4444-4444-4444-444444444444', v_test_date, '08:00:00'::time, 30, 'Booking rombongan A');
END $$;

-- Cek seats_left harus tersisa 5
SELECT is(
  public.seats_left('44444444-4444-4444-4444-444444444444', ((now() at time zone 'Asia/Jakarta')::date + interval '3 days')::date, '08:00:00'::time),
  5,
  'seats_left harus bernilai 5 setelah booking 30 dari kapasitas 35'
);

-- Ganti ke User B
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
SET LOCAL "request.jwt.claims" = '{"sub": "22222222-2222-2222-2222-222222222222"}';

-- User B memesan 6 kursi -> not_enough_seats
SELECT throws_ok(
  format('SELECT public.create_booking(''%s'', ((now() at time zone ''Asia/Jakarta'')::date + interval ''3 days'')::date, ''08:00:00''::time, 6)', '44444444-4444-4444-4444-444444444444'),
  'not_enough_seats',
  'create_booking harus melempar not_enough_seats jika kursi tersisa tidak mencukupi'
);

-- User B memesan 5 kursi -> berhasil
SELECT lives_ok(
  format('SELECT public.create_booking(''%s'', ((now() at time zone ''Asia/Jakarta'')::date + interval ''3 days'')::date, ''08:00:00''::time, 5)', '44444444-4444-4444-4444-444444444444'),
  'User B berhasil memesan sisa 5 kursi'
);

-- Cek seats_left harus bernilai 0
SELECT is(
  public.seats_left('44444444-4444-4444-4444-444444444444', ((now() at time zone 'Asia/Jakarta')::date + interval '3 days')::date, '08:00:00'::time),
  0,
  'seats_left harus bernilai 0 setelah sisa 5 kursi terisi penuh'
);

-- 6. Test: Verifikasi harga dan status booking milik User B
-- base_price = 50000, passengers = 5 -> total_price = 250000
SELECT results_eq(
  format('SELECT total_price, booking_status::text, payment_status::text FROM public.bookings WHERE user_id = ''%s'' AND boat_id = ''%s'' AND booking_date = ((now() at time zone ''Asia/Jakarta'')::date + interval ''3 days'')::date', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444'),
  $$VALUES (250000, 'pending', 'pending')$$,
  'Booking baru harus memiliki total_price = base_price * passengers, booking_status pending, payment_status pending'
);

-- 7. Test: RLS User B tidak dapat membaca booking milik User A lewat tabel bookings
SELECT is_empty(
  format('SELECT id FROM public.bookings WHERE user_id = ''%s''', '11111111-1111-1111-1111-111111111111'),
  'User B tidak boleh melihat baris booking milik User A lewat SELECT tabel (RLS)'
);

SELECT * FROM finish();
ROLLBACK;
