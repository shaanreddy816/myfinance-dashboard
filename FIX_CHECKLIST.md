# Fix Checklist - Do These Now

## ✅ Step 1: Add Redirect URLs (2 minutes)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Authentication" → "URL Configuration"
4. Under "Redirect URLs", add:
   ```
   https://famledgerai.com/?verified=true
   ```
5. Click "Save"

## ✅ Step 2: Create Missing Function (1 minute)

1. Go to "SQL Editor" → "New Query"
2. Copy and paste this:

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
    IF v_auth_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE auth_uid = v_auth_uid) THEN
        RAISE EXCEPTION 'User already has a household';
    END IF;
    SELECT email INTO v_email FROM auth.users WHERE id = v_auth_uid;
    INSERT INTO public.households (name) VALUES (p_household_name) RETURNING id INTO v_hh_id;
    INSERT INTO public.household_members (household_id, name, role) VALUES (v_hh_id, p_member_name, 'self') RETURNING id INTO v_member_id;
    INSERT INTO public.user_profiles (auth_uid, household_id, member_id, role, email, display_name) VALUES (v_auth_uid, v_hh_id, v_member_id, 'owner', v_email, p_member_name) RETURNING id INTO v_profile_id;
    INSERT INTO public.forecast_assumptions (household_id) VALUES (v_hh_id);
    RETURN jsonb_build_object('household_id', v_hh_id, 'member_id', v_member_id, 'profile_id', v_profile_id);
END;
$$;
```

3. Click "Run"

## ✅ Step 3: Test Again

1. Delete test user from Supabase Auth
2. Clear browser or use Incognito
3. Register new user
4. Click verification link
5. Should work now! ✅

---

## What Each Fix Does

- **Fix 1**: Tells Supabase where to redirect after email verification
- **Fix 2**: Creates the function needed for new user setup

Both are required for email verification to work properly!
