# 🔄 Data Recovery Guide

## Your Situation

You registered before the fix was deployed, so:
- ✅ Account was created
- ❌ Onboarding data wasn't saved to Supabase
- ❓ Data might be in browser localStorage

---

## Step 1: Check if Data is in localStorage

1. **Open your site:** https://famledgerai.com
2. **Press F12** to open Developer Console
3. **Go to "Application" tab** (or "Storage" in Firefox)
4. **Click "Local Storage"** → `https://famledgerai.com`
5. **Look for these keys:**
   - `pending_onboarding_data`
   - `onboarding_state`
   - `user_data`

### If You See Data:

Run this in Console to view it:
```javascript
// Check pending onboarding data
console.log('Pending data:', localStorage.getItem('pending_onboarding_data'));

// Check onboarding state
console.log('Onboarding state:', localStorage.getItem('onboarding_state'));

// Check user data
console.log('User data:', localStorage.getItem('user_data'));
```

---

## Step 2: Sync Data to Supabase (If Found)

If you found data in localStorage, run this script in Console:

```javascript
// Sync pending onboarding data to Supabase
async function syncPendingData() {
    const pendingData = localStorage.getItem('pending_onboarding_data');
    
    if (!pendingData) {
        console.log('❌ No pending data found');
        return;
    }
    
    try {
        const parsed = JSON.parse(pendingData);
        console.log('📦 Found pending data:', parsed);
        
        // Get current user
        const { data: { user }, error: userError } = await window.supabase.auth.getUser();
        
        if (userError || !user) {
            console.error('❌ Not logged in');
            return;
        }
        
        console.log('✅ User logged in:', user.email);
        
        // Update user metadata
        const { error: updateError } = await window.supabase.auth.updateUser({
            data: {
                ...parsed.data,
                onboarding_completed: true,
                onboarding_date: new Date().toISOString()
            }
        });
        
        if (updateError) {
            console.error('❌ Update error:', updateError);
            return;
        }
        
        console.log('✅ Data synced to Supabase!');
        
        // Clear pending data
        localStorage.removeItem('pending_onboarding_data');
        console.log('✅ Cleared pending data from localStorage');
        
        alert('✅ Your data has been synced! Please refresh the page.');
        
    } catch (e) {
        console.error('❌ Sync error:', e);
    }
}

// Run the sync
syncPendingData();
```

---

## Step 3: If No Data Found (Need to Re-enter)

If there's no data in localStorage, you'll need to complete onboarding again:

### Option A: Trigger Onboarding Manually

Run this in Console:
```javascript
// Clear onboarding completion flag
localStorage.removeItem('onboarding_completed');

// Refresh page
location.reload();
```

This will show the onboarding wizard again.

### Option B: Use Quick Setup

If you don't want to go through full onboarding, run this to set basic data:

```javascript
async function quickSetup() {
    const name = prompt('Enter your name:');
    const age = parseInt(prompt('Enter your age:'));
    const occupation = prompt('Enter your occupation:');
    const monthlyIncome = parseFloat(prompt('Enter monthly income (₹):'));
    
    if (!name || !age || !occupation) {
        alert('❌ Please provide all information');
        return;
    }
    
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
        alert('❌ Not logged in');
        return;
    }
    
    const { error } = await window.supabase.auth.updateUser({
        data: {
            name,
            age,
            occupation,
            monthly_income: monthlyIncome || 0,
            onboarding_completed: true,
            onboarding_date: new Date().toISOString()
        }
    });
    
    if (error) {
        alert('❌ Error: ' + error.message);
        return;
    }
    
    localStorage.setItem('onboarding_completed', 'true');
    alert('✅ Basic profile created! Refreshing...');
    location.reload();
}

quickSetup();
```

---

## Step 4: Verify Data is Saved

After syncing or re-entering data:

1. **Refresh the page**
2. **Check if dashboard shows your data**
3. **Run this to verify:**

```javascript
// Check if data is in Supabase
async function checkSupabaseData() {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user) {
        console.log('❌ Not logged in');
        return;
    }
    
    console.log('User metadata:', user.user_metadata);
    console.log('Onboarding completed:', user.user_metadata?.onboarding_completed);
}

checkSupabaseData();
```

---

## Prevention: For Future Users

The fix is now deployed, so new registrations will:
1. ✅ Save data to localStorage if not logged in
2. ✅ Save data to Supabase if logged in
3. ✅ Auto-sync when user logs in later

---

## Quick Recovery Steps (TL;DR)

1. **Press F12** → Console
2. **Run:** `localStorage.getItem('pending_onboarding_data')`
3. **If data exists:** Run the `syncPendingData()` script above
4. **If no data:** Run `localStorage.removeItem('onboarding_completed')` and refresh
5. **Complete onboarding again**

---

## Need Help?

If none of this works:
1. Share what you see in localStorage (Application tab)
2. Share any console errors
3. I'll help you recover or re-enter the data

---

**Note:** The fix is now live, so this issue won't happen for new registrations!
