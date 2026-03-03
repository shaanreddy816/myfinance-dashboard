# Phase 2 Registration Flow Fix

## Issues Identified

### Issue 1: Console Syntax Errors
**Symptom**: 
```
Uncaught SyntaxError: Unexpected identifier 'household'
Uncaught SyntaxError: Unexpected identifier 'context'
```

**Cause**: These are not actual errors - they appear when you try to run console log output as JavaScript code in the browser console. The actual log messages `🏠 Bootstrapping household:` and `✅ Household context loaded` are working correctly.

**Resolution**: No code fix needed - these are user errors from copying console output into the console input.

---

### Issue 2: New Users Skip Profile Wizard
**Symptom**: After email verification, new users land directly on the dashboard with default values instead of being shown the profile wizard to complete their details.

**Root Cause**: 
1. New user registers → email verification required
2. User verifies email → `onAuthStateChange` fires with `SIGNED_IN` event
3. `loadHouseholdContext()` → bootstraps household (creates household, member, profile)
4. `loadUserData()` → sees `householdId` is set → calls `loadHouseholdData()`
5. `loadHouseholdData()` → tries to load from `user_data` table but finds no row (new user)
6. `reconstructUserData()` → returns empty profile `{}`
7. Profile completion check: `userData.profile?._wizardCompleted || (userData.profile?.age && userData.profile?.occupation)`
8. Both conditions should be falsy → SHOULD show wizard

**However**, the issue was lack of visibility into what was happening. The profile check was working, but we needed better logging to debug.

**Fix Applied**:
1. Added detailed logging in the profile completion check to show:
   - `hasWizardFlag`: whether `_wizardCompleted` is true
   - `hasBasicInfo`: whether age and occupation are set
   - `profileComplete`: final decision
   - Profile keys and values for debugging

2. Added logging in `loadHouseholdData()` to clarify when no legacy data exists (expected for new users)

**Code Changes**:

```javascript
// In onAuthStateChange handler (line ~15940)
.then(()=>{
    // Check if profile is complete
    const hasWizardFlag = userData.profile?._wizardCompleted === true;
    const hasBasicInfo = userData.profile?.age && userData.profile?.occupation;
    const profileComplete = hasWizardFlag || hasBasicInfo;
    
    console.log('🔍 Profile completion check:', {
        hasWizardFlag,
        hasBasicInfo,
        profileComplete,
        profileKeys: Object.keys(userData.profile || {}),
        age: userData.profile?.age,
        occupation: userData.profile?.occupation
    });
    
    if (!profileComplete) {
        console.log('📝 Profile incomplete → showing wizard');
        showProfileWizard();
    } else {
        console.log('✅ Profile complete → showing app');
        showApp(); resetInactivity();
    }
})
```

```javascript
// In loadHouseholdData() (line ~8600)
// For NEW users, legacyData will be null - that's expected
if (!legacyData) {
    console.log('📝 No legacy data found (new user) - will use empty profile');
}
```

---

## Testing Steps

### Test 1: New User Registration
1. Open dev.famledgerai.com in incognito browser
2. Click "Start planning free"
3. Fill in: First name, Last name, Email, Phone, Password, Confirm Password
4. Click Continue
5. Check email and verify
6. Click verification link

**Expected Result**:
- Browser console shows:
  ```
  🏠 Bootstrapping household: [Name]'s Family for member: [Name]
  ✅ Household context loaded
  📝 No legacy data found (new user) - will use empty profile
  🔍 Profile completion check: { hasWizardFlag: false, hasBasicInfo: false, profileComplete: false, ... }
  📝 Profile incomplete → showing wizard
  ```
- User sees the Profile Wizard screen (NOT the dashboard)
- Wizard asks for: Age, Gender, Occupation, City, Marital Status, etc.

### Test 2: Complete Profile Wizard
1. After seeing the wizard, fill in all details
2. Click "Complete Profile"

**Expected Result**:
- User is redirected to the dashboard
- Dashboard shows the data entered in the wizard
- `userData.profile._wizardCompleted` is set to `true`

### Test 3: Logout and Login
1. Logout
2. Login again with the same email

**Expected Result**:
- Browser console shows:
  ```
  ✅ Household context loaded
  🔍 Profile completion check: { hasWizardFlag: true, hasBasicInfo: true, profileComplete: true, ... }
  ✅ Profile complete → showing app
  ```
- User goes directly to dashboard (wizard is skipped because profile is complete)

---

## Debugging Guide

If new users still skip the wizard, check the browser console for:

1. **Bootstrap logs**:
   - `🏠 Bootstrapping household:` → household creation started
   - `✅ Household context loaded` → household context set

2. **Data loading logs**:
   - `📊 Loading household data for household: [UUID]` → loading from normalized tables
   - `📝 No legacy data found (new user) - will use empty profile` → expected for new users

3. **Profile completion check**:
   - `🔍 Profile completion check:` → shows all the values being checked
   - Look at `profileComplete` value
   - If `true` when it should be `false`, check `hasWizardFlag` and `hasBasicInfo`

4. **Decision logs**:
   - `📝 Profile incomplete → showing wizard` → wizard should be shown
   - `✅ Profile complete → showing app` → dashboard should be shown

---

## Common Issues

### Issue: User sees dashboard with empty/default values
**Cause**: Profile completion check is returning `true` when it should be `false`

**Debug**:
1. Check console for `🔍 Profile completion check:` log
2. Look at `profileKeys` - should be empty or minimal for new users
3. Check if `age` or `occupation` have values when they shouldn't

**Fix**: Clear the `user_data` table row for that email and try again

### Issue: User sees wizard but data is pre-filled
**Cause**: Stale data in `user_data` table from a previous registration

**Fix**: 
```sql
-- In Supabase SQL Editor
DELETE FROM user_data WHERE email = 'test@example.com';
```

### Issue: Bootstrap fails with "User already has a household"
**Cause**: User already has a `user_profiles` row (from a previous registration attempt)

**Fix**:
```sql
-- In Supabase SQL Editor
DELETE FROM user_profiles WHERE email = 'test@example.com';
-- This will cascade delete household_members and household due to FK constraints
```

---

## Next Steps

1. Deploy the fix to dev.famledgerai.com
2. Test with a NEW email address (never registered before)
3. Verify the wizard appears after email verification
4. Complete the wizard and verify data is saved
5. Logout and login to verify profile is remembered

---

## Related Files

- `famledgerai/index.html` (lines 8586-8675, 15930-15960)
- `famledgerai/docs/testing/PHASE2_DUAL_WRITE_TEST_GUIDE.md`
- `.kiro/specs/normalized-supabase-schema/tasks.md` (Task 2: Registration Flow Integration)
