# CRITICAL FIX: Bootstrap Function 404 Error

## Problem

When new users register and verify their email, they get:
- Error: `Failed to load your data. Please try again.`
- Console shows: `404` on `create_household_for_new_user`
- User sees profile wizard but bootstrap fails

## Root Cause

The `create_household_for_new_user()` SQL function doesn't exist in your Supabase database. This function is required to create the household, member, and profile for new users.

## Fix (3 Steps)

### Step 1: Create the Bootstrap Function

1. Go to Supabase SQL Editor:
   https://supabase.com/dashboard/project/ivvkzforsgruhofpekir/sql/new

2. Copy and paste this SQL:

```sql
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
```

3. Click **Run** (or press Ctrl+Enter)

4. Verify it was created:

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_household_for_new_user';
```

**Expected**: 1 row showing `create_household_for_new_user | FUNCTION`

---

### Step 2: Verify All Required Tables Exist

Run this query:

```sql
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'households',
    'household_members',
    'user_profiles',
    'incomes',
    'expenses',
    'investments',
    'loans',
    'insurance_policies',
    'forecast_assumptions'
  )
ORDER BY table_name;
```

**Expected**: 9 rows (all tables listed)

**If any tables are missing**:
- Run the full migration: `famledgerai/docs/supabase/NORMALIZED_SCHEMA_MIGRATION.sql`
- Or run the fix: `famledgerai/docs/supabase/FIX_MISSING_HOUSEHOLD_ID.sql`

---

### Step 3: Clean Up Test User and Try Again

1. **Delete the test user** from Supabase Auth:
   - Go to: https://supabase.com/dashboard/project/ivvkzforsgruhofpekir/auth/users
   - Find user: `shaan@...` (or your test email)
   - Click three dots → **Delete user**

2. **Clear browser data**:
   - Open DevTools (F12)
   - Application tab → Clear storage → Clear site data
   - Or use incognito window

3. **Register again**:
   - Go to https://dev.famledgerai.com/
   - Register with the same or new email
   - Verify email
   - Click verification link

4. **Expected Result**:
   - No 404 error in console
   - Console shows: `🏠 Bootstrapping household: ...`
   - Console shows: `✅ Household context loaded`
   - Profile wizard appears
   - No "Failed to load your data" error

---

## Verification Queries

After successful registration, verify the data was created:

```sql
-- Check user profile was created
SELECT 
  up.email,
  up.role,
  h.name as household_name,
  hm.name as member_name
FROM user_profiles up
JOIN households h ON up.household_id = h.id
JOIN household_members hm ON up.member_id = hm.id
WHERE up.email = 'YOUR_EMAIL@example.com';
```

**Expected**: 1 row with your email, role='owner', household name, member name

```sql
-- Check forecast assumptions were created
SELECT * FROM forecast_assumptions fa
JOIN user_profiles up ON fa.household_id = up.household_id
WHERE up.email = 'YOUR_EMAIL@example.com';
```

**Expected**: 1 row with default forecast assumptions

---

## Why This Happened

The Phase 2 code was deployed but the database migration wasn't run. The code expects:
1. Normalized tables (households, household_members, user_profiles, etc.)
2. RLS helper functions (is_household_member, household_role)
3. Bootstrap function (create_household_for_new_user)

Without these, the bootstrap fails with 404.

---

## Complete Migration (If Needed)

If you haven't run the full migration yet, run this file in Supabase SQL Editor:

**File**: `famledgerai/docs/supabase/NORMALIZED_SCHEMA_MIGRATION.sql`

This creates:
- All 12 normalized tables
- RLS policies
- Helper functions
- Bootstrap function
- Indexes

**Warning**: This is a large migration. Review it before running.

---

## After Fix Works

Once registration works without errors:

1. Complete the profile wizard
2. Add some test data (income, expenses)
3. Verify data appears in both:
   - `user_data` table (legacy)
   - Normalized tables (new)
4. Logout and login
5. Verify data persists

Then proceed with full Phase 2 testing.

---

## Troubleshooting

### Still Getting 404 After Creating Function

1. Check function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'create_household_for_new_user';
   ```

2. Check function permissions:
   ```sql
   SELECT routine_name, security_type 
   FROM information_schema.routines 
   WHERE routine_name = 'create_household_for_new_user';
   ```
   **Expected**: `security_type = DEFINER`

3. Try calling the function manually (as authenticated user):
   ```sql
   SELECT create_household_for_new_user('Test Family', 'Test User');
   ```

### Getting "User already has a household" Error

The user already has a profile. Delete it:

```sql
DELETE FROM user_profiles WHERE email = 'YOUR_EMAIL@example.com';
-- This will cascade delete household_members and household
```

### Getting "Not authenticated" Error

The function requires an authenticated user. Make sure you're calling it from the client (not SQL Editor) after the user has signed in.

---

## Summary

✅ **Do this NOW**:
1. Run `RUN_THIS_FIRST.sql` in Supabase SQL Editor
2. Delete test user from Auth
3. Register again and test

✅ **Expected**:
- No 404 errors
- Bootstrap succeeds
- Profile wizard appears
- Data is saved correctly

⏳ **After this works**:
- Proceed with Phase 2 testing
- Test dual-write functionality
- Verify data in both systems
