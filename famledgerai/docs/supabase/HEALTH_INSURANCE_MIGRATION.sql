-- ============================================================
-- FamLedgerAI: Health Insurance Module — Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) insurance_policies
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insurer TEXT NOT NULL,
  plan_name TEXT,
  policy_type TEXT DEFAULT 'health',
  status TEXT DEFAULT 'active',
  -- Store ONLY hashed policy number; never store plain number
  policy_number_hash TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  currency TEXT DEFAULT 'INR',
  premium_amount NUMERIC,
  premium_frequency TEXT DEFAULT 'annual',
  premium_paid_date DATE,
  premium_next_due_date DATE,
  sum_insured NUMERIC,
  deductible NUMERIC,
  members JSONB DEFAULT '[]'::jsonb,
  waiting_periods JSONB DEFAULT '{}'::jsonb,
  exclusions JSONB DEFAULT '{}'::jsonb,
  utilization JSONB DEFAULT '{}'::jsonb,
  network_hospitals JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'user_input',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, policy_number_hash)
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_insurance_policies_updated_at ON public.insurance_policies;
CREATE TRIGGER trg_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS for insurance_policies
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insurance_policies_select_own" ON public.insurance_policies;
CREATE POLICY "insurance_policies_select_own"
  ON public.insurance_policies FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insurance_policies_insert_own" ON public.insurance_policies;
CREATE POLICY "insurance_policies_insert_own"
  ON public.insurance_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insurance_policies_update_own" ON public.insurance_policies;
CREATE POLICY "insurance_policies_update_own"
  ON public.insurance_policies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insurance_policies_delete_own" ON public.insurance_policies;
CREATE POLICY "insurance_policies_delete_own"
  ON public.insurance_policies FOR DELETE
  USING (auth.uid() = user_id);

-- 2) insurance_claims
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
  claim_id TEXT,
  member_name TEXT,
  hospital_name TEXT,
  cashless BOOLEAN DEFAULT false,
  admission_date DATE,
  discharge_date DATE,
  status TEXT,
  amount_claimed NUMERIC,
  amount_paid NUMERIC,
  source TEXT DEFAULT 'user_input',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insurance_claims_select_own" ON public.insurance_claims;
CREATE POLICY "insurance_claims_select_own"
  ON public.insurance_claims FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insurance_claims_insert_own" ON public.insurance_claims;
CREATE POLICY "insurance_claims_insert_own"
  ON public.insurance_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insurance_claims_update_own" ON public.insurance_claims;
CREATE POLICY "insurance_claims_update_own"
  ON public.insurance_claims FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insurance_claims_delete_own" ON public.insurance_claims;
CREATE POLICY "insurance_claims_delete_own"
  ON public.insurance_claims FOR DELETE
  USING (auth.uid() = user_id);

-- 3) provider_network_cache (optional)
CREATE TABLE IF NOT EXISTS public.provider_network_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
  city TEXT,
  pincode TEXT,
  insurer TEXT,
  cached_results JSONB DEFAULT '[]'::jsonb,
  last_synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.provider_network_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "provider_cache_select_own" ON public.provider_network_cache;
CREATE POLICY "provider_cache_select_own"
  ON public.provider_network_cache FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "provider_cache_insert_own" ON public.provider_network_cache;
CREATE POLICY "provider_cache_insert_own"
  ON public.provider_network_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Storage bucket for policy PDFs (create via Supabase UI)
-- Bucket name: insurance_docs (private)
-- Storage policy: Allow user to upload/read only their folder: userId/*
-- ============================================================
