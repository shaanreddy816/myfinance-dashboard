# Supabase Configuration Checklist for Dev/Prod

## Immediate Action Required

### 1. Whitelist Redirect URLs in Supabase

Go to your Supabase Dashboard:

1. Click on your project
2. Go to **Authentication** (left sidebar)
3. Click **URL Configuration**
4. Under **Redirect URLs**, add these URLs:
   ```
   https://dev.famledgerai.com/**
   https://famledgerai.com/**
   http://localhost:3000/**
   ```
5. Click **Save**

**Why**: Supabase blocks redirects to URLs not in this whitelist for security.

---

### 2. Deploy Updated index.html

The code fix has been applied. Now deploy to dev:

```bash
# If using Vercel
cd famledgerai
vercel --prod

# Or your deployment method
```

**What changed**: Added `emailRedirectTo: window.location.origin` to the `signUp` call so users are redirected back to the domain they registered from.

---

### 3. Test the Fix

1. Open `https://dev.famledgerai.com/` in **incognito browser**
2. Click "Start planning free"
3. Register with a **NEW email** (never used before):
   - Example: `test-redirect-fix-${Date.now()}@gmail.com`
4. Check your email
5. Click the verification link
6. **Expected**: URL should be `https://dev.famledgerai.com/#access_token=...`
7. **Expected**: Profile wizard should appear

---

## If It Still Redirects to Production

### Check 1: Supabase Email Template

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Click **Confirm signup**
3. Look for the confirmation link in the template
4. It should look like:
   ```html
   <a href="{{ .ConfirmationURL }}">Confirm your email</a>
   ```
   OR
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm</a>
   ```

5. **If it's hardcoded** like this:
   ```html
   <a href="https://famledgerai.com/auth/confirm?...">Confirm</a>
   ```
   Change it to use the variable:
   ```html
   <a href="{{ .ConfirmationURL }}">Confirm your email</a>
   ```

---

### Check 2: Site URL Setting

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Check **Site URL** field
3. If it's set to `https://famledgerai.com`, that's the default redirect
4. **For testing**, temporarily change it to `https://dev.famledgerai.com`
5. **Remember to change it back** when done testing

---

### Check 3: Verify Code Deployment

1. Open `https://dev.famledgerai.com/` in browser
2. Open DevTools (F12) → Sources tab
3. Search for `emailRedirectTo` in the code
4. Verify the line exists:
   ```javascript
   emailRedirectTo: window.location.origin
   ```
5. If not found, the deployment didn't work - redeploy

---

## Alternative: Disable Email Confirmation (For Testing Only)

If you just want to test the wizard flow without dealing with emails:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Email** provider
3. Toggle **Confirm email** to **OFF**
4. Click **Save**
5. Now users can register and login immediately without email verification
6. **IMPORTANT**: Turn this back **ON** before going to production!

---

## Long-Term Solution: Separate Supabase Projects

For a production app, you should have:

**Dev Supabase Project**:
- URL: `https://dev-project.supabase.co`
- Site URL: `https://dev.famledgerai.com`
- Used by dev environment

**Production Supabase Project**:
- URL: `https://prod-project.supabase.co`
- Site URL: `https://famledgerai.com`
- Used by production environment

This way, dev and prod are completely isolated.

---

## Current Status

✅ Code fix applied: `emailRedirectTo: window.location.origin`
⏳ Pending: Whitelist URLs in Supabase
⏳ Pending: Deploy to dev.famledgerai.com
⏳ Pending: Test with new email

---

## Next Steps

1. **Right now**: Go to Supabase and whitelist the redirect URLs
2. **Then**: Deploy the updated `index.html` to dev
3. **Then**: Test with a new email
4. **If it works**: Proceed with Phase 2 testing
5. **If it doesn't work**: Share the verification email link with me (I'll check the redirect URL)
