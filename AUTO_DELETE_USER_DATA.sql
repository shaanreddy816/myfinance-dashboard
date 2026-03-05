-- ============================================================================
-- AUTO DELETE USER DATA - Automatically clean up when user is deleted from Auth
-- ============================================================================
-- This creates a trigger that automatically deletes all user data when you
-- delete a user from Supabase Authentication. Perfect for testing!
--
-- Run this ONCE in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Create a function that deletes user data
CREATE OR REPLACE FUNCTION public.delete_user_data_on_auth_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
    v_household_id UUID;
BEGIN
    -- Get the email of the deleted user
    v_email := OLD.email;
    
    RAISE NOTICE 'User deleted from auth: %. Cleaning up data...', v_email;
    
    -- Delete from legacy user_data table
    DELETE FROM public.user_data WHERE email = v_email;
    RAISE NOTICE 'Deleted from user_data table';
    
    -- Delete from normalized tables (Phase 1.6)
    -- First get the household_id
    SELECT household_id INTO v_household_id
    FROM public.user_profiles
    WHERE email = v_email;
    
    IF v_household_id IS NOT NULL THEN
        RAISE NOTICE 'Found household_id: %. Deleting all household data...', v_household_id;
        
        -- Delete all household-related data
        DELETE FROM public.expenses WHERE household_id = v_household_id;
        DELETE FROM public.incomes WHERE household_id = v_household_id;
        DELETE FROM public.investments WHERE household_id = v_household_id;
        DELETE FROM public.loans WHERE household_id = v_household_id;
        DELETE FROM public.insurance_policies WHERE household_id = v_household_id;
        DELETE FROM public.forecast_assumptions WHERE household_id = v_household_id;
        DELETE FROM public.household_members WHERE household_id = v_household_id;
        DELETE FROM public.user_profiles WHERE household_id = v_household_id;
        DELETE FROM public.households WHERE id = v_household_id;
        
        RAISE NOTICE 'All data deleted for household: %', v_household_id;
    ELSE
        RAISE NOTICE 'No household found for email: %', v_email;
    END IF;
    
    RAISE NOTICE 'Cleanup complete for user: %', v_email;
    
    RETURN OLD;
END;
$$;

-- Step 2: Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_user_data_on_auth_delete();

-- Step 3: Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_deleted';

-- ============================================================================
-- SUCCESS! 
-- ============================================================================
-- Now whenever you delete a user from Supabase Authentication,
-- all their data will be automatically deleted from all tables.
--
-- You only need to:
-- 1. Go to Authentication → Users
-- 2. Delete the user
-- 3. Done! All data is automatically cleaned up
--
-- No need to run SQL queries manually anymore!
-- ============================================================================


-- ============================================================================
-- OPTIONAL: To remove the auto-delete trigger (if you want to disable it)
-- ============================================================================
/*
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.delete_user_data_on_auth_delete();
*/
