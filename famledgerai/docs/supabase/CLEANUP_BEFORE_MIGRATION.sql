-- ============================================================================
-- CLEANUP SCRIPT — Run this FIRST before the main migration
-- This removes any partial/old tables that conflict with the new schema
-- ============================================================================

-- Drop all normalized tables in reverse dependency order
DROP TABLE IF EXISTS public.computed_stress_results CASCADE;
DROP TABLE IF EXISTS public.computed_risk_scores CASCADE;
DROP TABLE IF EXISTS public.computed_forecasts CASCADE;
DROP TABLE IF EXISTS public.forecast_assumptions CASCADE;
DROP TABLE IF EXISTS public.insurance_policies CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.incomes CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.household_members CASCADE;
DROP TABLE IF EXISTS public.households CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.create_household_for_new_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.household_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_household_member(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- Verification: check that tables are gone
SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'households','household_members','user_profiles',
      'incomes','expenses','investments','loans','insurance_policies',
      'forecast_assumptions','computed_forecasts','computed_risk_scores',
      'computed_stress_results'
    );
-- Should return 0 rows

-- ============================================================================
-- NOW RUN THE MAIN MIGRATION: NORMALIZED_SCHEMA_MIGRATION.sql
-- ============================================================================
