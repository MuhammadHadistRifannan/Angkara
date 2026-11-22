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
