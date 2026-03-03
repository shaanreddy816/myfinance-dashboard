# Implementation Tasks

## Task 1: Add Supabase migration SQL for integrations table
- [x] Create SQL migration to add `member_id TEXT DEFAULT 'self'` column to `integrations` table
- [x] Update unique constraint to composite key: `(user_id, provider, member_id)`
- [x] Save migration SQL to `famledgerai/docs/supabase/PER_MEMBER_ZERODHA_MIGRATION.sql`

## Task 2: Implement data migration engine in loadUserData
- [x] Add `migrateToPerMember()` function after the `_authUid` check in `loadUserData()`
- [x] Migrate flat `userData.investments` → `userData.investments.byMember.self` (gated by `_investmentMigrationV1` flag)
- [x] Migrate flat `userData.loans` array → `userData.loans = { byMember: { self: [...] } }` (gated by `_loanMigrationV1` flag)
- [x] Migrate flat `userData.insurance` → `userData.insurance.byMember.self` (gated by `_insuranceMigrationV1` flag)
- [x] Call `debounceSave()` after migration completes
- [x] Ensure migration flags are stored on `userData.profile`

## Task 3: Create per-member data accessor functions
- [x] Add `getInvestmentsForMember(memberId)` — returns merged data for "all" or single member's data
- [x] Add `getLoansForMember(memberId)` — returns merged array for "all" or single member's array
- [x] Add `getInsuranceForMember(memberId)` — returns merged data for "all" with Family Floater cross-references, or single member's data plus any Family Floater policies covering them
- [x] Add `getMemberInvestments(memberId)` — returns mutable reference for writes (creates empty structure if missing)
- [x] Add `getMemberLoans(memberId)` — returns mutable reference for writes (creates empty array if missing)
- [x] Add `getMemberInsurance(memberId)` — returns mutable reference for writes (creates empty structure if missing)
- [x] Add `ensureMemberDataStructure(memberId)` — initializes empty byMember entry for a new family member

## Task 4: Update renderInvestments to use per-member data
- [x] Replace `const inv = userData.investments || {...}` with `getInvestmentsForMember(currentProfile)`
- [x] Update `addInvestment()`, `updateInvestment()`, `deleteInvestment()` to use `getMemberInvestments(currentProfile)`
- [x] In "all" view: group investments by member name with visual labels
- [x] In member view: show only that member's investments with edit capability
- [x] Disable editing in "all" view (read-only combined view)

## Task 5: Update renderLoans to use per-member data
- [x] Replace `const loans = userData.loans || []` with `getLoansForMember(currentProfile)`
- [x] Update `addLoan()`, `updateLoan()`, `deleteLoan()` to use `getMemberLoans(currentProfile)`
- [x] In "all" view: group loans by member name with visual labels
- [x] In member view: show only that member's loans with edit capability
- [ ] Disable editing in "all" view (read-only combined view)

## Task 6: Update renderInsurance to use per-member data with Family Floater support
- [x] Replace flat `userData.insurance` access with `getInsuranceForMember(currentProfile)`
- [x] Update `addInsurance()`, `updateInsurance()`, `deleteInsurance()` to use `getMemberInsurance(currentProfile)`
- [x] In "all" view: de-duplicate Family Floater policies, show covered members list
- [x] In member view: show own policies + any Family Floater policies covering this member (labeled "Covered under [name]'s Family Floater")
- [x] Disable editing of cross-referenced Family Floater policies (only editable from policyholder's view)

## Task 7: Enhance insurance add modal with Family Floater fields
- [x] Add "Policy Type" dropdown (Individual / Family Floater) to `ins-modal`, visible only for health category
- [x] Add "Coverage Group" dropdown (Self + Spouse + Kids / Parents), visible when Family Floater selected
- [x] Auto-populate `coveredMembers` array from `userData.profile.familyMembers` based on coverage group
- [x] Auto-fill "Members Covered" text field with names from selected coverage group
- [x] Store `policyType`, `coverageGroup`, and `coveredMembers` on saved policy object
- [x] Update PDF upload handler to auto-detect Family Floater from AI extraction and pre-select fields

## Task 8: Update dashboard totals to use per-member data
- [x] Update `computeTotalInvestments()` to sum across `userData.investments.byMember` (or single member if `currentProfile !== 'all'`)
- [x] Update `computeTotalLoanOutstanding()` and `computeTotalEmi()` to sum across `userData.loans.byMember`
- [x] Update `computeDebtRatio()` to use per-member loan totals
- [x] Update insurance coverage totals (`termCover`, `healthCover`) to sum across `userData.insurance.byMember`, de-duplicating Family Floater coverage
- [x] Ensure overview page KPI cards reflect selected member's data

## Task 9: Update Zerodha frontend to support per-member connections
- [x] Update `connectZerodha()` to include `currentProfile` member ID in redirect_params
- [x] Update `renderInvestments()` Zerodha fetch to pass `X-Member-Id: currentProfile` header
- [x] Update Zerodha SIP fetch to pass `X-Member-Id` header
- [x] Show per-member Zerodha connect/disconnect buttons in investments tab
- [x] In "all" view: fetch and merge Zerodha holdings from all connected members

## Task 10: Update Zerodha backend API for per-member tokens
- [x] Update `handleZerodhaCallback()` to read `member_id` from redirect_params and store in integrations row
- [x] Update `handleZerodhaHoldings()` to accept `X-Member-Id` header and query by `user_id + member_id`
- [x] Update `handleZerodhaMfSips()` to accept `X-Member-Id` header and query by `user_id + member_id`
- [x] Add endpoint or logic to fetch all member tokens for "all" view aggregation
- [x] Handle backward compatibility: existing rows without `member_id` default to `'self'`

## Task 11: Add Zerodha connection management UI in Settings
- [x] Add "Zerodha Connections" section to Settings page
- [x] Display each family member with connection status (Connected / Not Connected)
- [x] Add "Connect Zerodha" button per member that calls `connectZerodha(memberId)`
- [x] Add "Disconnect" button per connected member that deletes their token from integrations table
- [x] Show last sync timestamp per connected member
