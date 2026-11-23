-- Migration: Add confirm_booking_payment RPC and user update policy on bookings
-- Enables tourists to confirm payment when Midtrans returns settlement/success

CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
  p_booking_id uuid,
  p_payment_status text DEFAULT 'fully_paid'
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
BEGIN
  -- 1. Validasi Autentikasi User
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- 2. Validasi status pembayaran yang diizinkan
  IF p_payment_status NOT IN ('dp_paid', 'fully_paid') THEN
    RAISE EXCEPTION 'invalid_payment_status';
  END IF;

  -- 3. Perbarui status booking milik user
  UPDATE public.bookings
  SET
    payment_status = p_payment_status::public.payment_status,
    booking_status = 'confirmed'
  WHERE id = p_booking_id
    AND user_id = auth.uid()
  RETURNING * INTO v_booking;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_not_found_or_unauthorized';
  END IF;

  RETURN v_booking;
END;
$$;

-- Hak akses RPC
REVOKE ALL ON FUNCTION public.confirm_booking_payment(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_booking_payment(uuid, text) TO authenticated, service_role;

-- Kebijakan RLS agar user pemilik dapat mengupdate payment_status booking miliknya sendiri
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Users can update own booking payment status'
  ) THEN
    CREATE POLICY "Users can update own booking payment status"
      ON public.bookings
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
