-- ============================================================================
-- Migration: Create household bootstrap function for new user registration
-- ============================================================================
-- This function is called when a new user completes registration
-- It creates the household, member, profile, and forecast assumptions
-- IDEMPOTENT: Safe to call multiple times - returns existing household if present
-- ============================================================================

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
    v_existing_profile RECORD;
BEGIN
    -- Get current authenticated user
    v_auth_uid := auth.uid();
    
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- IDEMPOTENT: Check if user already has a household
    SELECT * INTO v_existing_profile
    FROM public.user_profiles 
    WHERE auth_uid = v_auth_uid
    LIMIT 1;
    
    IF FOUND THEN
        -- User already has a household - return existing IDs
        RAISE NOTICE 'User already has household, returning existing data';
        RETURN jsonb_build_object(
            'household_id', v_existing_profile.household_id,
            'member_id',    v_existing_profile.member_id,
            'profile_id',   v_existing_profile.id,
            'existing',     true
        );
    END IF;
    
    -- Get user email from auth.users
    SELECT email INTO v_email FROM auth.users WHERE id = v_auth_uid;
    
    IF v_email IS NULL THEN
        RAISE EXCEPTION 'User email not found';
    END IF;
    
    -- Create household
    INSERT INTO public.households (name, created_at)
    VALUES (COALESCE(p_household_name, v_email || '''s Household'), NOW())
    RETURNING id INTO v_hh_id;
    
    -- Create household member (with unique constraint protection)
    INSERT INTO public.household_members (household_id, name, role, created_at)
    VALUES (v_hh_id, COALESCE(p_member_name, 'Me'), 'self', NOW())
    ON CONFLICT (household_id, name) DO UPDATE 
        SET role = EXCLUDED.role
    RETURNING id INTO v_member_id;
    
    -- Create user profile (with unique constraint protection)
    INSERT INTO public.user_profiles (
        auth_uid, 
        household_id, 
        member_id, 
        role, 
        email, 
        display_name,
        created_at,
        updated_at
    )
    VALUES (
        v_auth_uid, 
        v_hh_id, 
        v_member_id, 
        'owner', 
        v_email, 
        COALESCE(p_member_name, 'Me'),
        NOW(),
        NOW()
    )
    ON CONFLICT (auth_uid) DO UPDATE
        SET household_id = EXCLUDED.household_id,
            member_id = EXCLUDED.member_id,
            updated_at = NOW()
    RETURNING id INTO v_profile_id;
    
    -- Create default forecast assumptions (idempotent)
    INSERT INTO public.forecast_assumptions (household_id, created_at)
    VALUES (v_hh_id, NOW())
    ON CONFLICT (household_id) DO NOTHING;
    
    -- Return created IDs
    RETURN jsonb_build_object(
        'household_id', v_hh_id,
        'member_id',    v_member_id,
        'profile_id',   v_profile_id,
        'existing',     false
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and re-raise
        RAISE WARNING 'Error in create_household_for_new_user: %', SQLERRM;
        RAISE;
END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.create_household_for_new_user(TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_household_for_new_user(TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_household_for_new_user(TEXT, TEXT) FROM public;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_household_for_new_user(TEXT, TEXT) IS 
'Creates household, member, and profile for new user. Idempotent - returns existing household if already created.';

-- Verify function was created
SELECT 
    routine_name,
    routine_type,
    security_type,
    routine_definition IS NOT NULL as has_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_household_for_new_user';
