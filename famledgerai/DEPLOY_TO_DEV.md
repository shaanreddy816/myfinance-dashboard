# Deploy to Dev Environment

## Quick Deploy Steps

### Option 1: Git Push (Recommended - Auto Deploy)

If your Vercel project is connected to Git, just push the changes:

```bash
cd famledgerai

# Add all changes
git add .

# Commit with a descriptive message
git commit -m "fix: Add emailRedirectTo for correct email verification redirect"

# Push to your branch
git push origin feature/stress-testing-layer
```

Vercel will automatically deploy to dev when you push.

### Option 2: Vercel CLI (Manual Deploy)

If Vercel CLI has path issues, try this:

```bash
# Navigate to the correct directory
cd C:\Users\bhati\OneDrive\Documents\GitHub\myfinance-dashboard\famledgerai

# Deploy to preview (dev)
vercel

# Or deploy to production
vercel --prod
```

### Option 3: Vercel Dashboard (Web UI)

1. Go to https://vercel.com/dashboard
2. Find your project: `myfinance-dashboard`
3. Click on the project
4. Go to "Deployments" tab
5. Click "Redeploy" on the latest deployment
6. Select "Use existing Build Cache" → No
7. Click "Redeploy"

## What Changed

The following files were modified:

1. **index.html** (3 changes):
   - Added `emailRedirectTo: window.location.origin` to fix email redirect
   - Added detailed logging for profile completion check
   - Added logging for new user data loading

2. **New documentation files** (for reference):
   - `DEPLOY_PHASE2_FIX.md`
   - `SUPABASE_CONFIG_CHECKLIST.md`
   - `docs/errors-and-fixes/EMAIL_REDIRECT_URL_FIX.md`
   - `docs/errors-and-fixes/PHASE2_REGISTRATION_FIX.md`
   - `docs/testing/PHASE2_DUAL_WRITE_TEST_GUIDE.md`

## After Deployment

### Test on Dev

1. Open https://dev.famledgerai.com/ in incognito browser
2. Register with a NEW email (never used before)
3. Check email and click verification link
4. **Expected**: Redirects to `https://dev.famledgerai.com/#access_token=...`
5. **Expected**: Profile wizard appears (NOT dashboard)

### Check Console Logs

Open browser DevTools (F12) and look for:

```
🏠 Bootstrapping household: ...
✅ Household context loaded
📝 No legacy data found (new user) - will use empty profile
🔍 Profile completion check: { hasWizardFlag: false, hasBasicInfo: false, profileComplete: false, ... }
📝 Profile incomplete → showing wizard
```

### If It Works on Dev

Then deploy to production:

```bash
git push origin feature/stress-testing-layer
# Or merge to main branch
```

## Troubleshooting

### Vercel CLI Path Error

If you get "path does not exist" error:

1. Delete `.vercel` folder:
   ```bash
   rm -rf .vercel
   ```

2. Re-link the project:
   ```bash
   vercel link
   ```

3. Try deploying again:
   ```bash
   vercel
   ```

### Changes Not Showing After Deploy

1. Clear browser cache (Ctrl+Shift+Delete)
2. Open in incognito/private window
3. Check Vercel deployment logs to confirm deployment succeeded
4. Verify the changes in browser DevTools → Sources tab

### Still Redirecting to Wrong Domain

1. Verify Supabase redirect URLs are saved
2. Check that deployment succeeded
3. Try with a completely new email (never registered before)
4. Check the verification email link - it should contain the correct domain

## Current Status

✅ Code changes made
✅ Supabase redirect URLs configured
⏳ Pending: Deploy to dev
⏳ Pending: Test on dev
⏳ Pending: Deploy to production (after successful dev test)
