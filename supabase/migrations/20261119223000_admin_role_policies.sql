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
