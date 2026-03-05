# Testing Setup - Auto Delete User Data

## Problem
When testing registration, if you delete a user from Supabase Auth and register again with the same email, you see old data because the data tables aren't automatically cleaned up.

## Solution
Set up an automatic trigger that deletes all user data when you delete a user from Authentication.

---

## Setup (Do This Once)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Copy and Run This SQL

```sql
-- Auto-delete user data when user is deleted from Auth
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

### Step 3: Click "Run" (or press Ctrl+Enter)

You should see: `Success. No rows returned`

---

## How to Use (After Setup)

### For Testing Registration:

1. **Delete User from Auth**
   - Go to Authentication → Users
   - Find the user (e.g., shanthanreddy5000@gmail.com)
   - Click the three dots (⋮) → Delete user
   - Confirm deletion

2. **Clear Browser Data** (Important!)
   - Press F12 to open DevTools
   - Go to Application tab (Chrome) or Storage tab (Firefox)
   - Clear:
     - Local Storage → Delete all
     - Session Storage → Delete all
     - Cookies → Delete all for famledgerai.com
   - OR use Incognito/Private mode

3. **Register Again**
   - Go to https://famledgerai.com
   - Click "Get Started Free"
   - Register with the same email
   - You'll start with a clean slate! ✅

---

## What Gets Deleted Automatically

When you delete a user from Authentication, the trigger automatically deletes:

✅ User profile data (`user_data` table)
✅ Household information (`households` table)
✅ Family members (`household_members` table)
✅ Income records (`incomes` table)
✅ Expense records (`expenses` table)
✅ Investment records (`investments` table)
✅ Loan records (`loans` table)
✅ Insurance policies (`insurance_policies` table)
✅ Forecast assumptions (`forecast_assumptions` table)
✅ User profile mappings (`user_profiles` table)

---

## Verify It's Working

After deleting a user, run this to verify data is gone:

```sql
-- Replace with your test email
SELECT * FROM public.user_data WHERE email = 'shanthanreddy5000@gmail.com';
SELECT * FROM public.user_profiles WHERE email = 'shanthanreddy5000@gmail.com';
```

Both should return 0 rows.

---

## To Disable Auto-Delete (If Needed)

If you want to disable the automatic deletion:

```sql
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.delete_user_data_on_auth_delete();
```

---

## Important Notes

⚠️ **This is for TESTING/DEVELOPMENT only**
- In production, you should implement a proper "Delete Account" feature in the app
- That feature should handle data deletion gracefully with user confirmation
- Consider implementing "soft delete" (marking as deleted) instead of hard delete

⚠️ **Always clear browser data when testing**
- Even with automatic database cleanup, browser cache can cause issues
- Use Incognito/Private mode for cleanest testing experience

⚠️ **The trigger runs on the database server**
- It works even if you delete users via Supabase Dashboard
- It works even if you delete users via API
- It's automatic and requires no manual intervention

---

## Troubleshooting

**Problem: Still seeing old data after deleting user**

Solution:
1. Verify the trigger is installed:
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_deleted';
   ```
   Should return 1 row.

2. Clear browser data (Local Storage, Session Storage, Cookies)

3. Use Incognito mode for testing

**Problem: Trigger not working**

Solution:
1. Check Supabase logs for errors
2. Re-run the trigger creation SQL
3. Verify you have proper permissions (service role key)
