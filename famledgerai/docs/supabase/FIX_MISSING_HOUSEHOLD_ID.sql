-- ============================================================================
-- FIX: Add missing household_id columns to expenses and insurance_policies
-- Run this if you get "column household_id does not exist" errors
-- ============================================================================

-- Add household_id column to expenses (will fail silently if already exists)
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;

-- Add household_id column to insurance_policies (will fail silently if already exists)
ALTER TABLE public.insurance_policies 
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;

-- Drop and recreate the trigger if it already exists
DROP TRIGGER IF EXISTS trg_insurance_policies_updated_at ON public.insurance_policies;
CREATE TRIGGER trg_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Now create the policies (drop first if they exist)
DROP POLICY IF EXISTS expenses_select ON public.expenses;
DROP POLICY IF EXISTS expenses_insert ON public.expenses;
DROP POLICY IF EXISTS expenses_update ON public.expenses;
DROP POLICY IF EXISTS expenses_delete ON public.expenses;

CREATE POLICY expenses_select ON public.expenses
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY expenses_insert ON public.expenses
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY expenses_update ON public.expenses
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY expenses_delete ON public.expenses
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

DROP POLICY IF EXISTS ip_select ON public.insurance_policies;
DROP POLICY IF EXISTS ip_insert ON public.insurance_policies;
DROP POLICY IF EXISTS ip_update ON public.insurance_policies;
DROP POLICY IF EXISTS ip_delete ON public.insurance_policies;

CREATE POLICY ip_select ON public.insurance_policies
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY ip_insert ON public.insurance_policies
  FOR INSERT WITH CHECK (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY ip_update ON public.insurance_policies
  FOR UPDATE USING (public.household_role(household_id) IN ('owner','spouse'));
CREATE POLICY ip_delete ON public.insurance_policies
  FOR DELETE USING (public.household_role(household_id) IN ('owner','spouse'));

-- Create indexes (drop first if they exist)
DROP INDEX IF EXISTS idx_expenses_hh_member;
DROP INDEX IF EXISTS idx_expenses_hh_month;
DROP INDEX IF EXISTS idx_ip_hh_member;

CREATE INDEX idx_expenses_hh_member
  ON public.expenses(household_id, member_id);
COMMENT ON INDEX idx_expenses_hh_member IS 'Overview page: aggregate expenses per member';

CREATE INDEX idx_expenses_hh_month
  ON public.expenses(household_id, month);
COMMENT ON INDEX idx_expenses_hh_month IS 'Monthly expense aggregation for budget tracking';

CREATE INDEX idx_ip_hh_member
  ON public.insurance_policies(household_id, member_id);
COMMENT ON INDEX idx_ip_hh_member IS 'Overview page: coverage per member';

-- Verification
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('expenses', 'insurance_policies')
  AND column_name = 'household_id';
