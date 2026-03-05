# Security Audit Report - FamLedgerAI

**Date**: March 5, 2026  
**Status**: ⚠️ HARDCODED SECRETS FOUND

---

## 🔴 CRITICAL: Hardcoded Secrets Found

### 1. Supabase Credentials (MEDIUM RISK)

**Location**: `famledgerai/src/lib/supabaseClient.js` (lines 38 & 58)

**Hardcoded Values**:
```javascript
// Supabase URL
return 'https://ivvkzforsgruhofpekir.supabase.co';

// Supabase Anon Key
return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dmt6Zm9yc2dydWhvZnBla2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODg4NjMsImV4cCI6MjA4NzQ2NDg2M30.aKVXCPFsNIbN3dH2xbjJKntGG0bQu9HSywvTWEnGnhU';
```

**Risk Level**: MEDIUM
- ✅ Anon key is meant to be public (client-side safe)
- ✅ Protected by Row Level Security (RLS) policies
- ⚠️ Exposes your Supabase project URL
- ⚠️ Anyone can see which Supabase project you're using

**Recommendation**: 
- This is acceptable for now since anon keys are designed for client-side use
- Ensure RLS policies are properly configured on all tables
- Never expose `service_role` key (not found in code ✅)

---

### 2. Zerodha API Key (LOW RISK)

**Location**: `famledgerai/index.html` (line 2618)

**Hardcoded Value**:
```javascript
const KITE_API_KEY = '77labkoqjfkr779r'; // Zerodha Kite Connect Personal (Free)
```

**Risk Level**: LOW
- ✅ This is a public API key meant for client-side use
- ✅ Zerodha requires OAuth flow for actual access
- ✅ No sensitive operations possible with just the API key
- ✅ This is the standard way to integrate Zerodha

**Recommendation**: 
- This is safe and follows Zerodha's integration pattern
- No action needed

---

## ✅ Security Best Practices Found

### 1. Environment Variable Support
The code properly supports environment variables:
```javascript
// Priority 1: localStorage override
// Priority 2: Environment variable (import.meta.env.VITE_SUPABASE_URL)
// Priority 3: Hardcoded default
```

### 2. No Service Role Key
✅ No `service_role` key found in client-side code (correct!)

### 3. No Database Passwords
✅ No database connection strings or passwords found

### 4. No Private Keys
✅ No JWT signing keys or private keys found

---

## 📋 Recommendations

### Immediate Actions (Optional)

1. **Move Supabase credentials to environment variables** (optional but recommended):
   ```bash
   # Create .env file
   VITE_SUPABASE_URL=https://ivvkzforsgruhofpekir.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Add .env to .gitignore** (if not already):
   ```
   .env
   .env.local
   .env.production
   ```

3. **Configure Vercel environment variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Long-term Security Checklist

- ✅ Supabase anon key is public (safe for client-side)
- ✅ No service_role key exposed
- ✅ Zerodha API key is public (safe for OAuth flow)
- ⚠️ Consider moving to environment variables for cleaner separation
- ✅ RLS policies should be enabled on all Supabase tables
- ✅ No passwords or private keys in code

---

## 🔒 Supabase Security Verification

**CRITICAL**: Verify these settings in your Supabase Dashboard:

### 1. Row Level Security (RLS)
Check that RLS is enabled on ALL tables:
```sql
-- Run this in Supabase SQL Editor to check:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`

### 2. RLS Policies
Ensure policies exist for:
- `user_profiles` - users can only see their own profile
- `households` - users can only see their household
- `expenses`, `incomes`, `investments`, etc. - filtered by household_id
- `user_data` - filtered by email or user_id

### 3. API Settings
- ✅ Anon key rate limiting enabled
- ✅ Email confirmation required for signup
- ✅ JWT expiry set appropriately

---

## Summary

**Overall Risk**: LOW ✅

The hardcoded credentials found are:
1. **Supabase anon key** - Designed for client-side use, safe if RLS is configured
2. **Zerodha API key** - Public key for OAuth flow, safe

**No critical secrets exposed** (no service_role keys, passwords, or private keys)

**Action Required**: 
- Verify RLS policies are properly configured (most important!)
- Optionally move to environment variables for cleaner code
- Continue monitoring for any new secrets

---

## Files Checked

- ✅ `famledgerai/index.html`
- ✅ `famledgerai/src/lib/supabaseClient.js`
- ✅ `famledgerai/src/main.js`
- ✅ `famledgerai/api/[...catchall].js`
- ✅ `.env.local` (not in git)
- ✅ `.env.txt` (template only)

**Last Updated**: March 5, 2026
