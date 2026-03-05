# Supabase Configuration for Email Verification Fix

## Required Settings

### 1. Authentication → URL Configuration

#### Site URL
```
https://famledgerai.com
```

#### Redirect URLs (Add all of these)
```
https://famledgerai.com
https://famledgerai.com/**
https://famledgerai.com/?verified=true
https://myfinance-dashboard.vercel.app/**
https://myfinance-dashboard-delta.vercel.app/**
http://localhost:5173
http://localhost:5173/?verified=true
```

**Why**: These URLs tell Supabase where it's allowed to redirect users after email verification. Without this, Supabase will reject the redirect and send users to the default Site URL.

---

### 2. Email Templates (Verify Settings)

#### Confirm Signup Template

Go to: Authentication → Email Templates → Confirm signup

**Verify the template includes**:
```html
{{ .ConfirmationURL }}
```

**The URL should look like**:
```
https://famledgerai.com/?verified=true&token=...&type=signup
```

**If it doesn't**, update the template to use the correct redirect URL.

---

### 3. Database Function (Run SQL)

Go to: SQL Editor → New Query

**Copy and paste this entire SQL**:

```sql
-- Create household bootstrap function
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

GRANT EXECUTE ON FUNCTION public.create_household_for_new_user(TEXT, TEXT) TO authenticated;
```

**Click "Run"**

**Verify success**:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_household_for_new_user';
```

Should return 1 row.

---

### 4. Auto-Delete Trigger (Optional but Recommended)

This automatically deletes user data when you delete a user from Auth (useful for testing).

```sql
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
    
    DELETE FROM public.user_data WHERE email = v_email;
    
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

---

## Verification Checklist

After applying all settings:

- [ ] Site URL is set to `https://famledgerai.com`
- [ ] All redirect URLs are added and saved
- [ ] Email template uses `{{ .ConfirmationURL }}`
- [ ] Database function `create_household_for_new_user` exists
- [ ] Auto-delete trigger is installed (optional)

---

## Testing the Configuration

1. Register a new test user
2. Check email for verification link
3. Click the link
4. **Expected**: URL should be `https://famledgerai.com/?verified=true&token=...`
5. **Expected**: App shows congratulations modal
6. **Expected**: Profile wizard appears after 2.8 seconds

If it doesn't work:
- Check browser console for errors
- Verify redirect URLs are saved in Supabase
- Check Supabase logs for any errors
- Try in Incognito mode to rule out cache issues

---

## Common Issues

### Issue: "Invalid redirect URL"
**Solution**: Make sure the exact URL is in the Redirect URLs list, including the `?verified=true` parameter.

### Issue: "Function not found"
**Solution**: Re-run the SQL to create the function. Check for syntax errors.

### Issue: Still landing on signup page
**Solution**: 
1. Clear browser cache
2. Verify Site URL is correct
3. Check that `emailRedirectTo` in code matches allowed URLs
4. Try Incognito mode

---

## Security Notes

- ✅ All secrets are in Vercel environment variables (not in code)
- ✅ Database function uses `SECURITY DEFINER` with proper RLS
- ✅ Only authenticated users can call the function
- ✅ Function validates user doesn't already have a household
- ✅ Redirect URLs are whitelisted (no open redirects)
