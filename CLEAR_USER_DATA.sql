-- ============================================================================
-- CLEAR USER DATA - Clean up data for testing/development
-- ============================================================================
-- This script helps you clear user data when testing registration flows
-- Use this when you delete a user from Auth and want to clear their data too
--
-- OPTION 1: Clear data for a specific email
-- ============================================================================

-- Replace 'user@example.com' with the actual email
DELETE FROM public.user_data 
WHERE email = 'shanthanreddy5000@gmail.com';

-- If using normalized schema (Phase 1.6), also clear from these tables:
-- First, find the household_id for the user
DO $$
DECLARE
    v_household_id UUID;
BEGIN
    -- Get household_id from user_profiles for the email
    SELECT household_id INTO v_household_id
    FROM public.user_profiles
    WHERE email = 'shanthanreddy5000@gmail.com';
    
    IF v_household_id IS NOT NULL THEN
        -- Delete all household data
        DELETE FROM public.expenses WHERE household_id = v_household_id;
        DELETE FROM public.incomes WHERE household_id = v_household_id;
        DELETE FROM public.investments WHERE household_id = v_household_id;
        DELETE FROM public.loans WHERE household_id = v_household_id;
        DELETE FROM public.insurance_policies WHERE household_id = v_household_id;
        DELETE FROM public.forecast_assumptions WHERE household_id = v_household_id;
        DELETE FROM public.household_members WHERE household_id = v_household_id;
        DELETE FROM public.user_profiles WHERE household_id = v_household_id;
        DELETE FROM public.households WHERE id = v_household_id;
        
        RAISE NOTICE 'Deleted all data for household_id: %', v_household_id;
    ELSE
        RAISE NOTICE 'No household found for this email';
    END IF;
END $$;


-- ============================================================================
-- OPTION 2: Clear ALL user data (DANGEROUS - use only in dev/test)
-- ============================================================================
-- Uncomment the lines below to clear ALL user data from all tables
-- WARNING: This will delete ALL user data from your database!

/*
TRUNCATE TABLE public.user_data CASCADE;
TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.incomes CASCADE;
TRUNCATE TABLE public.investments CASCADE;
TRUNCATE TABLE public.loans CASCADE;
TRUNCATE TABLE public.insurance_policies CASCADE;
TRUNCATE TABLE public.forecast_assumptions CASCADE;
TRUNCATE TABLE public.household_members CASCADE;
TRUNCATE TABLE public.user_profiles CASCADE;
TRUNCATE TABLE public.households CASCADE;
*/


-- ============================================================================
-- OPTION 3: Clear data for users created in the last hour (testing cleanup)
-- ============================================================================
-- This is useful for cleaning up test registrations

/*
DELETE FROM public.user_data 
WHERE email IN (
    SELECT email 
    FROM auth.users 
    WHERE created_at > NOW() - INTERVAL '1 hour'
);

-- For normalized schema:
DELETE FROM public.households 
WHERE created_at > NOW() - INTERVAL '1 hour';
*/


-- ============================================================================
-- VERIFICATION: Check what data exists for an email
-- ============================================================================

-- Check legacy user_data table
SELECT email, 
       profile->>'name' as name,
       profile->>'age' as age,
       profile->>'_authUid' as auth_uid,
       profile->>'_wizardCompleted' as wizard_completed
FROM public.user_data 
WHERE email = 'shanthanreddy5000@gmail.com';

-- Check normalized tables
SELECT 
    h.id as household_id,
    h.name as household_name,
    up.email,
    up.display_name,
    up.role,
    hm.name as member_name,
    hm.role as member_role
FROM public.households h
LEFT JOIN public.user_profiles up ON up.household_id = h.id
LEFT JOIN public.household_members hm ON hm.household_id = h.id
WHERE up.email = 'shanthanreddy5000@gmail.com';


-- ============================================================================
-- QUICK FIX: Update _authUid for existing data to match current auth user
-- ============================================================================
-- If you want to keep the data but fix the auth UID mismatch:

/*
-- First, get the current auth UID for the email from auth.users
-- Then update the user_data table
UPDATE public.user_data
SET profile = jsonb_set(
    profile, 
    '{_authUid}', 
    to_jsonb((SELECT id::text FROM auth.users WHERE email = 'shanthanreddy5000@gmail.com'))
)
WHERE email = 'shanthanreddy5000@gmail.com';
*/
