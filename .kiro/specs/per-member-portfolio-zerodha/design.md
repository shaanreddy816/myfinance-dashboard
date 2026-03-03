# Design Document

## Overview

This design transforms FamLedgerAI's flat investment, loan, and insurance data structures into per-member structures keyed by family member ID. It also extends the Zerodha integration to support per-member brokerage connections. The existing `userData.expenses.byMember` pattern is reused for consistency. All changes live in `index.html` (frontend) and `api/[...catchall].js` (backend).

## Architecture

### Data Layer Changes

The core change is restructuring three data stores from flat to per-member:

```
BEFORE (flat):
userData.investments = { mutualFunds:[], stocks:[], fd:[], ppf:[] }
userData.loans = [ {label, outstanding, emi, rate, ...}, ... ]
userData.insurance = { term:[], health:[], vehicle:[], life:[], home:[] }

AFTER (per-member):
userData.investments = {
  byMember: {
    "self":   { mutualFunds:[], stocks:[], fd:[], ppf:[] },
    "spouse": { mutualFunds:[], stocks:[], fd:[], ppf:[] },
    ...
  }
}
userData.loans = {
  byMember: {
    "self":   [ {label, outstanding, emi, rate, ...}, ... ],
    "spouse": [ ... ],
    ...
  }
}
userData.insurance = {
  byMember: {
    "self":   { term:[], health:[], vehicle:[], life:[], home:[] },
    "spouse": { term:[], health:[], vehicle:[], life:[], home:[] },
    ...
  }
}
```

### Family Floater Health Insurance Model

Health insurance policies have a `policyType` field: `"individual"` or `"family_floater"`.

Family Floater policies add:
- `coverageGroup`: `"nuclear"` (self+spouse+kids) or `"parents"` (father/mother)
- `coveredMembers`: array of member IDs covered by this policy

```
// Example: Nuclear family floater stored under "self"
{
  id: "ins-123",
  label: "HDFC Ergo Optima Secure",
  policyType: "family_floater",
  coverageGroup: "nuclear",
  coveredMembers: ["self", "spouse", "kid-1"],
  cover: 1000000,
  premium: 25000,
  ...
}
```

When rendering a member's insurance view, the system checks:
1. Policies directly in `byMember[memberId].health`
2. Policies in ANY other member's `health[]` where `coveredMembers` includes this member ID

De-duplication in "All" view: Family Floater policies appear once with all covered members listed.

## Components

### Component 1: Data Migration Engine (`migrateToPerMember`)

A function called from `loadUserData()` after data is loaded from Supabase. Runs once per store, gated by migration flags on `userData.profile`.

**Migration logic:**
1. Check if `userData.investments.byMember` exists → if not, wrap existing flat data into `byMember.self`
2. Check if `userData.loans` is an array → if so, convert to `{ byMember: { self: [...] } }`
3. Check if `userData.insurance.byMember` exists → if not, wrap existing flat data into `byMember.self`
4. Set `_investmentMigrationV1`, `_loanMigrationV1`, `_insuranceMigrationV1` flags on `userData.profile`
5. Call `debounceSave()`

**Placement:** Inside `loadUserData()`, after the existing `_authUid` check and before `populateProfileSelector()`.

### Component 2: Per-Member Data Accessors

Helper functions that abstract reading/writing per-member data, so render functions don't need to know the internal structure.

```javascript
// Returns investment data for the given member or merged for "all"
function getInvestmentsForMember(memberId) { ... }

// Returns loans for the given member or merged for "all"
function getLoansForMember(memberId) { ... }

// Returns insurance for the given member or merged for "all"
// Includes Family Floater cross-references
function getInsuranceForMember(memberId) { ... }

// Returns the mutable reference for writes (never "all")
function getMemberInvestments(memberId) { ... }
function getMemberLoans(memberId) { ... }
function getMemberInsurance(memberId) { ... }
```

### Component 3: Updated `renderInvestments()`

**Changes:**
- Replace `const inv = userData.investments || {...}` with `const inv = getInvestmentsForMember(currentProfile)`
- Zerodha holdings fetch uses member-specific token (via `X-Member-Id` header)
- In "all" view: merge all members' investments, group by member name
- In member view: show only that member's data, allow editing
- "Connect Zerodha" button passes `currentProfile` member ID

### Component 4: Updated `renderLoans()`

**Changes:**
- Replace `const loans = userData.loans || []` with `const loans = getLoansForMember(currentProfile)`
- `addLoan()`, `updateLoan()`, `deleteLoan()` operate on `getMemberLoans(currentProfile)`
- In "all" view: merge all members' loans, label each with member name
- In member view: show only that member's loans

### Component 5: Updated `renderInsurance()`

**Changes:**
- Replace `const ins = userData.insurance` with member-aware accessor
- `addInsurance()`, `updateInsurance()`, `deleteInsurance()` operate on member-specific data
- Health insurance "Add" modal gains: policy type selector (Individual / Family Floater) and coverage group selector (Nuclear / Parents)
- Family Floater policies show covered members and appear in each covered member's view
- "All" view de-duplicates Family Floater policies

### Component 6: Insurance Add Modal Enhancement

The existing `ins-modal` gets two new fields (shown only for health category):

1. **Policy Type** dropdown: "Individual" (default) | "Family Floater"
2. **Coverage Group** dropdown (shown when Family Floater selected): "Self + Spouse + Kids" | "Parents"

When "Family Floater" is selected:
- `coveredMembers` is auto-populated based on coverage group selection using `userData.profile.familyMembers`
- The "Members Covered" text field is auto-filled with names

### Component 7: Per-Member Zerodha Integration (Backend)

**Integrations table schema change:**
Add `member_id` column (TEXT, default `'self'`) to the `integrations` table.

**API changes in `[...catchall].js`:**
- `handleZerodhaCallback`: Read `member_id` from `redirect_params`, store in integrations row
- `handleZerodhaHoldings`: Accept `X-Member-Id` header, query by `user_id + member_id`
- `handleZerodhaMfSips`: Same member-aware query

**Frontend `connectZerodha()` change:**
- Include `currentProfile` member ID in the redirect_params sent to Kite OAuth

### Component 8: Per-Member Zerodha Management UI

A new section in Settings page showing each family member's Zerodha connection status:

```
┌─────────────────────────────────────────┐
│ 🔗 Zerodha Connections                  │
├─────────────────────────────────────────┤
│ 👤 Nishanth    ✅ Connected [Disconnect]│
│ 💑 Spouse      🔗 Connect Zerodha →     │
│ 👴 Father      🔗 Connect Zerodha →     │
│ 👵 Mother      🔗 Connect Zerodha →     │
│ 👶 Kid 1       🔗 Connect Zerodha →     │
└─────────────────────────────────────────┘
```

### Component 9: Dashboard Totals Update

`computeTotalInvestments()`, `computeTotalLoanOutstanding()`, `computeTotalEmi()`, and insurance coverage totals must iterate over `byMember` instead of flat arrays.

When `currentProfile !== 'all'`, these functions return only the selected member's totals.

### Component 10: Profile Selector Re-render Hook

The existing `profileSelect` change listener already calls `renderCurrentPage()`. No structural change needed — the render functions themselves become member-aware via the accessor functions.

## Data Flow

### Read Flow (Rendering)
```
User selects member in Profile_Selector
  → currentProfile = memberId
  → renderCurrentPage()
    → renderInvestments() calls getInvestmentsForMember(currentProfile)
      → if "all": merge all byMember entries
      → if specific: return byMember[memberId]
    → renderLoans() calls getLoansForMember(currentProfile)
    → renderInsurance() calls getInsuranceForMember(currentProfile)
      → includes cross-referenced Family Floater policies
```

### Write Flow (Editing)
```
User adds/edits/deletes an item
  → getMemberInvestments(currentProfile) returns mutable ref
  → item is added/modified/removed in byMember[currentProfile]
  → debounceSave() persists to Supabase
  → re-render
```

### Zerodha Flow (Per-Member)
```
User selects member → clicks "Connect Zerodha"
  → connectZerodha(currentProfile)
  → Kite OAuth with member_id in redirect_params
  → Callback stores token with user_id + member_id
  → renderInvestments() fetches holdings with X-Member-Id header
  → Holdings displayed under that member's portfolio
```

### Migration Flow (One-Time)
```
loadUserData()
  → data loaded from Supabase
  → migrateToPerMember() checks:
    → investments flat? → wrap in byMember.self, set flag
    → loans is array? → wrap in byMember.self, set flag
    → insurance flat? → wrap in byMember.self, set flag
  → debounceSave() if any migration ran
  → continue to populateProfileSelector() and render
```

## Constraints

1. All code stays in `index.html` (single-file app) and `api/[...catchall].js`
2. `userData` is the single source of truth, persisted via `debounceSave()` to Supabase
3. Migration must be backward-compatible — existing users see no data loss
4. Family Floater de-duplication must not double-count coverage in dashboard totals
5. Zerodha tokens are per-member but the Supabase account (`user_id`) is shared across the family
6. The `integrations` table needs a new `member_id` column — requires a Supabase migration SQL
7. Profile Selector already exists in sidebar — no new UI chrome needed for member switching
8. `currentProfile` variable is the single source of truth for which member is selected
