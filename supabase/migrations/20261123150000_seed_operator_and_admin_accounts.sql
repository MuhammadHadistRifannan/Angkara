-- Migrasi: Seed Akun Operator dan Admin Platform SUAR
-- Memastikan tersedianya akun kredensial untuk nakhoda/operator dan admin pengelola platform.
-- Idempoten: aman dijalankan berulang kali tanpa duplikasi data.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_admin_id uuid := 'c71751f8-7876-4cca-972a-69e68347a838';
  v_operator_id uuid := 'a7dcaf70-4152-4b2e-b0dc-20206eaba4b0';
  v_encrypted_password text := extensions.crypt('Password123!', extensions.gen_salt('bf', 10));
  v_op_record_id uuid := '417f0416-d333-474b-b3f0-4bf8457b3b59';
BEGIN
  -- 1. Akun Admin (admin@suar.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@suar.id') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_admin_id, 'authenticated', 'authenticated',
      'admin@suar.id', v_encrypted_password, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "admin", "full_name": "Admin Platform SUAR", "email": "admin@suar.id"}'::jsonb,
      now(), now(), '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_admin_id,
      json_build_object('sub', v_admin_id::text, 'email', 'admin@suar.id', 'role', 'admin')::jsonb,
      'email', v_admin_id::text, now(), now(), now()
    );
  END IF;

  -- 2. Akun Operator (operator@suar.id)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'operator@suar.id') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_operator_id, 'authenticated', 'authenticated',
      'operator@suar.id', v_encrypted_password, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "operator", "full_name": "Nakhoda Samudra Jaya", "company_name": "CV Samudra Jaya", "email": "operator@suar.id"}'::jsonb,
      now(), now(), '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_operator_id,
      json_build_object('sub', v_operator_id::text, 'email', 'operator@suar.id', 'role', 'operator')::jsonb,
      'email', v_operator_id::text, now(), now(), now()
    );
  END IF;

  -- 3. Profiles
  INSERT INTO public.profiles (id, full_name)
  VALUES (v_admin_id, 'Admin Platform SUAR')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  INSERT INTO public.profiles (id, full_name)
  VALUES (v_operator_id, 'Nakhoda Samudra Jaya')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- 4. Tautkan Operator CV Samudra Jaya ke user_id
  UPDATE public.operators
  SET user_id = v_operator_id,
      email = 'operator@suar.id',
      verified = true,
      phone = '081234567890',
      address = 'Dermaga Pandanarang, Teluk Penyu, Cilacap'
  WHERE id = v_op_record_id OR company_name = 'CV Samudra Jaya';
END $$;
