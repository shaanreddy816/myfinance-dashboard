# Email Verification Redirect URL Fix

## Problem

**Symptom**: 
- User registers on `https://dev.famledgerai.com/`
- Receives verification email
- Clicks verification link
- Gets redirected to `https://famledgerai.com/#` (production) instead of dev
- Production site doesn't have Phase 2 code, so wizard doesn't work

## Root Cause

Supabase email templates have a hardcoded redirect URL pointing to production (`https://famledgerai.com`) instead of the environment where the user registered.

## Solution

You need to configure Supabase to use the correct redirect URL for each environment.

### Option 1: Update Supabase Email Templates (Recommended for Dev Testing)

1. Go to Supabase Dashboard
2. Navigate to: **Authentication** → **Email Templates**
3. Find the **Confirm signup** template
4. Look for the confirmation link, it will look like:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
   ```
5. Change `{{ .SiteURL }}` to your dev URL temporarily:
   ```html
   <a href="https://dev.famledgerai.com/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
   ```
6. Click **Save**

**Note**: This will affect ALL users (including production). Revert this after testing.

---

### Option 2: Set Site URL in Supabase Project Settings (Better)

1. Go to Supabase Dashboard
2. Navigate to: **Authentication** → **URL Configuration**
3. Set **Site URL** to: `https://dev.famledgerai.com`
4. Add **Redirect URLs** (whitelist):
   - `https://dev.famledgerai.com/**`
   - `https://famledgerai.com/**`
   - `http://localhost:3000/**` (for local testing)
5. Click **Save**

**Note**: This changes the default redirect for the entire project.

---

### Option 3: Use Different Supabase Projects (Best for Production)

Create separate Supabase projects for dev and production:

**Dev Project**:
- Site URL: `https://dev.famledgerai.com`
- Use dev Supabase keys in dev environment

**Production Project**:
- Site URL: `https://famledgerai.com`
- Use production Supabase keys in production environment

---

### Option 4: Pass Redirect URL During Registration (Quick Fix)

Update the registration code to explicitly pass the redirect URL:

```javascript
// In index.html, find the sb.auth.signUp() call (around line 9752)
const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
        data: { 
            firstName: firstname, 
            lastName: lastname, 
            name: `${firstname} ${lastname}`, 
            phone: fullPhone 
        },
        emailRedirectTo: window.location.origin  // Add this line
    }
});
```

This will redirect users back to the same domain they registered from.

---

## Recommended Approach for Testing

**For immediate testing**, use **Option 4** (pass redirect URL in code):

1. Update the `signUp` call in `index.html`
2. Deploy to dev.famledgerai.com
3. Register with a new email
4. Verification link will redirect back to dev.famledgerai.com

**For long-term**, use **Option 3** (separate Supabase projects) to avoid conflicts between dev and production.

---

## Implementation: Option 4 (Quick Fix)

Let me update the code for you:

### Step 1: Update Registration Handler

Find this code in `index.html` (around line 9752):

```javascript
const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
        data: { firstName: firstname, lastName: lastname, name: `${firstname} ${lastname}`, phone: fullPhone }
    }
});
```

Change it to:

```javascript
const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
        data: { 
            firstName: firstname, 
            lastName: lastname, 
            name: `${firstname} ${lastname}`, 
            phone: fullPhone 
        },
        emailRedirectTo: window.location.origin  // Redirect to same domain
    }
});
```

### Step 2: Verify Supabase Redirect URLs

Make sure both domains are whitelisted in Supabase:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `https://dev.famledgerai.com/**`
   - `https://famledgerai.com/**`

---

## Testing After Fix

1. Clear browser cache and cookies
2. Open `https://dev.famledgerai.com/` in incognito
3. Register with a NEW email
4. Check verification email
5. Click verification link
6. **Expected**: Redirects to `https://dev.famledgerai.com/#access_token=...`
7. **Expected**: Profile wizard appears (not dashboard)

---

## Debugging

If redirect still goes to production:

1. **Check Supabase email template**:
   - Go to Authentication → Email Templates → Confirm signup
   - Verify it uses `{{ .SiteURL }}` or `{{ .ConfirmationURL }}`
   - NOT hardcoded `https://famledgerai.com`

2. **Check browser network tab**:
   - After clicking verification link, check the redirect chain
   - Look for 302/301 redirects
   - See where the final redirect goes

3. **Check Supabase logs**:
   - Go to Supabase Dashboard → Logs
   - Filter by Authentication
   - Look for email confirmation events
   - Check what redirect URL was used

---

## Alternative: Test Locally

If you want to test without email verification:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Email** provider
3. Toggle **Confirm email** to OFF (temporarily)
4. Now users can sign up without email verification
5. Test the wizard flow directly
6. Remember to turn it back ON after testing

---

## Summary

The issue is NOT with the wizard code - it's with the email redirect URL configuration in Supabase. The quickest fix is to add `emailRedirectTo: window.location.origin` to the `signUp` call.

After this fix:
- Dev registrations → redirect to dev
- Production registrations → redirect to production
- Wizard will appear correctly on the right environment
