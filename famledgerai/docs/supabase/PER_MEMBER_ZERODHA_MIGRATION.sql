-- ============================================================================
-- PER-MEMBER ZERODHA INTEGRATION MIGRATION
-- Adds member_id column to integrations table for per-family-member connections
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ─── 1. ADD member_id COLUMN ────────────────────────────────────────────────
-- Defaults to 'self' so existing rows are automatically assigned to the
-- primary account holder without any data backfill.

ALTER TABLE public.integrations
  ADD COLUMN IF NOT EXISTS member_id TEXT DEFAULT 'self';

-- ─── 2. BACKFILL EXISTING ROWS ─────────────────────────────────────────────
-- Ensure any NULL values (shouldn't happen with DEFAULT, but safety net)

UPDATE public.integrations
  SET member_id = 'self'
  WHERE member_id IS NULL;

-- ─── 3. DROP OLD UNIQUE CONSTRAINT & CREATE NEW COMPOSITE KEY ───────────────
-- Old constraint was on (user_id, provider).
-- New constraint is on (user_id, provider, member_id) to allow multiple
-- Zerodha connections per FamLedgerAI account (one per family member).

-- Drop existing unique constraint (name may vary — try common patterns)
DO $$
BEGIN
  -- Try dropping by known constraint names
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'integrations'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'integrations_user_id_provider_key'
  ) THEN
    ALTER TABLE public.integrations DROP CONSTRAINT integrations_user_id_provider_key;
  END IF;

  -- Also check for a unique index (Supabase sometimes creates these instead)
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'integrations'
      AND indexname = 'integrations_user_id_provider_key'
  ) THEN
    DROP INDEX IF EXISTS public.integrations_user_id_provider_key;
  END IF;
END $$;

-- Create new composite unique constraint
ALTER TABLE public.integrations
  ADD CONSTRAINT integrations_user_id_provider_member_id_key
  UNIQUE (user_id, provider, member_id);

-- ─── 4. INDEX FOR MEMBER LOOKUPS ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_integrations_member
  ON public.integrations(user_id, member_id);

-- ============================================================================
-- VERIFICATION: Run after migration to confirm
-- ============================================================================
-- SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'integrations' AND column_name = 'member_id';
--
-- SELECT constraint_name, constraint_type
--   FROM information_schema.table_constraints
--   WHERE table_name = 'integrations' AND constraint_type = 'UNIQUE';
