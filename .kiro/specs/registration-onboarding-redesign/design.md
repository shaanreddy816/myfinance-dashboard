# Design Document

## Overview

This design replaces the current registration + legacy onboarding flow with a clean two-step process:

1. **Step 1 — Registration Form**: Lightweight form (first name, last name, email, phone, password) → Supabase signUp → email verification screen
2. **Step 2 — Profile Wizard**: Multi-section wizard (personal, family, income, expenses, assets, liabilities, goals) → save to Supabase → land on dashboard

All changes are within `famledgerai/index.html` (single-file architecture). No new files are created.

## Architecture

### Current Flow (to be replaced)
```
Registration (doReg) → collects name, spouse, kids, age, occupation, income range, goals, risk, password
  → signUp → email verification OR auto-confirm → showApp (dashboard)
  → Legacy onboarding wizard (completeOnboarding/showOnboarding) — dead code, already skipped
```

### New Flow
```
Registration (doReg) → collects first name, last name, email, phone, password ONLY
  → signUp with metadata {firstName, lastName, phone}
  → If no session: show Verification_Screen → user verifies email → returns → SIGNED_IN event
  → If session: show Congratulations_Screen
  → Auth state detects new user with no profile → show Profile_Wizard
  → User completes wizard → save to Supabase → update global userData → showApp (dashboard)
```

## Components

### 1. Registration Form HTML (modify existing `#aform-reg`)

**What changes:**
- Keep: first name (`#reg-firstname`), last name (`#reg-lastname`), email (`#r-em`), WhatsApp/phone field, password (`#r-pw`), confirm password (`#r-pw2`), terms checkbox
- Remove: all hidden compatibility fields (`#r-spouse`, `#r-kids-wrap`, `#r-age`, `#r-occupation`, `#r-income-range`, `#goal-options`, `#risk-options`)
- Remove: hidden `#r-nm` field (full name will be built in JS)

**No visual changes needed** — the form already collects the right fields. We just remove the hidden legacy fields.

### 2. Verification Screen HTML (new section)

**Location:** New `<div id="verification-screen">` added alongside `#auth`, `#app`, `#landing`

**Content:**
- Envelope icon + "Check your email" heading
- Shows the registered email address
- "We sent a verification link to {email}" message
- "Back to Sign In" button

### 3. Congratulations Screen (modify existing `showCongratulationsModal`)

**What changes:**
- Keep the existing congratulations modal
- After dismissal, instead of calling `showApp()`, check if profile wizard is needed

### 4. Profile Wizard HTML (new section)

**Location:** New `<div id="profile-wizard">` added alongside other top-level sections

**Structure:** Single scrollable page with clearly labeled sections (not multi-step tabs — simpler, fewer bugs):

```
Section 1: Personal Details
  - Age (number input)
  - Gender (select: male/female/other)
  - Occupation (select: salaried/business/self-employed/retired)
  - City (text input)

Section 2: Family
  - Marital Status (select: single/married)
  - Spouse Name (conditional, shown if married)
  - Children (dynamic add/remove, name inputs)

Section 3: Monthly Income
  - Your Monthly Income (₹)
  - Spouse Income (₹, conditional)
  - Rental Income (₹)
  - Business Income (₹)
  - Other Income (₹)

Section 4: Monthly Expenses
  - Housing/Rent (₹)
  - Food & Groceries (₹)
  - Transport (₹)
  - Education (₹)
  - Healthcare (₹)
  - Lifestyle & Entertainment (₹)
  - Investments/SIPs (₹)
  - Miscellaneous (₹)

Section 5: Assets & Investments
  - Mutual Funds Value (₹)
  - Stocks Value (₹)
  - Fixed Deposits (₹)
  - PPF/EPF (₹)
  - Real Estate Value (₹)
  - Gold (₹)
  - Cash/Savings (₹)

Section 6: Liabilities
  - Home Loan Outstanding (₹)
  - Car Loan Outstanding (₹)
  - Personal Loan Outstanding (₹)
  - Education Loan Outstanding (₹)
  - Credit Card Debt (₹)

Section 7: Goals & Risk
  - Financial Goals (multi-select chips: retirement, child-education, house, car, emergency, travel)
  - Risk Appetite (single-select: conservative, moderate, aggressive)

[Complete Profile →] button
```

### 5. Modified `handleModernRegistration()` Function

**Changes:**
- Remove all hidden field setting (`r-nm`, `r-age`, `r-occupation`, `r-income-range`)
- Directly call Supabase signUp with email, password, and metadata `{firstName, lastName, phone}`
- On success: save minimal registration data to localStorage as `pending_registration_data`
- Show verification screen or congratulations screen based on session existence
- Do NOT build full userData object — that happens in Profile Wizard

### 6. Modified `doReg()` Function

**Replaced entirely** by the new `handleModernRegistration()`. The old `doReg` is removed.

### 7. New `showProfileWizard()` Function

**Purpose:** Renders the Profile Wizard HTML into `#profile-wizard` and shows it.

**Logic:**
- Pre-fill first name, last name, phone from `pending_registration_data` or auth metadata
- Show the wizard sections
- Attach event listeners for marital status toggle, add/remove children

### 8. New `completeProfileWizard()` Function

**Purpose:** Collects all wizard data, builds the complete `userData` object, saves to Supabase, navigates to dashboard.

**Data mapping:**
```javascript
userData = {
  profile: {
    name: `${firstName} ${lastName}`,
    firstName, lastName, phone,
    age, gender, occupation, city,
    maritalStatus, spouseName, kids: [...childNames],
    familyMembers: [self, spouse?, kids...],
    goals: [...selectedGoals],
    risk: selectedRisk,
    incomeRange: computedFromMonthlyIncome,
    liquidSavings: cashSavingsValue
  },
  income: {
    husband: monthlyIncome,
    wife: spouseIncome,
    rental: rentalIncome,
    rentalActive: rentalIncome > 0,
    business: businessIncome,
    other: otherIncome
  },
  expenses: {
    monthly: [], // empty — individual items added later
    periodic: [],
    byMember: {
      self: [
        { n: 'Housing/Rent', v: housingAmount, c: 'housing' },
        { n: 'Food & Groceries', v: foodAmount, c: 'food' },
        // ... one entry per non-zero expense category
      ]
    },
    byMonth: {
      'YYYY-MM': {
        byMember: { self: [...same as above] }
      }
    }
  },
  investments: {
    mutualFunds: mfValue > 0 ? [{ name: 'Mutual Funds', value: mfValue }] : [],
    stocks: stocksValue > 0 ? [{ name: 'Stocks Portfolio', value: stocksValue }] : [],
    fd: fdValue > 0 ? [{ name: 'Fixed Deposit', principal: fdValue }] : [],
    ppf: ppfValue > 0 ? [{ name: 'PPF/EPF', balance: ppfValue }] : []
  },
  loans: [
    // One entry per non-zero loan
    { name: 'Home Loan', outstanding: homeLoanValue, emi: 0, rate: 0 },
    // ...
  ],
  insurance: { term: [], health: [], vehicle: [] },
  schemes: [],
  bankAccounts: [],
  liquidSavings: cashSavingsValue,
  termCover: 0
};
```

### 9. Modified Auth State Listener (`onAuthStateChange`)

**Changes to SIGNED_IN handler:**
```
if isRegistering → skip (existing)
if newEmail !== currentUserEmail OR no profile name:
  → loadUserData(email)
  → if userData.profile has no name AND no age → showProfileWizard()
  → else → showApp()
```

### 10. Modified `checkSession()`

**Changes:**
```
if session exists:
  → loadUserData(email)
  → restore pending_registration_data if needed (existing)
  → if userData.profile has no age AND no occupation → showProfileWizard()
  → else → showApp()
```

### 11. Modified `loadUserData()`

**Changes:**
- When recovering from auth metadata, only recover `firstName`, `lastName`, `phone` (not age, occupation, etc. — those come from Profile Wizard now)
- Remove references to old metadata fields (incomeRange, goals, risk from auth metadata)

### 12. Legacy Code Removal

**Remove:**
- `window.addKidField` (registration kid fields — Profile Wizard has its own)
- `window.doReg` function entirely
- `OnboardingWizard` class and all methods
- `completeOnboarding`, `showOnboarding`, `collectOnboardingData` functions
- `ONBOARDING_STORAGE_KEY` and `onboardingState` variables
- Registration goal/risk selector event listeners (`#aform-reg .goal-option, .risk-option`)
- Hidden form fields in `#aform-reg`

## Data Flow Diagram

```
[Registration Form] 
    → Supabase signUp(email, password, metadata:{firstName, lastName, phone})
    → localStorage: pending_registration_data = {email, firstName, lastName, phone}
    → Show verification screen

[Email Verified → User returns]
    → onAuthStateChange(SIGNED_IN)
    → loadUserData(email) → no profile data found
    → Recover firstName/lastName/phone from auth metadata or localStorage
    → showProfileWizard()

[Profile Wizard completed]
    → Build full userData object
    → saveUserData(email) → Supabase upsert
    → Update global userData
    → localStorage: onboarding_completed = true
    → Remove pending_registration_data
    → showApp() → renderOverview() shows all data
```

## Dashboard Data Mapping

| Wizard Field | userData Path | Dashboard Section |
|---|---|---|
| First + Last Name | profile.name, profile.firstName, profile.lastName | Overview (greeting), Settings (name field) |
| Phone | profile.phone | Settings (phone field) |
| Age | profile.age | Overview (age display), Settings, AI Advisor |
| Gender | profile.gender | Settings |
| Occupation | profile.occupation | Overview, Settings |
| City | profile.city | Settings, NRI Planner |
| Marital Status | profile.maritalStatus | Settings |
| Spouse Name | profile.spouseName | Family selector, Settings |
| Children | profile.kids, profile.familyMembers | Family selector, Settings |
| Goals | profile.goals | Overview (goal badges), AI Advisor, Autopilot |
| Risk | profile.risk | Overview (risk display), AI Advisor |
| Monthly Income | income.husband | Income page, Finances overview, AI Advisor |
| Spouse Income | income.wife | Income page, Finances overview |
| Rental Income | income.rental | Income page, Finances overview |
| Business Income | income.business | Income page |
| Other Income | income.other | Income page |
| Housing expense | expenses.byMonth.byMember.self | Expenses page, Recurring Expenses |
| Food expense | expenses.byMonth.byMember.self | Expenses page |
| Transport expense | expenses.byMonth.byMember.self | Expenses page |
| Education expense | expenses.byMonth.byMember.self | Expenses page |
| Healthcare expense | expenses.byMonth.byMember.self | Expenses page |
| Lifestyle expense | expenses.byMonth.byMember.self | Expenses page |
| Investment/SIP expense | expenses.byMonth.byMember.self | Expenses page |
| Miscellaneous expense | expenses.byMonth.byMember.self | Expenses page |
| Mutual Funds | investments.mutualFunds | Investments page, AI Advisor |
| Stocks | investments.stocks | Investments page, AI Advisor |
| Fixed Deposits | investments.fd | Investments page |
| PPF/EPF | investments.ppf | Investments page, Schemes page |
| Real Estate | profile.realEstateValue | Assets display, NRI Planner |
| Gold | profile.goldValue | Assets display |
| Cash/Savings | liquidSavings | Overview (emergency fund), AI Advisor, Autopilot |
| Home Loan | loans[] | Loans page, AI Advisor |
| Car Loan | loans[] | Loans page |
| Personal Loan | loans[] | Loans page |
| Education Loan | loans[] | Loans page |
| Credit Card Debt | loans[] | Loans page, Autopilot alerts |

### AI Feature Data Dependencies

The Profile Wizard data directly feeds these AI-powered features:

- **AI Advisor**: Uses age, goals, risk, income, expenses, investments, loans, liquidSavings to generate personalized recommendations
- **NRI Planner**: Uses income, assets (real estate, gold, investments), liabilities, city, goals to provide India-return planning
- **Autopilot**: Uses income, expenses, investments, goals, liquidSavings to generate automated financial action items and alerts

## Backward Compatibility

- Existing users with complete profile data are unaffected — `checkSession` and `onAuthStateChange` detect existing profile and go straight to dashboard
- The `incomeRange` field is computed from actual monthly income for backward compatibility with health score calculations
- `familyMembers` array is built the same way as before (self + spouse + kids)
- All expense, investment, and loan data structures match existing formats exactly
- `debounceSave()` continues to work as before for subsequent edits

## Error Handling

- If Supabase signUp fails → show error below email field (existing pattern)
- If Profile Wizard save fails → show error toast, retain form data, allow retry
- If localStorage backup fails → log error, continue (non-critical)
- Race condition protection: `isRegistering` flag prevents auth listener interference during signUp (existing)
- Empty userData on logout prevents data leaking between users (existing)
