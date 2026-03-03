-- ============================================================================
-- FAMLEDGERAI — NORMALIZED SCHEMA MIGRATION (Phase 1.6)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================
-- SECTIONS:
--   0) CLEANUP (if re-running after partial failure)
--   A) Extensions + Trigger Function (no table deps)
--   B) Table DDL (12 tables)
--   B+) RLS Helper Functions (depend on user_profiles from B.3)
--   C) RLS Enable + Policies
--   D) Indexes
--   E) Bootstrap Function
-- ============================================================================
-- PRE-FLIGHT: Back up user_data before running
--   CREATE TABLE user_data_backup AS SELECT * FROM user_data;
-- ============================================================================


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 0: CLEANUP (run this if you need to start fresh after a partial run)
-- ═══════════════════════════════════════════════════════════════════════════════
-- UNCOMMENT THE LINES BELOW TO DROP ALL NORMALIZED TABLES AND START OVER:
--
-- DROP TABLE IF EXISTS public.computed_stress_results CASCADE;
-- DROP TABLE IF EXISTS public.computed_risk_scores CASCADE;
-- DROP TABLE IF EXISTS public.computed_forecasts CASCADE;
-- DROP TABLE IF EXISTS public.forecast_assumptions CASCADE;
-- DROP TABLE IF EXISTS public.insurance_policies CASCADE;
-- DROP TABLE IF EXISTS public.loans CASCADE;
-- DROP TABLE IF EXISTS public.investments CASCADE;
-- DROP TABLE IF EXISTS public.expenses CASCADE;
-- DROP TABLE IF EXISTS public.incomes CASCADE;
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;
-- DROP TABLE IF EXISTS public.household_members CASCADE;
-- DROP TABLE IF EXISTS public.households CASCADE;
-- DROP FUNCTION IF EXISTS public.create_household_for_new_user(TEXT, TEXT) CASCADE;
-- DROP FUNCTION IF EXISTS public.household_role(UUID) CASCADE;
-- DROP FUNCTION IF EXISTS public.is_household_member(UUID) CASCADE;
-- DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
--
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION A: EXTENSIONS + TRIGGER FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════════

-- pgcrypto for gen_random_uuid() (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Auto-update updated_at trigger function (no table dependency — safe first)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION B: TABLE DDL (12 tables)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── B.1  households ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── B.2  household_members ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.household_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('self','spouse','kid','parent','other')),
  date_of_birth DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── B.3  user_profiles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid      UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id     UUID REFERENCES public.household_members(id) ON DELETE SET NULL,
  role          TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','spouse','dependent')),
  email         TEXT NOT NULL,
  display_name  TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── B.4  incomes ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.incomes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES public.household_members(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  amount        NUMERIC NOT NULL,
  frequency     TEXT NOT NULL DEFAULT 'monthly',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_incomes_updated_at
  BEFORE UPDATE ON public.incomes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── B.5  expenses ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES public.household_members(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  label         TEXT,
  amount        NUMERIC NOT NULL,
  month         TEXT NOT NULL,
  is_recurring  BOOLEAN NOT NULL DEFAULT FALSE,
  frequency     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── B.6  investments ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.investments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES public.household_members(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('mutual_fund','stock','fd','ppf','nps','gold','other')),
  name          TEXT NOT NULL,
  value         NUMERIC NOT NULL DEFAULT 0,
  units         NUMERIC,
  nav           NUMERIC,
  purchase_date DATE,
  rate          NUMERIC,
  maturity_date DATE,
  sip_amount    NUMERIC,
  meta          JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_investments_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── B.7  loans ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.loans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES public.household_members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  lender          TEXT,
  principal       NUMERIC,
  outstanding     NUMERIC NOT NULL DEFAULT 0,
  rate            NUMERIC NOT NULL,
  emi             NUMERIC NOT NULL DEFAULT 0,
  tenure_months   INTEGER,
  start_date      DATE,
  end_date        DATE,
  meta            JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── B.8  insurance_policies ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id      UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id         UUID NOT NULL REFERENCES public.household_members(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('term','health','vehicle','life','home','other')),
  provider          TEXT,
  policy_number     TEXT,
  cover_amount      NUMERIC NOT NULL DEFAULT 0,
  premium           NUMERIC,
  premium_frequency TEXT NOT NULL DEFAULT 'yearly',
  start_date        DATE,
  end_date          DATE,
  meta              JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── B.9  forecast_assumptions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.forecast_assumptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL UNIQUE REFERENCES public.households(id) ON DELETE CASCADE,
  inflation_rate  NUMERIC NOT NULL DEFAULT 0.06,
  equity_return   NUMERIC NOT NULL DEFAULT 0.12,
  debt_return     NUMERIC NOT NULL DEFAULT 0.07,
  salary_growth   NUMERIC NOT NULL DEFAULT 0.08,
  expense_growth  NUMERIC NOT NULL DEFAULT 0.06,
  retirement_age  INTEGER DEFAULT 60,
  life_expectancy INTEGER DEFAULT 85,
  meta            JSONB NOT NULL DEFAULT '{}',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_forecast_assumptions_updated_at
  BEFORE UPDATE ON public.forecast_assumptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── B.10  computed_forecasts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.computed_forecasts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id          UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id             UUID REFERENCES public.household_members(id) ON DELETE CASCADE,
  year                  INTEGER NOT NULL,
  projected_income      NUMERIC,
  projected_expenses    NUMERIC,
  projected_investments NUMERIC,
  projected_net_worth   NUMERIC,
  assumptions_snapshot  JSONB,
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id, member_id, year)
);

-- ── B.11  computed_risk_scores ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.computed_risk_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id       UUID REFERENCES public.household_members(id) ON DELETE CASCADE,
  overall_score   NUMERIC NOT NULL,
  category_scores JSONB NOT NULL,
  risk_level      TEXT NOT NULL CHECK (risk_level IN ('low','medium','high','critical')),
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── B.12  computed_stress_results ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.computed_stress_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  scenario_name   TEXT NOT NULL,
  parameters      JSONB NOT NULL,
  results         JSONB NOT NULL,
  survival_months INTEGER,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION B+: RLS HELPER FUNCTIONS
-- (Created AFTER user_profiles table exists — fixes dependency order)
-- ═══════════════════════════════════════════════════════════════════════════════

-- is_household_member(hid) — returns TRUE if current auth user belongs to household
CREATE OR REPLACE FUNCTION public.is_household_member(hid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE auth_uid = auth.uid()
      AND household_id = hid
  );
$$;

-- household_role(hid) — returns role ('owner','spouse','dependent') or NULL
CREATE OR REPLACE FUNCTION public.household_role(hid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles
  WHERE auth_uid = auth.uid()
    AND household_id = hid
  LIMIT 1;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION C: RLS ENABLE + POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── C.1  Enable RLS on all tables ──────────────────────────────────────────
ALTER TABLE public.households             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_assumptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.computed_forecasts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.computed_risk_scores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.computed_stress_results ENABLE ROW LEVEL SECURITY;

-- ── C.2  households policies ───────────────────────────────────────────────
CREATE POLICY households_select ON public.households
  FOR SELECT USING (public.is_household_member(id));

CREATE POLICY households_insert ON public.households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY households_update ON public.households
  FOR UPDATE USING (public.household_role(id) = 'owner');

CREATE POLICY households_delete ON public.households
  FOR DELETE USING (public.household_role(id) = 'owner');

-- ── C.3  household_members policies ────────────────────────────────────────
CREATE POLICY hm_select ON public.household_members
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY hm_insert ON public.household_members
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));

CREATE POLICY hm_update ON public.household_members
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));

CREATE POLICY hm_delete ON public.household_members
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

-- ── C.4  user_profiles policies ────────────────────────────────────────────
CREATE POLICY up_select ON public.user_profiles
  FOR SELECT USING (
    auth_uid = auth.uid()
    OR public.is_household_member(household_id)
  );

CREATE POLICY up_insert ON public.user_profiles
  FOR INSERT WITH CHECK (auth_uid = auth.uid());

CREATE POLICY up_update ON public.user_profiles
  FOR UPDATE USING (auth_uid = auth.uid());

CREATE POLICY up_delete ON public.user_profiles
  FOR DELETE USING (auth_uid = auth.uid());

-- ── C.5  Financial tables (same pattern: SELECT=member, write=owner/spouse) ─

-- incomes
CREATE POLICY incomes_select ON public.incomes
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY incomes_insert ON public.incomes
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY incomes_update ON public.incomes
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY incomes_delete ON public.incomes
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

-- expenses
CREATE POLICY expenses_select ON public.expenses
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY expenses_insert ON public.expenses
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY expenses_update ON public.expenses
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY expenses_delete ON public.expenses
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

-- investments
CREATE POLICY investments_select ON public.investments
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY investments_insert ON public.investments
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY investments_update ON public.investments
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY investments_delete ON public.investments
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

-- loans
CREATE POLICY loans_select ON public.loans
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY loans_insert ON public.loans
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY loans_update ON public.loans
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY loans_delete ON public.loans
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

-- insurance_policies
CREATE POLICY ip_select ON public.insurance_policies
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY ip_insert ON public.insurance_policies
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY ip_update ON public.insurance_policies
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY ip_delete ON public.insurance_policies
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

-- ── C.6  forecast_assumptions policies ─────────────────────────────────────
CREATE POLICY fa_select ON public.forecast_assumptions
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY fa_insert ON public.forecast_assumptions
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY fa_update ON public.forecast_assumptions
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));

-- ── C.7  Computed tables ───────────────────────────────────────────────────

-- computed_forecasts
CREATE POLICY cf_select ON public.computed_forecasts
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY cf_insert ON public.computed_forecasts
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY cf_update ON public.computed_forecasts
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY cf_delete ON public.computed_forecasts
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

-- computed_risk_scores
CREATE POLICY crs_select ON public.computed_risk_scores
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY crs_insert ON public.computed_risk_scores
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY crs_update ON public.computed_risk_scores
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));

-- computed_stress_results
CREATE POLICY csr_select ON public.computed_stress_results
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY csr_insert ON public.computed_stress_results
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY csr_update ON public.computed_stress_results
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY csr_delete ON public.computed_stress_results
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION D: INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_hm_household
  ON public.household_members(household_id);
COMMENT ON INDEX idx_hm_household IS 'Overview page: load all family members for a household';

CREATE INDEX IF NOT EXISTS idx_up_household
  ON public.user_profiles(household_id);
COMMENT ON INDEX idx_up_household IS 'RLS helper: find all profiles in a household';

CREATE INDEX IF NOT EXISTS idx_incomes_hh_member
  ON public.incomes(household_id, member_id);
COMMENT ON INDEX idx_incomes_hh_member IS 'Overview page: aggregate income per member';

CREATE INDEX IF NOT EXISTS idx_expenses_hh_member
  ON public.expenses(household_id, member_id);
COMMENT ON INDEX idx_expenses_hh_member IS 'Overview page: aggregate expenses per member';

CREATE INDEX IF NOT EXISTS idx_expenses_hh_month
  ON public.expenses(household_id, month);
COMMENT ON INDEX idx_expenses_hh_month IS 'Monthly expense aggregation for budget tracking';

CREATE INDEX IF NOT EXISTS idx_investments_hh_member
  ON public.investments(household_id, member_id);
COMMENT ON INDEX idx_investments_hh_member IS 'Overview page: portfolio per member';

CREATE INDEX IF NOT EXISTS idx_investments_hh_type
  ON public.investments(household_id, type);
COMMENT ON INDEX idx_investments_hh_type IS 'Portfolio breakdown by asset type';

CREATE INDEX IF NOT EXISTS idx_loans_hh_member
  ON public.loans(household_id, member_id);
COMMENT ON INDEX idx_loans_hh_member IS 'Overview page: debt per member, DSR calculation';

CREATE INDEX IF NOT EXISTS idx_ip_hh_member
  ON public.insurance_policies(household_id, member_id);
COMMENT ON INDEX idx_ip_hh_member IS 'Overview page: coverage per member';

CREATE INDEX IF NOT EXISTS idx_cf_hh_year
  ON public.computed_forecasts(household_id, year);
COMMENT ON INDEX idx_cf_hh_year IS 'Forecast chart: load 15-year projection series';

CREATE INDEX IF NOT EXISTS idx_crs_household
  ON public.computed_risk_scores(household_id);
COMMENT ON INDEX idx_crs_household IS 'Risk dashboard: latest risk score snapshot';

CREATE INDEX IF NOT EXISTS idx_csr_household
  ON public.computed_stress_results(household_id);
COMMENT ON INDEX idx_csr_household IS 'Stress test card: latest scenario results';


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION E: BOOTSTRAP FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════════

-- create_household_for_new_user(household_name, member_name)
-- SECURITY DEFINER: can insert into tables before user has RLS access
-- Abuse prevention: fails if auth user already has a user_profile row

CREATE OR REPLACE FUNCTION public.create_household_for_new_user(
  p_household_name TEXT,
  p_member_name    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid   UUID;
  v_email      TEXT;
  v_hh_id      UUID;
  v_member_id  UUID;
  v_profile_id UUID;
BEGIN
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE auth_uid = v_auth_uid) THEN
    RAISE EXCEPTION 'User already has a household';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_auth_uid;

  INSERT INTO public.households (name)
  VALUES (p_household_name)
  RETURNING id INTO v_hh_id;

  INSERT INTO public.household_members (household_id, name, role)
  VALUES (v_hh_id, p_member_name, 'self')
  RETURNING id INTO v_member_id;

  INSERT INTO public.user_profiles (auth_uid, household_id, member_id, role, email, display_name)
  VALUES (v_auth_uid, v_hh_id, v_member_id, 'owner', v_email, p_member_name)
  RETURNING id INTO v_profile_id;

  INSERT INTO public.forecast_assumptions (household_id)
  VALUES (v_hh_id);

  RETURN jsonb_build_object(
    'household_id', v_hh_id,
    'member_id',    v_member_id,
    'profile_id',   v_profile_id
  );
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run after migration to confirm)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- -- Check all 12 tables exist
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN (
--       'households','household_members','user_profiles',
--       'incomes','expenses','investments','loans','insurance_policies',
--       'forecast_assumptions','computed_forecasts','computed_risk_scores',
--       'computed_stress_results'
--     )
--   ORDER BY table_name;
--
-- -- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public'
--     AND tablename IN (
--       'households','household_members','user_profiles',
--       'incomes','expenses','investments','loans','insurance_policies',
--       'forecast_assumptions','computed_forecasts','computed_risk_scores',
--       'computed_stress_results'
--     );
--
-- -- Check policies
-- SELECT tablename, policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;
--
-- -- Check helper functions
-- SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public'
--     AND routine_name IN ('is_household_member','household_role','set_updated_at','create_household_for_new_user');
--
-- -- Test bootstrap (as an authenticated user):
-- SELECT public.create_household_for_new_user('My Family', 'Shantan');
