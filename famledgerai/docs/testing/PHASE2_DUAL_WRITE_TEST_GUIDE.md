# Phase 2 Dual-Write Testing Guide

## Overview
This guide walks you through testing the normalized schema dual-write implementation. The system should write to BOTH `user_data` (legacy) and normalized tables simultaneously.

## Prerequisites
- ✅ Database schema migration completed (all 12 tables created)
- ✅ `household_id` columns added to `expenses` and `insurance_policies`
- ✅ Phase 2 client code deployed to dev.famledgerai.com

## Test Plan

### Test 1: New User Registration & Bootstrap

**Goal**: Verify that new users get a household created automatically.

**Steps**:
1. Open dev.famledgerai.com in an incognito/private browser window
2. Click "Sign Up" or "Register"
3. Register with a NEW email (e.g., `test-phase2-[timestamp]@example.com`)
4. Complete registration

**Expected Results**:
- ✅ Registration succeeds without errors
- ✅ User is logged in and sees the dashboard
- ✅ Browser console shows: `🏠 Bootstrapping household:` message
- ✅ Browser console shows: `✅ Household context loaded`

**Database Verification** (run in Supabase SQL Editor):
```sql
-- Replace with your test email
SELECT 
  up.email,
  up.role,
  h.name as household_name,
  hm.name as member_name,
  hm.role as member_role
FROM user_profiles up
JOIN households h ON up.household_id = h.id
JOIN household_members hm ON up.member_id = hm.id
WHERE up.email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected**: 1 row showing your test user linked to a household with role='owner'

---

### Test 2: Add Income Data

**Goal**: Verify income data is written to both systems.

**Steps**:
1. While logged in as your test user, navigate to the Income section
2. Add income data:
   - Husband salary: ₹100,000
   - Wife salary: ₹80,000
   - Rental income: ₹20,000
3. Wait 2 seconds (for debounce save)

**Expected Results**:
- ✅ Income values appear in the UI
- ✅ No console errors

**Database Verification**:
```sql
-- Check normalized table
SELECT 
  i.type,
  i.amount,
  i.frequency,
  hm.name as member_name
FROM incomes i
JOIN household_members hm ON i.member_id = hm.id
JOIN user_profiles up ON i.household_id = up.household_id
WHERE up.email = 'YOUR_TEST_EMAIL@example.com';

-- Check legacy table
SELECT 
  email,
  data->'income' as income_data
FROM user_data
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected**: 
- Normalized table: 3 rows (husband, wife, rental)
- Legacy table: JSON with income.husband, income.wife, income.rental

---

### Test 3: Add Expenses

**Goal**: Verify expenses are written to both systems.

**Steps**:
1. Navigate to Expenses section
2. Add a few expenses for the current month:
   - Groceries: ₹15,000 (Self)
   - Rent: ₹30,000 (Self)
   - School fees: ₹10,000 (Spouse)
3. Wait 2 seconds

**Expected Results**:
- ✅ Expenses appear in the UI
- ✅ No console errors

**Database Verification**:
```sql
-- Check normalized table
SELECT 
  e.category,
  e.amount,
  e.month,
  hm.name as member_name
FROM expenses e
JOIN household_members hm ON e.member_id = hm.id
JOIN user_profiles up ON e.household_id = up.household_id
WHERE up.email = 'YOUR_TEST_EMAIL@example.com'
ORDER BY e.created_at DESC;

-- Check legacy table
SELECT 
  email,
  jsonb_pretty(data->'expenses'->'byMonth') as expenses_by_month
FROM user_data
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected**: 
- Normalized table: 3 rows with correct member_id
- Legacy table: JSON with expenses.byMonth[YYYY-MM].byMember structure

---

### Test 4: Add Investments

**Goal**: Verify investments are written to both systems.

**Steps**:
1. Navigate to Investments section
2. Add investments:
   - Mutual Fund: "HDFC Equity Fund" - ₹500,000 (Self)
   - Stock: "Reliance" - ₹200,000 (Spouse)
   - FD: "SBI FD" - ₹300,000 (Self)
3. Wait 2 seconds

**Expected Results**:
- ✅ Investments appear in the UI
- ✅ No console errors

**Database Verification**:
```sql
-- Check normalized table
SELECT 
  i.type,
  i.name,
  i.value,
  hm.name as member_name
FROM investments i
JOIN household_members hm ON i.member_id = hm.id
JOIN user_profiles up ON i.household_id = up.household_id
WHERE up.email = 'YOUR_TEST_EMAIL@example.com'
ORDER BY i.created_at DESC;

-- Check legacy table
SELECT 
  email,
  jsonb_pretty(data->'investments'->'byMember') as investments_by_member
FROM user_data
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected**: 
- Normalized table: 3 rows with correct type and member_id
- Legacy table: JSON with investments.byMember[memberId].mutualFunds/stocks/fd arrays

---

### Test 5: Add Loans

**Goal**: Verify loans are written to both systems.

**Steps**:
1. Navigate to Loans section
2. Add a loan:
   - Type: Home Loan
   - Outstanding: ₹5,000,000
   - Rate: 8.5%
   - EMI: ₹45,000
3. Wait 2 seconds

**Expected Results**:
- ✅ Loan appears in the UI
- ✅ No console errors

**Database Verification**:
```sql
-- Check normalized table
SELECT 
  l.type,
  l.outstanding,
  l.rate,
  l.emi,
  hm.name as member_name
FROM loans l
JOIN household_members hm ON l.member_id = hm.id
JOIN user_profiles up ON l.household_id = up.household_id
WHERE up.email = 'YOUR_TEST_EMAIL@example.com';

-- Check legacy table
SELECT 
  email,
  jsonb_pretty(data->'loans'->'byMember') as loans_by_member
FROM user_data
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected**: 
- Normalized table: 1 row with loan details
- Legacy table: JSON with loans.byMember[memberId] array

---

### Test 6: Add Insurance

**Goal**: Verify insurance policies are written to both systems.

**Steps**:
1. Navigate to Insurance section
2. Add insurance policies:
   - Term Insurance: ₹10,000,000 cover (Self)
   - Health Insurance: ₹500,000 cover (Family)
3. Wait 2 seconds

**Expected Results**:
- ✅ Insurance policies appear in the UI
- ✅ No console errors

**Database Verification**:
```sql
-- Check normalized table
SELECT 
  ip.type,
  ip.cover_amount,
  ip.premium,
  hm.name as member_name
FROM insurance_policies ip
JOIN household_members hm ON ip.member_id = hm.id
JOIN user_profiles up ON ip.household_id = up.household_id
WHERE up.email = 'YOUR_TEST_EMAIL@example.com';

-- Check legacy table
SELECT 
  email,
  jsonb_pretty(data->'insurance'->'byMember') as insurance_by_member
FROM user_data
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected**: 
- Normalized table: 2 rows with insurance details
- Legacy table: JSON with insurance.byMember[memberId].term/health arrays

---

### Test 7: Edit & Delete Operations

**Goal**: Verify CRUD operations sync to both systems.

**Steps**:
1. Edit one of the investments (change value)
2. Delete one expense
3. Wait 2 seconds after each operation

**Expected Results**:
- ✅ Changes appear in the UI immediately
- ✅ No console errors

**Database Verification**:
```sql
-- Check that the investment value changed in normalized table
SELECT 
  i.name,
  i.value,
  i.updated_at
FROM investments i
JOIN user_profiles up ON i.household_id = up.household_id
WHERE up.email = 'YOUR_TEST_EMAIL@example.com'
ORDER BY i.updated_at DESC;

-- Check that expense was deleted from normalized table
SELECT COUNT(*) as expense_count
FROM expenses e
JOIN user_profiles up ON e.household_id = up.household_id
WHERE up.email = 'YOUR_TEST_EMAIL@example.com';

-- Verify legacy table also updated
SELECT 
  jsonb_array_length(data->'expenses'->'byMonth'->to_char(now(), 'YYYY-MM')->'byMember'->'self') as expense_count
FROM user_data
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

**Expected**: Both systems show the same updated/deleted data

---

### Test 8: Logout & Login (Data Persistence)

**Goal**: Verify data loads correctly from normalized tables after logout/login.

**Steps**:
1. Note down the total values (income, expenses, investments, loans, insurance)
2. Click Logout
3. Login again with the same test email
4. Wait for dashboard to load

**Expected Results**:
- ✅ Login succeeds
- ✅ Browser console shows: `✅ Household context loaded`
- ✅ Browser console shows: `📊 Loaded household data from normalized tables`
- ✅ All data appears exactly as before logout
- ✅ All totals match the noted values
- ✅ No console errors

**Database Verification**:
```sql
-- Verify load path is using normalized tables (check browser console)
-- Should see: "📊 Loaded household data from normalized tables"
```

---

### Test 9: RLS Isolation (Multi-User Test)

**Goal**: Verify users can only see their own household data.

**Steps**:
1. Register a SECOND test user with a different email
2. Add some data for the second user
3. Try to query the first user's data using the second user's session

**Expected Results**:
- ✅ Second user sees only their own data
- ✅ Second user cannot see first user's data
- ✅ RLS policies enforce household isolation

**Database Verification** (run as authenticated user via client):
```javascript
// In browser console while logged in as second user:
const { data, error } = await sb
  .from('incomes')
  .select('*');
console.log('My incomes:', data); // Should only show second user's data
```

**Expected**: Only the logged-in user's household data is returned

---

### Test 10: Existing User Migration

**Goal**: Verify existing users (with user_data but no user_profiles) get bootstrapped.

**Steps**:
1. If you have an existing user in `user_data` table (from before Phase 2):
   - Login with that user
   - Check if bootstrap is triggered
2. OR manually create a test scenario:
   ```sql
   -- Create a user_data row without user_profiles
   INSERT INTO user_data (email, data) VALUES 
   ('existing-user@example.com', '{"profile":{"name":"Existing User"}}'::jsonb);
   ```
3. Login with that email

**Expected Results**:
- ✅ Browser console shows: `🏠 Bootstrapping household:` message
- ✅ User can access the app
- ✅ A new household is created for them

**Database Verification**:
```sql
-- Check that user_profiles was created
SELECT * FROM user_profiles 
WHERE email = 'existing-user@example.com';
```

**Expected**: 1 row created with household_id and member_id

---

## Success Criteria

Phase 2 is successful if:

- ✅ All 10 tests pass without errors
- ✅ Data appears in BOTH `user_data` and normalized tables
- ✅ CRUD operations sync to both systems
- ✅ Logout/login preserves all data
- ✅ RLS policies enforce household isolation
- ✅ No console errors during normal usage
- ✅ Performance is acceptable (no noticeable slowdown)

## Common Issues & Troubleshooting

### Issue: "household_id is null" warning in console
**Solution**: Check that `loadHouseholdContext()` is called before `loadUserData()`

### Issue: Data not appearing after save
**Solution**: Check browser console for errors. Verify `debounceSave()` is being called.

### Issue: RLS permission denied error
**Solution**: Verify user has 'owner' or 'spouse' role in `user_profiles` table

### Issue: Data in normalized tables but not in user_data
**Solution**: Check that `saveUserData()` is still being called (dual-write)

### Issue: Data in user_data but not in normalized tables
**Solution**: Check that `saveNormalizedData()` is being called after `saveUserData()`

---

## Next Steps After Testing

Once all tests pass:
1. Monitor production for 24-48 hours
2. Check for any console errors or user reports
3. Verify data consistency between both systems
4. Proceed to Phase 3 (Cutover) when confident

---

## Rollback Plan

If critical issues are found:
1. Revert client code to use only `loadUserData()` / `saveUserData()`
2. `user_data` table is still intact and up-to-date
3. Normalized tables can be dropped if needed
4. No data loss (dual-write ensures both systems are in sync)
