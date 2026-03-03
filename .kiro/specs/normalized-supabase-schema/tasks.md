# Tasks

## Phase 2: Dual-Write Implementation (Client-Side)

### Task 1: Data Access Layer (DAL) Foundation

**1.1** Add household context state variables after `let currentUserEmail = '';` in index.html:
```javascript
let householdId = null;
let memberId = null;
let memberMap = {};
```

**1.2** Create `bootstrapHousehold(householdName, memberName)` function that calls `sb.rpc('create_household_for_new_user', ...)` and sets `householdId`, `memberId` from the response.

**1.3** Create `loadHouseholdContext()` function that:
- Queries `user_profiles` for current `auth.uid()`
- If no profile exists, triggers `bootstrapHousehold()` with default household name
- Sets `householdId`, `memberId`, and loads `household_members` into `memberMap`

**1.4** Update the auth state change handler (search for `sb.auth.onAuthStateChange`) to call `loadHouseholdContext()` after successful sign-in, before calling `loadUserData()`.

---

### Task 2: Registration Flow Integration

**2.1** Locate the registration success handler (after `sb.auth.signUp()` succeeds) and add a call to `loadHouseholdContext()` before redirecting to the app.

**2.2** Update the profile wizard completion handler (search for `_wizardCompleted`) to ensure `householdId` is set before saving profile data.

**2.3** Add defensive check in `saveUserData()`: if `householdId` is null, log a warning and skip normalized table writes (legacy path only).

---

### Task 3: Backward-Compatible Data Reconstruction

**3.1** Create `reconstructUserData(profile, members, incomes, expenses, investments, loans, insurance, assumptions)` function that:
- Builds `memberMap` with legacy IDs ('self', 'spouse', 'kid-1', etc.)
- Reconstructs `userData.profile.familyMembers` array from `members`
- Reconstructs `userData.income` from `incomes` rows (aggregate by member)
- Reconstructs `userData.expenses.byMonth.byMember` from `expenses` rows
- Reconstructs `userData.investments.byMember` from `investments` rows grouped by type
- Reconstructs `userData.loans.byMember` from `loans` rows
- Reconstructs `userData.insurance.byMember` from `insurance_policies` rows grouped by type
- Reconstructs `userData.profile.forecastAssumptions` from `assumptions` row
- Calculates `userData.liquidSavings` and `userData.termCover` from aggregated data

**3.2** Add helper function `getLegacyMemberId(memberUuid)` that maps UUID → legacy ID using `memberMap`.

**3.3** Add helper function `getMemberUuid(legacyId)` that maps legacy ID → UUID using `memberMap`.

---

### Task 4: Load Path — Read from Normalized Tables

**4.1** Create `loadHouseholdData()` function that:
- Queries all 9 financial tables in parallel using `Promise.all()` with `household_id` filter
- Queries `forecast_assumptions` for the household
- Calls `reconstructUserData()` to build the legacy `userData` shape
- Sets the global `userData` variable
- Calls `computeCache.invalidate()`

**4.2** Update the existing `loadUserData(email)` function to:
- Check if `householdId` is set
- If yes, call `loadHouseholdData()` (new path)
- If no, use the legacy `sb.from('user_data')` query (fallback for migration period)
- Keep all existing migration logic (`_expenseMigrationV1`, `_monthMigrationV1`, etc.)

---

### Task 5: Save Path — Dual-Write to Both Systems

**5.1** Create `saveTable(tableName, rows, options)` function that:
- Accepts `tableName` ('incomes' | 'expenses' | 'investments' | 'loans' | 'insurance_policies')
- Injects `household_id` into each row from global `householdId`
- Converts legacy member IDs to UUIDs using `getMemberUuid()`
- Performs `sb.from(tableName).upsert(rows, { onConflict: 'id' })`
- Returns `{ data, error }`

**5.2** Create `deleteRow(tableName, rowId)` function that performs `sb.from(tableName).delete().eq('id', rowId)`.

**5.3** Update `saveUserData(email)` to:
- Keep the existing `sb.from('user_data').upsert(...)` call (legacy write)
- Add a comment: `// Dual-write: also save to normalized tables`
- Call `saveNormalizedData()` helper (created in next task)

**5.4** Create `saveNormalizedData()` helper that:
- Checks if `householdId` is set (skip if null)
- Extracts incomes from `userData.income` and calls `saveTable('incomes', ...)`
- Extracts expenses from `userData.expenses.byMonth` and calls `saveTable('expenses', ...)`
- Extracts investments from `userData.investments.byMember` and calls `saveTable('investments', ...)`
- Extracts loans from `userData.loans.byMember` and calls `saveTable('loans', ...)`
- Extracts insurance from `userData.insurance.byMember` and calls `saveTable('insurance_policies', ...)`
- Updates `forecast_assumptions` if `userData.profile.forecastAssumptions` changed

---

### Task 6: CRUD Operations — Incomes

**6.1** Locate the income edit handlers (search for `userData.income.husband`, `userData.income.wife`, `userData.income.rental`) and ensure they trigger `debounceSave()` after edits.

**6.2** Verify that `saveNormalizedData()` correctly maps `userData.income` fields to `incomes` table rows with proper `member_id` and `type` values.

---

### Task 7: CRUD Operations — Expenses

**7.1** Locate the expense add/edit/delete handlers (search for `userData.expenses.byMonth`) and ensure they trigger `debounceSave()`.

**7.2** Verify that `saveNormalizedData()` correctly flattens `userData.expenses.byMonth[month].byMember[memberId][]` into `expenses` table rows with `month`, `member_id`, `category`, `amount`, `is_recurring`.

**7.3** Update `deleteRow()` calls for expenses to use the normalized table row UUID (stored in expense object as `_normalizedId`).

---

### Task 8: CRUD Operations — Investments

**8.1** Locate the investment add/edit/delete handlers (search for `userData.investments.byMember`) and ensure they trigger `debounceSave()`.

**8.2** Verify that `saveNormalizedData()` correctly maps `userData.investments.byMember[memberId].mutualFunds[]` → `investments` rows with `type='mutual_fund'`, and similarly for stocks, fd, ppf.

**8.3** Update delete handlers to use `deleteRow('investments', rowId)`.

---

### Task 9: CRUD Operations — Loans

**9.1** Locate the loan add/edit/delete handlers (search for `userData.loans.byMember`) and ensure they trigger `debounceSave()`.

**9.2** Verify that `saveNormalizedData()` correctly maps `userData.loans.byMember[memberId][]` → `loans` rows with proper `type`, `outstanding`, `rate`, `emi`.

**9.3** Update delete handlers to use `deleteRow('loans', rowId)`.

---

### Task 10: CRUD Operations — Insurance

**10.1** Locate the insurance add/edit/delete handlers (search for `userData.insurance.byMember`) and ensure they trigger `debounceSave()`.

**10.2** Verify that `saveNormalizedData()` correctly maps `userData.insurance.byMember[memberId].term[]` → `insurance_policies` rows with `type='term'`, and similarly for health, vehicle, life, home.

**10.3** Update delete handlers to use `deleteRow('insurance_policies', rowId)`.

---

### Task 11: Household Members Management

**11.1** Locate the family member add handler (search for `userData.profile.familyMembers`) and add logic to:
- Insert a new row into `household_members` table via `sb.from('household_members').insert(...)`
- Update `memberMap` with the new member UUID
- Trigger `debounceSave()`

**11.2** Add a delete handler for family members that:
- Calls `sb.from('household_members').delete().eq('id', memberUuid)`
- Removes the member from `memberMap`
- Triggers `debounceSave()`

---

### Task 12: Forecast Assumptions Sync

**12.1** Locate the forecast assumptions edit handler (search for `userData.profile.forecastAssumptions`) and ensure it triggers `debounceSave()`.

**12.2** Update `saveNormalizedData()` to upsert `forecast_assumptions` row with:
- `inflation_rate = forecastAssumptions.expenseInflation / 100`
- `equity_return = forecastAssumptions.equityReturn / 100`
- `debt_return = forecastAssumptions.debtReturn / 100`
- `salary_growth = forecastAssumptions.incomeGrowth / 100`
- `expense_growth = forecastAssumptions.expenseInflation / 100`
- `retirement_age = forecastAssumptions.retirementAge`
- `life_expectancy = forecastAssumptions.lifeExpectancy`

---

### Task 13: Computed Results Caching (Optional*)

**13.1*** Create `saveComputedResults(type, data)` function that:
- Accepts `type` ('forecasts' | 'risk_scores' | 'stress_results')
- Inserts/updates rows in the corresponding computed table
- Called manually after engine runs (not on every edit)

**13.2*** Add a "Save Forecast" button in the Forecast card UI that calls `saveComputedResults('forecasts', forecastData)`.

**13.3*** Add a "Save Risk Score" button in the Risk card UI that calls `saveComputedResults('risk_scores', riskData)`.

**13.4*** Add a "Save Stress Results" button in the Stress card UI that calls `saveComputedResults('stress_results', stressData)`.

---

### Task 14: Error Handling and Logging

**14.1** Wrap all `sb.from(...).insert/upsert/delete()` calls in try-catch blocks and log errors to console with context (table name, operation, row data).

**14.2** Add a global error handler for RLS permission denied errors (code `42501`) that shows a user-friendly toast: "You don't have permission to edit this data."

**14.3** Add defensive checks in `saveNormalizedData()`: if `householdId` is null, log a warning and skip normalized writes.

---

### Task 15: Testing — Dual-Write Verification

**15.1** Test new user registration:
- Sign up with a new email
- Verify `create_household_for_new_user()` is called
- Verify `householdId` and `memberId` are set
- Add income, expenses, investments, loans, insurance
- Verify data appears in both `user_data` (JSON) and normalized tables

**15.2** Test existing user login:
- Log in with an existing account (has `user_data` row but no `user_profiles` row)
- Verify `bootstrapHousehold()` is triggered
- Verify data is migrated to normalized tables on first save

**15.3** Test CRUD operations:
- Add/edit/delete an investment
- Verify changes appear in both `user_data` and `investments` table
- Verify `debounceSave()` triggers both writes

**15.4** Test family member management:
- Add a new family member
- Verify row appears in `household_members` table
- Add an investment for that member
- Verify `member_id` FK is correct

---

## Phase 3: Cutover (Switch Reads to Normalized Tables)

### Task 16: Switch Read Path

**16.1** Update `loadUserData(email)` to:
- Remove the `householdId` check
- Always call `loadHouseholdData()` (normalized path)
- Remove the legacy `sb.from('user_data')` query
- Keep the fallback for users without `user_profiles` (triggers bootstrap)

**16.2** Test that all existing users can log in and see their data correctly.

---

### Task 17: Stop Dual-Write

**17.1** Remove the `sb.from('user_data').upsert(...)` call from `saveUserData()`.

**17.2** Rename `saveUserData()` to `saveHouseholdData()` for clarity.

**17.3** Update all `debounceSave()` calls to use the new function name.

---

### Task 18: API Layer Changes (catchall.js)

**18.1** Update `resolveUserId(userIdOrEmail)` in `api/[...catchall].js` to:
- Check `user_profiles` table first: `sb.from('user_profiles').select('auth_uid').eq('email', email)`
- Fallback to `user_data` table if not found

**18.2** Create `loadNormalizedUserData(authUid)` helper in catchall.js that:
- Queries `user_profiles` to get `household_id`
- Queries all financial tables for that household
- Reconstructs a `userData`-compatible object for AI prompt context

**18.3** Update AI handlers (`handleAdvice`, `handleBudget`, `handleInvest`, etc.) to:
- Call `loadNormalizedUserData(authUid)` instead of querying `user_data`
- Keep the same prompt structure (AI handlers don't need to know about the schema change)

---

### Task 19: Archive Legacy Table

**19.1** After 48 hours of monitoring with no issues, run in Supabase SQL Editor:
```sql
ALTER TABLE public.user_data RENAME TO user_data_archived;
```

**19.2** Update any remaining references to `user_data` in the codebase to point to `user_data_archived` (for rollback purposes only).

---

## Rollback Plan (If Needed)

### Task 20: Rollback to Legacy System*

**20.1*** Revert client code to use `loadUserData(email)` with `sb.from('user_data')` query.

**20.2*** Remove all `saveNormalizedData()` calls from `saveUserData()`.

**20.3*** Verify that `user_data` table is still intact and up-to-date (it should be, due to dual-write).

**20.4*** Optionally drop normalized tables:
```sql
-- Run CLEANUP_BEFORE_MIGRATION.sql again
```

---

## Testing Checklist

- [ ] New user registration creates household + profile + default assumptions
- [ ] Existing user login triggers bootstrap if no profile exists
- [ ] Income add/edit/delete syncs to both systems
- [ ] Expense add/edit/delete syncs to both systems
- [ ] Investment add/edit/delete syncs to both systems
- [ ] Loan add/edit/delete syncs to both systems
- [ ] Insurance add/edit/delete syncs to both systems
- [ ] Family member add/delete syncs to `household_members` table
- [ ] Forecast assumptions edit syncs to `forecast_assumptions` table
- [ ] RLS policies enforce household isolation (test with 2 different users)
- [ ] RLS policies deny dependent user writes (test with dependent role)
- [ ] Computed results caching works (optional)
- [ ] API handlers can load normalized data for AI prompts
- [ ] Overview page loads correctly from normalized tables
- [ ] All engines (Forecast, Risk, Stress) work with reconstructed `userData`
- [ ] No console errors during normal usage
- [ ] Performance is acceptable (no noticeable slowdown)

---

## Notes

- Tasks 1-15 implement Phase 2 (Dual-Write). The app writes to both `user_data` and normalized tables.
- Tasks 16-18 implement Phase 3 (Cutover). The app reads from normalized tables only.
- Task 19 archives the legacy table after verification.
- Task 20 is the rollback plan (only if something goes wrong).
- Optional tasks marked with `*` can be skipped for MVP.
- All tasks should be implemented in `famledgerai/index.html` unless specified otherwise.
- Use existing code patterns: `fl()` for formatting, `sh(id, html)` for rendering, `$()` for DOM access.
- Test each task incrementally — don't implement all at once.
