# How to Clear User Data for Testing

## 🚀 ONE-TIME SETUP (Recommended for Testing)

Run this SQL **ONCE** in Supabase SQL Editor to enable automatic cleanup:

```sql
-- This will automatically delete all user data when you delete a user from Auth
CREATE OR REPLACE FUNCTION public.delete_user_data_on_auth_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
    v_household_id UUID;
BEGIN
    v_email := OLD.email;
    
    -- Delete from legacy user_data table
    DELETE FROM public.user_data WHERE email = v_email;
    
    -- Delete from normalized tables
    SELECT household_id INTO v_household_id
    FROM public.user_profiles WHERE email = v_email;
    
    IF v_household_id IS NOT NULL THEN
        DELETE FROM public.expenses WHERE household_id = v_household_id;
        DELETE FROM public.incomes WHERE household_id = v_household_id;
        DELETE FROM public.investments WHERE household_id = v_household_id;
        DELETE FROM public.loans WHERE household_id = v_household_id;
        DELETE FROM public.insurance_policies WHERE household_id = v_household_id;
        DELETE FROM public.forecast_assumptions WHERE household_id = v_household_id;
        DELETE FROM public.household_members WHERE household_id = v_household_id;
        DELETE FROM public.user_profiles WHERE household_id = v_household_id;
        DELETE FROM public.households WHERE id = v_household_id;
    END IF;
    
    RETURN OLD;
END;
$$;

CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_user_data_on_auth_delete();
```

**After running this once, you only need to:**
1. Go to Supabase Dashboard → Authentication → Users
2. Delete the user
3. Done! All data is automatically cleaned up ✅

No need to run SQL queries or delete from multiple places anymore!

---

## 📋 Manual Cleanup (If you don't want automatic deletion)

### Step 1: Delete from Supabase Authentication
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user and click the three dots → Delete user
3. Confirm deletion

### Step 2: Delete from Database Tables

Go to Supabase Dashboard → SQL Editor → New Query

**For a specific email (RECOMMENDED):**

```sql
-- Replace with your email
DELETE FROM public.user_data 
WHERE email = 'shanthanreddy5000@gmail.com';

-- Also clear normalized tables if they exist
DO $$
DECLARE
    v_household_id UUID;
BEGIN
    SELECT household_id INTO v_household_id
    FROM public.user_profiles
    WHERE email = 'shanthanreddy5000@gmail.com';
    
    IF v_household_id IS NOT NULL THEN
        DELETE FROM public.expenses WHERE household_id = v_household_id;
        DELETE FROM public.incomes WHERE household_id = v_household_id;
        DELETE FROM public.investments WHERE household_id = v_household_id;
        DELETE FROM public.loans WHERE household_id = v_household_id;
        DELETE FROM public.insurance_policies WHERE household_id = v_household_id;
        DELETE FROM public.forecast_assumptions WHERE household_id = v_household_id;
        DELETE FROM public.household_members WHERE household_id = v_household_id;
        DELETE FROM public.user_profiles WHERE household_id = v_household_id;
        DELETE FROM public.households WHERE id = v_household_id;
    END IF;
END $$;
```

### Step 3: Clear Browser Data (Important!)

After deleting from database, also clear browser data:

1. Open browser DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Clear:
   - Local Storage → Delete all items
   - Session Storage → Delete all items
   - Cookies → Delete all cookies for famledgerai.com
4. Or simply use Incognito/Private mode for testing

## Why This Happens

The issue occurs because:

1. When you delete a user from Auth, only the authentication record is deleted
2. The user's data in `user_data` table remains
3. When you register again with the same email, the app loads the old data
4. The app tries to detect this with `_authUid` checks, but if the old data doesn't have `_authUid` stamped, it can't detect the mismatch

## The Fix We Implemented

The latest deployment includes:

1. **Stronger stale data detection**: Checks if user was created within last hour AND has data but no `_authUid`
2. **Automatic reset**: If detected, automatically clears the data and starts fresh
3. **Auth UID stamping**: All new data gets stamped with `_authUid` for future detection

## For Production Users

In production, you should NOT delete users from Auth. Instead:

1. Let users delete their account through the app (implement a "Delete Account" feature)
2. That feature should delete both Auth user AND all their data
3. Or implement a "soft delete" that marks data as deleted but keeps it for recovery

## Quick Test Script

If you're testing frequently, save this as a snippet in Supabase SQL Editor:

```sql
-- Quick cleanup for testing (replace email)
DO $$
DECLARE
    v_email TEXT := 'shanthanreddy5000@gmail.com';
    v_household_id UUID;
BEGIN
    -- Delete from legacy table
    DELETE FROM public.user_data WHERE email = v_email;
    
    -- Delete from normalized tables
    SELECT household_id INTO v_household_id
    FROM public.user_profiles WHERE email = v_email;
    
    IF v_household_id IS NOT NULL THEN
        DELETE FROM public.expenses WHERE household_id = v_household_id;
        DELETE FROM public.incomes WHERE household_id = v_household_id;
        DELETE FROM public.investments WHERE household_id = v_household_id;
        DELETE FROM public.loans WHERE household_id = v_household_id;
        DELETE FROM public.insurance_policies WHERE household_id = v_household_id;
        DELETE FROM public.forecast_assumptions WHERE household_id = v_household_id;
        DELETE FROM public.household_members WHERE household_id = v_household_id;
        DELETE FROM public.user_profiles WHERE household_id = v_household_id;
        DELETE FROM public.households WHERE id = v_household_id;
        RAISE NOTICE 'Deleted household data for: %', v_email;
    END IF;
    
    RAISE NOTICE 'Cleanup complete for: %', v_email;
END $$;
```

## Verify Cleanup

After running the cleanup, verify with:

```sql
-- Check if data is gone
SELECT * FROM public.user_data WHERE email = 'shanthanreddy5000@gmail.com';
SELECT * FROM public.user_profiles WHERE email = 'shanthanreddy5000@gmail.com';
```

Both queries should return 0 rows.
