# Quick Testing Guide

## 🎯 Goal
Test user registration without seeing old data from previous tests.

---

## ⚡ Quick Setup (One Time Only)

**Copy this SQL → Paste in Supabase SQL Editor → Run:**

```sql
CREATE OR REPLACE FUNCTION public.delete_user_data_on_auth_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_email TEXT; v_household_id UUID;
BEGIN
    v_email := OLD.email;
    DELETE FROM public.user_data WHERE email = v_email;
    SELECT household_id INTO v_household_id FROM public.user_profiles WHERE email = v_email;
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

✅ Done! Now data auto-deletes when you delete a user.

---

## 🧪 Testing Workflow

### Every Time You Test:

1. **Delete User**
   - Supabase Dashboard → Authentication → Users
   - Find user → ⋮ → Delete user

2. **Clear Browser** (Choose one):
   - **Option A**: Use Incognito/Private mode (easiest)
   - **Option B**: F12 → Application → Clear Storage → Clear site data

3. **Test Registration**
   - Go to https://famledgerai.com
   - Register with same email
   - Should see clean slate ✅

---

## 🔍 Quick Verify

Check if data is gone:
```sql
SELECT * FROM public.user_data WHERE email = 'your-test-email@gmail.com';
```
Should return 0 rows.

---

## 💡 Pro Tips

✅ **Use Incognito mode** - Cleanest testing experience
✅ **Use a dedicated test email** - e.g., test+1@gmail.com, test+2@gmail.com
✅ **Check browser console** - Look for "Stale data cleared" messages
✅ **Verify email quickly** - Check spam folder for verification emails

---

## 🐛 If You Still See Old Data

1. ✅ Verify trigger is installed:
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_deleted';
   ```

2. ✅ Clear browser completely (or use Incognito)

3. ✅ Check console logs for "_authUid mismatch" messages

4. ✅ Wait 10-15 seconds after deployment for changes to take effect

---

## 📝 What You're Testing

- ✅ New user registration flow
- ✅ Email verification redirect
- ✅ Profile wizard shows for new users
- ✅ Clean slate (no old data)
- ✅ Dashboard shows empty state for new users

---

## 🚨 Remember

This auto-delete is for **TESTING ONLY**. In production:
- Implement proper "Delete Account" feature in the app
- Add user confirmation dialogs
- Consider soft-delete (mark as deleted, don't actually delete)
- Comply with data retention regulations (GDPR, etc.)
