# 🚀 Quick Setup Script - Use This Now!

## Your Situation

You registered before the fix, so no data was saved. The new deployment is still in progress. But you can set up your profile RIGHT NOW with this script!

---

## Step-by-Step Instructions

### 1. Make Sure You're Logged In

- Go to: https://famledgerai.com
- If not logged in, log in with your credentials

### 2. Open Browser Console

- Press **F12** (or right-click → Inspect)
- Click on **Console** tab

### 3. Copy and Paste This Script

```javascript
async function setupProfile() {
    console.log('🚀 Starting profile setup...');
    
    // Check if logged in
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
        alert('❌ Please log in first!');
        return;
    }
    
    console.log('✅ User logged in:', user.email);
    
    // Collect information
    const name = prompt('👤 Enter your full name:', 'Nishank');
    if (!name) { alert('Name is required'); return; }
    
    const age = parseInt(prompt('🎂 Enter your age:', '30'));
    if (!age || age < 18 || age > 100) { alert('Please enter valid age'); return; }
    
    const occupation = prompt('💼 Enter your occupation:', 'Salaried Employee');
    const city = prompt('🏙️ Enter your city:', 'Bangalore');
    
    const monthlyIncome = parseFloat(prompt('💰 Enter your monthly income (₹):', '50000'));
    if (!monthlyIncome || monthlyIncome < 0) { alert('Please enter valid income'); return; }
    
    // WhatsApp number
    const whatsappNumber = prompt('📱 Enter your WhatsApp number (10 digits):', '9876543210');
    const whatsappWithCode = whatsappNumber ? `+91${whatsappNumber}` : null;
    
    // Spouse details
    const hasSpouse = confirm('💑 Are you married?');
    let spouseName = '';
    let spouseIncome = 0;
    
    if (hasSpouse) {
        spouseName = prompt('👥 Enter spouse name:', '');
        if (spouseName) {
            spouseIncome = parseFloat(prompt('💰 Enter spouse monthly income (₹):', '0')) || 0;
        }
    }
    
    // Assets
    const hasSavings = confirm('💵 Do you want to add your savings/assets?');
    let cash = 0, fd = 0, investments = 0;
    
    if (hasSavings) {
        cash = parseFloat(prompt('💵 Cash/Savings (₹):', '100000')) || 0;
        fd = parseFloat(prompt('🏦 Fixed Deposits (₹):', '0')) || 0;
        investments = parseFloat(prompt('📈 Investments/Stocks (₹):', '0')) || 0;
    }
    
    console.log('📝 Creating profile with data...');
    
    // Create userData structure
    const userData = {
        profile: {
            name: name,
            age: age,
            occupation: occupation,
            city: city,
            gender: '',
            maritalStatus: hasSpouse ? 'married' : 'single',
            spouseName: spouseName,
            whatsapp_number: whatsappWithCode,
            liquidSavings: cash,
            termCover: 0,
            familyMembers: [
                { id: 'self', name: name, role: 'self' }
            ]
        },
        income: {
            husband: monthlyIncome,
            wife: spouseIncome,
            rental: 0,
            business: 0,
            other: 0,
            rentalActive: false
        },
        expenses: {
            monthly: [],
            periodic: [],
            byMember: {},
            byMonth: {}
        },
        investments: {
            mutualFunds: [],
            stocks: investments > 0 ? [{ name: 'Investments', amount: investments, date: new Date().toISOString() }] : [],
            fd: fd > 0 ? [{ name: 'Fixed Deposit', amount: fd, rate: 6.5, maturityDate: '' }] : [],
            ppf: []
        },
        loans: [],
        insurance: {
            term: [],
            health: [],
            vehicle: []
        },
        schemes: [],
        bank_accounts: []
    };
    
    // Add spouse to family members
    if (spouseName) {
        userData.profile.familyMembers.push({
            id: 'spouse',
            name: spouseName,
            role: 'spouse'
        });
    }
    
    console.log('💾 Saving to Supabase...');
    
    // Save to user_data table
    const { error: saveError } = await window.supabase
        .from('user_data')
        .upsert({
            email: user.email,
            profile: userData.profile,
            income: userData.income,
            expenses: userData.expenses,
            investments: userData.investments,
            loans: userData.loans,
            insurance: userData.insurance,
            schemes: userData.schemes,
            bank_accounts: userData.bank_accounts
        }, { onConflict: 'email' });
    
    if (saveError) {
        console.error('❌ Save error:', saveError);
        alert('❌ Error saving: ' + saveError.message);
        return;
    }
    
    console.log('✅ Saved to user_data table');
    
    // Update user metadata
    const { error: metaError } = await window.supabase.auth.updateUser({
        data: {
            name: name,
            age: age,
            occupation: occupation,
            whatsapp_number: whatsappWithCode,
            onboarding_completed: true,
            onboarding_date: new Date().toISOString()
        }
    });
    
    if (metaError) {
        console.warn('⚠️ Metadata update warning:', metaError);
    }
    
    console.log('✅ Updated user metadata');
    
    // Mark onboarding as complete
    localStorage.setItem('onboarding_completed', 'true');
    
    console.log('✅ Profile setup complete!');
    alert('✅ Profile created successfully! The page will reload now.');
    
    // Reload page
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Run the setup
setupProfile();
```

### 4. Press Enter

The script will:
1. Ask for your details (name, age, occupation, etc.)
2. Ask for WhatsApp number
3. Ask if you're married (spouse details)
4. Ask about savings/assets
5. Save everything to Supabase
6. Reload the page

### 5. See Your Data!

After the page reloads, you should see:
- ✅ Your name in the profile
- ✅ Income showing in dashboard
- ✅ Assets/savings displayed
- ✅ WhatsApp number saved
- ✅ No more "No WhatsApp number" popup

---

## If Script Doesn't Work

### Check if Supabase is Available

Run this first:
```javascript
console.log('Supabase:', typeof window.supabase);
console.log('sb:', typeof window.sb);
```

Should show: `Supabase: object` and `sb: object`

If it shows `undefined`:
1. Hard refresh: **Ctrl + Shift + R**
2. Wait 2 minutes for deployment
3. Try again

---

## Alternative: Minimal Setup

If you just want to get started quickly:

```javascript
async function quickStart() {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) { alert('Not logged in'); return; }
    
    await window.supabase.from('user_data').upsert({
        email: user.email,
        profile: { 
            name: 'Nishank', 
            age: 30, 
            occupation: 'Professional',
            whatsapp_number: '+919876543210',
            familyMembers: [{ id: 'self', name: 'Nishank', role: 'self' }]
        },
        income: { husband: 50000, wife: 0, rental: 0, rentalActive: false },
        expenses: { monthly: [], periodic: [], byMember: {}, byMonth: {} },
        investments: { mutualFunds: [], stocks: [], fd: [], ppf: [] },
        loans: [],
        insurance: { term: [], health: [], vehicle: [] },
        schemes: [],
        bank_accounts: []
    }, { onConflict: 'email' });
    
    localStorage.setItem('onboarding_completed', 'true');
    alert('✅ Done! Refreshing...');
    location.reload();
}

quickStart();
```

Just edit the values (name, age, phone number, income) and run it!

---

## About Those Errors

The errors you're seeing are:
1. **background.js errors** - Browser extension errors (not your app)
2. **manifest.json errors** - Will be fixed after deployment completes
3. **Zerodha 404** - Normal, you haven't connected Zerodha yet

These won't affect the profile setup script!

---

## After Setup

Once your profile is created:
1. ✅ Dashboard will show your income
2. ✅ Profile will show your details
3. ✅ WhatsApp number will be saved
4. ✅ You can start adding expenses, investments, etc.

---

**Use the script NOW - don't wait for deployment!** 🚀
