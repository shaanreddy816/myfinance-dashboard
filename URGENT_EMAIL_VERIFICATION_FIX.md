# 🚨 URGENT: Fix Email Verification Flow

## Issues Found

1. ❌ Email verification redirects to landing page (not profile wizard)
2. ❌ Missing Supabase function: `create_household_for_new_user` (404 error)
3. ❌ SUPABASE_URL undefined error in production

## Quick Fixes Required

### Fix 1: Add Redirect URLs to Supabase (CRITICAL)

**Go to Supabase Dashboard → Authentication → URL Configuration**

Add these redirect URLs:
```
https://famledgerai.com
https://famledgerai.com/?verified=true
https://myfinance-dashboard-delta.vercel.app
https://myfinance-dashboard-delta.vercel.app/?verified=true
```

Set Site URL to:
```
https://famledgerai.com
```

**This is why the redirect goes to landing page - Supabase doesn't recognize the redirect URL!**

---

### Fix 2: Re-create the Missing Supabase Function

The `create_household_for_new_user` function is missing. Run this in Supabase SQL Editor:

```sql
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

---

### Fix 3: Temporary Workaround for Email Verification

Since the redirect isn't working, let's add a manual step:

**After clicking "Confirm your mail" in the email:**

1. You'll land on the homepage
2. Click "Sign In" button
3. Enter your email and password
4. You should then see the profile wizard

This is a workaround until Fix 1 is applied.

---

## Root Cause Analysis

### Why Email Verification Fails:

1. **Supabase Redirect URL Not Whitelisted**
   - When you click the verification link, Supabase tries to redirect to `?verified=true`
   - But this URL isn't in the allowed list
   - So Supabase redirects to the default Site URL (homepage)
   - The `?verified=true` parameter is lost

2. **Missing Database Function**
   - The app tries to create a household for new users
   - But the function doesn't exist in the database
   - This causes the 404 error

3. **Build Configuration Issue**
   - The production build might have environment variable issues
   - But this is secondary to the redirect problem

---

## Testing After Fixes

### Step 1: Apply Fixes
1. Add redirect URLs in Supabase (Fix 1)
2. Create the missing function (Fix 2)

### Step 2: Test Registration
1. Delete the test user from Supabase Auth (data will auto-delete with trigger)
2. Clear browser cache or use Incognito
3. Register again
4. Click verification link in email
5. Should land on profile wizard with success message ✅

### Step 3: Verify Success
- URL should be: `https://famledgerai.com/?verified=true`
- Page should show: "Welcome reddy! Complete Your Profile"
- Toast message: "✅ Email verified! Please complete your profile."
- No console errors

---

## Priority Order

1. **HIGHEST**: Fix 1 (Add redirect URLs) - This fixes the main issue
2. **HIGH**: Fix 2 (Create missing function) - Prevents 404 errors
3. **MEDIUM**: Fix 3 (Workaround) - Use this while waiting for Fix 1

---

## Need Help?

If you're still seeing issues after applying these fixes:

1. Check browser console for errors
2. Verify the redirect URLs are saved in Supabase
3. Confirm the function exists: `SELECT * FROM pg_proc WHERE proname = 'create_household_for_new_user';`
4. Try in Incognito mode to rule out cache issues
