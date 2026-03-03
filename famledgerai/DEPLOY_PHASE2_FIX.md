# Deploy Phase 2 Email Redirect Fix

## Changes Made

1. ✅ Added `emailRedirectTo: window.location.origin` to registration flow
2. ✅ Added detailed logging for profile completion check
3. ✅ Added logging for new user data loading
4. ✅ Supabase redirect URLs whitelisted

## Deploy to Production

### Option 1: Using PowerShell Script (Recommended)

```powershell
cd famledgerai
.\deploy.ps1
```

This will:
- Check environment configuration
- Prompt for confirmation
- Deploy to production (famledgerai.com)

### Option 2: Using Vercel CLI Directly

```bash
cd famledgerai
vercel --prod
```

### Option 3: Deploy to Dev First (Safer)

To deploy to dev.famledgerai.com first for testing:

```bash
cd famledgerai
vercel
```

Then select the dev environment when prompted.

## After Deployment

### Test the Fix

1. Open https://dev.famledgerai.com/ (or production) in incognito browser
2. Register with a NEW email: `test-redirect-${Date.now()}@gmail.com`
3. Check email and click verification link
4. **Expected**: Redirects back to the same domain (dev or prod)
5. **Expected**: Profile wizard appears
6. Complete the wizard
7. Logout and login again
8. **Expected**: Dashboard appears (wizard is skipped)

### Check Browser Console

After clicking verification link, you should see:

```
🏠 Bootstrapping household: [Name]'s Family for member: [Name]
✅ Household context loaded
📝 No legacy data found (new user) - will use empty profile
🔍 Profile completion check: { hasWizardFlag: false, hasBasicInfo: false, profileComplete: false, ... }
📝 Profile incomplete → showing wizard
```

## Troubleshooting

### If verification still redirects to wrong domain:

1. Check that Supabase redirect URLs are saved:
   - https://dev.famledgerai.com/**
   - https://famledgerai.com/**

2. Check deployment succeeded:
   - Open browser DevTools → Sources
   - Search for `emailRedirectTo`
   - Verify the line exists in the deployed code

3. Clear browser cache and try again

### If wizard still doesn't appear:

1. Check browser console for the profile completion check log
2. Look at the values:
   - `hasWizardFlag` should be `false`
   - `hasBasicInfo` should be `false`
   - `profileComplete` should be `false`
3. If any are `true` when they shouldn't be, there's stale data in the database

## Rollback Plan

If something goes wrong:

```bash
# Revert to previous deployment
vercel rollback
```

Or manually revert the changes in index.html and redeploy.

## Files Changed

- `famledgerai/index.html` (3 changes):
  1. Line ~9755: Added `emailRedirectTo: window.location.origin`
  2. Line ~15940: Added detailed profile completion logging
  3. Line ~8600: Added new user data loading log

## Next Steps After Successful Deployment

1. ✅ Test registration flow with new email
2. ✅ Verify wizard appears after email verification
3. ✅ Complete wizard and verify data is saved
4. ✅ Test logout/login to verify profile is remembered
5. ✅ Proceed with Phase 2 testing (add income, expenses, etc.)
6. ✅ Verify dual-write to both user_data and normalized tables

## Production Deployment Checklist

Before deploying to production:

- [ ] Tested on dev environment
- [ ] Verified email redirect works correctly
- [ ] Verified wizard appears for new users
- [ ] Verified wizard is skipped for existing users
- [ ] Verified data is saved correctly
- [ ] No console errors
- [ ] Supabase redirect URLs configured
- [ ] .env file has correct credentials

## Support

If you encounter issues:
1. Check browser console for error messages
2. Check Supabase logs for authentication events
3. Verify deployment succeeded (check Vercel dashboard)
4. Test with a completely new email (never registered before)
