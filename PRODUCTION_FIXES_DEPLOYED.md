# Production Emergency Fixes - Deployment Guide

## Overview
This document describes the emergency fixes applied to resolve critical production issues in FamLedgerAI.

## Issues Fixed

### 1. Email Verification Redirect ✅
**Problem**: After clicking email verification link, users landed on signup page instead of onboarding wizard.

**Fix Applied**:
- Enhanced `checkSession()` to detect `?verified=true` query parameter
- Show congratulations modal after email verification
- Automatically proceed to profile wizard after 2.8 seconds
- Clear query parameter from URL for clean UX

**Files Changed**:
- `famledgerai/index.html` (lines 9441-9550)

### 2. Missing Supabase Function ✅
**Problem**: 404 error when calling `create_household_for_new_user` function.

**Fix Applied**:
- Created SQL migration to add the missing function
- Function creates household, member, profile, and forecast assumptions
- Includes proper RLS and security definer settings

**Files Changed**:
- `famledgerai/docs/supabase/migrations/001_create_household_bootstrap_function.sql` (new file)

### 3. Data Leak Between Users ✅
**Problem**: New users sometimes saw previous user's financial data.

**Fix Applied**:
- Added `validateDataOwnership()` function to check auth UID matches
- Added `resetUserState()` function for comprehensive state cleanup
- Enhanced stale data detection (checks if account < 1 hour old with existing data)
- Improved logout to use centralized reset function
- Updated `onAuthStateChange` SIGNED_OUT handler

**Files Changed**:
- `famledgerai/index.html` (added data guard functions, updated loadUserData, logout, auth state handler)

---

## Deployment Steps

### Step 1: Supabase Configuration (5 minutes)

#### A. Add Redirect URLs
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Ensure these URLs are in the "Redirect URLs" list:
   ```
   https://famledgerai.com/?verified=true
   https://famledgerai.com/**
   https://myfinance-dashboard.vercel.app/**
   ```
3. Set "Site URL" to: `https://famledgerai.com`
4. Click "Save"

#### B. Create Missing Database Function
1. Go to Supabase Dashboard → SQL Editor → New Query
2. Copy and paste the entire contents of:
   `famledgerai/docs/supabase/migrations/001_create_household_bootstrap_function.sql`
3. Click "Run"
4. Verify success: Should see function listed in output

### Step 2: Deploy Code Changes (2 minutes)

```bash
cd famledgerai
git add index.html
git add docs/supabase/migrations/001_create_household_bootstrap_function.sql
git commit -m "Emergency fix: email verification redirect + data leak prevention + missing function"
git push origin main
```

Vercel will automatically deploy (takes ~15 seconds).

### Step 3: Verify Deployment (5 minutes)

1. Wait for Vercel deployment to complete
2. Check deployment URL: https://famledgerai.com
3. Open browser console (F12)
4. Run manual test checklist (see below)

---

## Manual Test Checklist

### Test 1: New User Registration Flow
- [ ] Go to https://famledgerai.com
- [ ] Click "Get Started Free"
- [ ] Fill in registration form (use test email)
- [ ] Submit registration
- [ ] Check email for verification link
- [ ] Click "Confirm your mail" link
- [ ] **Expected**: Lands on app, shows congratulations modal
- [ ] **Expected**: After 2.8 seconds, shows profile wizard
- [ ] **Expected**: URL is clean (no `?verified=true` visible)
- [ ] Complete profile wizard
- [ ] **Expected**: Dashboard shows EMPTY state (no default data)

### Test 2: Data Isolation
- [ ] Complete Test 1 with user A
- [ ] Add some income/expenses for user A
- [ ] Logout
- [ ] Register new user B (different email)
- [ ] Verify email for user B
- [ ] Complete profile wizard for user B
- [ ] **Expected**: Dashboard is EMPTY (no user A's data visible)
- [ ] Check browser console for "DATA GUARD" messages
- [ ] **Expected**: No stale data warnings

### Test 3: Missing Function
- [ ] During Test 1, check browser console
- [ ] **Expected**: No 404 errors for `create_household_for_new_user`
- [ ] **Expected**: Household created successfully

### Test 4: Logout/Login
- [ ] Login as existing user
- [ ] Note their data (income, expenses)
- [ ] Logout
- [ ] **Expected**: Console shows "Resetting user state"
- [ ] Login as different user
- [ ] **Expected**: Only see that user's data

---

## Rollback Plan

If issues occur after deployment:

### Quick Rollback (Vercel)
1. Go to Vercel Dashboard
2. Find previous deployment (before this fix)
3. Click "..." → "Promote to Production"
4. Takes ~10 seconds

### Database Rollback (if needed)
```sql
-- Only if the function causes issues
DROP FUNCTION IF EXISTS public.create_household_for_new_user(TEXT, TEXT);
```

---

## Environment Variables

No changes to environment variables required. Existing vars are sufficient:
- `SUPABASE_URL` (already set)
- `SUPABASE_ANON_KEY` (already set)

---

## Monitoring

### What to Watch
1. **Error Rate**: Check Vercel logs for JavaScript errors
2. **Registration Success Rate**: Monitor new user signups
3. **Console Warnings**: Look for "DATA GUARD" or "STALE DATA" messages
4. **404 Errors**: Should be zero for `create_household_for_new_user`

### Success Metrics
- ✅ New users can complete registration flow
- ✅ Email verification redirects to onboarding
- ✅ No data leaks between users
- ✅ No 404 errors in console
- ✅ Clean state on logout/login

---

## Support

If issues persist:
1. Check Vercel deployment logs
2. Check Supabase logs (Dashboard → Logs)
3. Check browser console for errors
4. Verify Supabase redirect URLs are saved
5. Verify database function exists

---

## Next Steps (After Fixes Are Stable)

1. Add automated tests for registration flow
2. Add monitoring/alerting for data guard violations
3. Plan architecture migration (see MIGRATION_PLAN.md)
4. Implement proper onboarding status tracking in database
