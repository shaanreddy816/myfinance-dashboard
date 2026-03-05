# 🚨 URGENT FIX: New User Registration Failing

## Problem
New users can't register because Supabase database is missing the `create_household_for_new_user` function.

## Error
```
Could not find the function public.create_household_for_new_user(household_name, member_name) in the schema cache
```

## Fix Steps (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"

### Step 2: Run This SQL
Copy and paste the entire SQL below into the editor and click "Run":

```sql
-- ============================================================================
-- CRITICAL: Creates the bootstrap function for new user registration
-- ============================================================================

-- Create the bootstrap function
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

-- Verify the function was created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_household_for_new_user';
```

### Step 3: Verify Success
You should see output:
```
routine_name                      | routine_type
----------------------------------|-------------
create_household_for_new_user     | FUNCTION
```

### Step 4: Test Registration
1. Go to https://famledgerai.com
2. Click "Get Started Free"
3. Register a new user
4. Should now work without errors!

## Additional Issue: Wrong Repository

Your Vercel is deploying from `US-Home-SmartAI` repository, but we've been working in the FamLedgerAI codebase.

**To fix:**
1. Go to Vercel Dashboard
2. Click your project
3. Settings → Git
4. Verify the correct repository is connected
5. If wrong, reconnect to the correct repo

## Need Help?
If you still see errors after running the SQL, check:
1. Do the tables exist? (`households`, `household_members`, `user_profiles`, `forecast_assumptions`)
2. If not, you need to run the full migration: `famledgerai/docs/supabase/NORMALIZED_SCHEMA_MIGRATION.sql`
