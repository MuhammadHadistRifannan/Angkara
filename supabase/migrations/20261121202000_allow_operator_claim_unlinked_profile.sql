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
