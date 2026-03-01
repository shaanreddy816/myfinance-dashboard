# Design Document: Enhanced Onboarding - Complete Profile Setup

## Overview

This design document specifies the technical implementation for Phase 1 of FamLedger AI's transformation into a comprehensive financial freedom platform. The Enhanced Onboarding feature replaces the basic signup flow with a comprehensive 4-phase wizard that collects detailed financial information from Indian users.

### Purpose

The onboarding wizard serves as the foundation for all subsequent features by collecting:
- Personal and family information
- Comprehensive income sources (salary, bonus, rental, business, spouse income)
- 20+ expense categories tailored for Indian households
- Assets and liabilities for net worth calculation
- Financial goals with timelines

This data enables AI-powered budget allocation, expense tracking, goal planning, and personalized recommendations throughout the application.

### Key Design Principles

1. **Single-Page Architecture**: All wizard logic resides in `famledgerai/index.html` to maintain the existing single-file deployment model
2. **Progressive Disclosure**: Information is collected across 4 logical phases to avoid overwhelming users
3. **Smart Defaults**: Context-aware default values based on city tier, family size, and income level reduce data entry burden
4. **Mobile-First**: Responsive design ensures completion on devices with screen width >= 320px
5. **Persistence**: localStorage ensures progress is never lost across sessions
6. **Validation**: Real-time validation prevents invalid data and guides users toward financial best practices

### Target Metrics

- Completion rate: > 80%
- Average completion time: < 10 minutes
- Mobile completion rate: > 60%
- Profile completeness: > 70% (including optional fields)

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────────┐
│                   FamLedger AI App                      │
│                  (famledgerai/index.html)               │
└─────────────────────────────────────────────────────────┘
                            │
                            ├─ Auth Flow (existing)
                            │
                            ├─ Onboarding Wizard (NEW)
                            │  ├─ Phase 1: Basic Info
                            │  ├─ Phase 2: Income Sources
                            │  ├─ Phase 3: Monthly Expenses
                            │  └─ Phase 4: Assets & Liabilities
                            │
                            └─ Dashboard (existing)


### Integration Points

The onboarding wizard integrates with existing FamLedger AI components:

1. **Authentication System**: Wizard appears after successful registration, before dashboard access
2. **User Data Store**: Extends existing `userData` object with comprehensive profile data
3. **localStorage**: Uses `onboarding_progress` key for temporary storage during wizard flow
4. **Supabase**: Transfers completed profile to `user_profiles` table upon completion
5. **Dashboard**: Receives enriched user data for personalized recommendations and calculations

### State Management

```javascript
// Onboarding state structure in localStorage
{
  currentPhase: 1-4,
  completedPhases: [1, 2],
  startTime: timestamp,
  data: {
    basicInfo: { name, age, gender, maritalStatus, occupation, city, spouse, children, parents },
    goals: [{ name, amount, timeline, priority, category }],
    income: { salary, bonus, rental, business, freelancing, spouse, other },
    expenses: {
      housing: { emi, rent, propertyTax, maintenance, insurance },
      transportation: { carEMI, petrol, insurance, maintenance, publicTransport, vehicles: [] },
      insurance: { health, term, car, personalAccident },
      utilities: { electricity, water, gas, internet, mobile, ott },
      food: { groceries, vegetables, dining, delivery },
      children: [{ schoolFees, tuition, sports, transport, books }],
      healthcare: { medicines, consultations, gym, supplements, emergencyFund },
      lifestyle: { outings, entertainment, shopping, hobbies },
      investments: { sip, ppf, stocks, educationFund, retirementFund },
      miscellaneous: { domesticHelp, pets, charity, custom: [] }
    },
    assets: { bank, fd, mutualFunds, stocks, gold, realEstate: [] },
    liabilities: [{ type, outstanding, interestRate, emi }]
  }
}
```

### Data Flow

```
User Input → Validation → State Update → localStorage Persistence
                                              ↓
                                    Progress Calculation
                                              ↓
                                    Smart Defaults Update
                                              ↓
                                    Warning/Tip Display
                                              ↓
                          Phase Completion → Next Phase
                                              ↓
                          All Phases Complete → Supabase Transfer
                                              ↓
                                         Dashboard
```

## Components and Interfaces

### 1. Onboarding Wizard Container

**Responsibility**: Manages wizard lifecycle, phase transitions, and progress tracking

**Interface**:
```javascript
class OnboardingWizard {
  constructor(containerId)
  init()                          // Initialize wizard from localStorage or fresh
  renderPhase(phaseNumber)        // Render specific phase UI
  nextPhase()                     // Advance to next phase with validation
  previousPhase()                 // Return to previous phase
  saveProgress()                  // Persist current state to localStorage
  calculateProgress()             // Return completion percentage
  complete()                      // Transfer data to Supabase and navigate to dashboard
  clear()                         // Erase all onboarding data
}
```

### 2. Phase Components

Each phase is a self-contained component with consistent interface:

**Phase 1: Basic Information**
```javascript
class BasicInfoPhase {
  render(container, data)         // Render form fields
  validate()                      // Return { valid: boolean, errors: [] }
  getData()                       // Return collected data object
  onMaritalStatusChange()         // Show/hide spouse fields
  onChildrenAdd()                 // Add child form group
  onParentsAdd()                  // Add parent form group
  loadSmartDefaults(city)         // Set defaults based on city tier
}
```

**Phase 2: Income Sources**
```javascript
class IncomePhase {
  render(container, data)
  validate()
  getData()
  calculateMonthlyBonus(annual)   // Divide annual bonus by 12
  calculateTotalIncome()          // Sum all income sources
  displayIncomeBreakdown()        // Show income composition chart
}
```

**Phase 3: Monthly Expenses**
```javascript
class ExpensesPhase {
  render(container, data)
  validate()
  getData()
  calculateCategoryTotal(category)
  calculateCategoryPercentage(category, income)
  displayWarnings(income)         // Show warnings for high expense ratios
  loadSmartDefaults(context)      // Set defaults based on city, family size, income
  addVehicle()                    // Add vehicle expense group
  addCustomCategory()             // Add custom expense category
}
```

**Phase 4: Assets & Liabilities**
```javascript
class AssetsLiabilitiesPhase {
  render(container, data)
  validate()
  getData()
  calculateTotalAssets()
  calculateTotalLiabilities()
  calculateNetWorth()
  calculateDebtToIncomeRatio(income)
  categorizeAssets()              // Liquid, semi-liquid, illiquid
  displayWarnings(income)
}
```

### 3. Progress Indicator

**Responsibility**: Visual feedback on completion status

**Interface**:
```javascript
class ProgressIndicator {
  constructor(containerId)
  update(currentPhase, completedPhases, percentage)
  render()
}
```

**Visual Design**:
- Horizontal stepper showing 4 phases
- Current phase highlighted
- Completed phases marked with checkmark
- Overall percentage displayed
- Mobile: Compact version at top of viewport

### 4. Validation Engine

**Responsibility**: Centralized validation logic for all input types

**Interface**:
```javascript
class ValidationEngine {
  validateRequired(value, fieldName)
  validateNumeric(value, fieldName)
  validatePositive(value, fieldName)
  validateEmail(value)
  validateAge(value, min, max)
  validateRange(value, min, max, fieldName)
  displayError(fieldId, message)
  clearError(fieldId)
  hasErrors()
}
```

### 5. Smart Defaults Engine

**Responsibility**: Context-aware default value calculation

**Interface**:
```javascript
class SmartDefaultsEngine {
  constructor(userData)
  
  // City-based defaults
  getHousingDefault(city, income)
  getCityTier(city)
  
  // Family-based defaults
  getGroceriesDefault(familySize)
  getUtilitiesDefault(familySize)
  
  // Age-based defaults
  getInvestmentDefault(age, income)
  
  // Income-based defaults
  getLifestyleDefault(income)
  
  // School-based defaults
  getSchoolFeesDefault(schoolType)
}
```

### 6. Calculation Engine

**Responsibility**: Financial calculations and derived metrics

**Interface**:
```javascript
class CalculationEngine {
  constructor(onboardingData)
  
  calculateTotalIncome()
  calculateTotalExpenses()
  calculateRemaining()
  calculateSavingsRate()
  calculateDebtToIncomeRatio()
  calculateNetWorth()
  calculateRiskScore()
  categorizeRiskProfile()         // Conservative, Moderate, Aggressive
  
  // Category-specific
  calculateCategoryTotal(category)
  calculateCategoryPercentage(category)
}
```

### 7. Persistence Manager

**Responsibility**: localStorage operations and data migration

**Interface**:
```javascript
class PersistenceManager {
  save(onboardingData)
  load()
  clear()
  transferToSupabase(userId)      // Migrate from localStorage to database
  hasExistingProgress()
}
```

## Data Models

### User Profile Data Model

```javascript
{
  // Basic Information
  name: string,
  age: number,
  gender: 'male' | 'female' | 'other',
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed',
  occupation: string,
  city: string,
  cityTier: 1 | 2 | 3,
  
  // Family
  spouse: {
    name: string,
    age: number,
    occupation: string,
    income: number
  } | null,
  
  children: [{
    name: string,
    age: number,
    schoolGrade: string
  }],
  
  parents: [{
    name: string,
    age: number,
    healthStatus: 'good' | 'fair' | 'poor'
  }],
  
  // Financial Goals
  goals: [{
    id: string,
    name: string,
    targetAmount: number,
    timeline: number,              // years
    priority: 'high' | 'medium' | 'low',
    category: 'short' | 'medium' | 'long'
  }],
  
  // Income (monthly)
  income: {
    salary: number,
    bonus: number,                 // annual, stored as monthly
    rental: number,
    business: number,
    freelancing: number,
    investmentReturns: number,
    other: number,
    spouseIncome: number
  },
  
  // Expenses (monthly)
  expenses: {
    housing: {
      emi: number,
      rent: number,
      propertyTax: number,
      maintenance: number,
      insurance: number
    },
    transportation: {
      carEMI: number,
      petrol: number,
      insurance: number,
      maintenance: number,
      publicTransport: number,
      vehicles: [{
        type: string,
        emi: number,
        fuel: number
      }]
    },
    insurance: {
      health: number,
      term: number,
      car: number,
      personalAccident: number
    },
    utilities: {
      electricity: number,
      water: number,
      gas: number,
      internet: number,
      mobile: number,
      ott: number
    },
    food: {
      groceries: number,
      vegetables: number,
      dining: number,
      delivery: number
    },
    children: [{
      childId: string,
      schoolFees: number,
      tuition: number,
      sports: number,
      transport: number,
      books: number
    }],
    healthcare: {
      medicines: number,
      consultations: number,
      gym: number,
      supplements: number,
      emergencyFund: number
    },
    lifestyle: {
      outings: number,
      entertainment: number,
      shopping: number,
      hobbies: number
    },
    investments: {
      sip: number,
      ppf: number,
      stocks: number,
      educationFund: number,
      retirementFund: number,
      equityAmount: number,
      debtAmount: number
    },
    miscellaneous: {
      domesticHelp: number,
      pets: number,
      charity: number,
      custom: [{
        name: string,
        amount: number
      }]
    }
  },
  
  // Assets
  assets: {
    bank: number,
    fd: number,
    mutualFunds: number,
    stocks: number,
    gold: number,
    realEstate: [{
      type: string,
      value: number
    }]
  },
  
  // Liabilities
  liabilities: [{
    type: 'home' | 'car' | 'personal' | 'creditCard',
    outstanding: number,
    interestRate: number,
    emi: number
  }],
  
  // Calculated Fields
  calculated: {
    totalIncome: number,
    totalExpenses: number,
    remaining: number,
    savingsRate: number,
    totalAssets: number,
    totalLiabilities: number,
    netWorth: number,
    debtToIncomeRatio: number,
    riskScore: number,
    riskProfile: 'conservative' | 'moderate' | 'aggressive'
  },
  
  // Metadata
  onboardingCompletedAt: timestamp,
  onboardingDuration: number,      // seconds
  completionPercentage: number
}
```

### City Tier Mapping

```javascript
const CITY_TIERS = {
  tier1: ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad'],
  tier2: ['jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad', 'patna'],
  tier3: [] // All others default to tier 3
};
```

### Expense Category Definitions

```javascript
const EXPENSE_CATEGORIES = [
  { id: 'housing', name: 'Housing', icon: '🏠', typicalRange: '25-40%' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', typicalRange: '10-20%' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', typicalRange: '5-10%' },
  { id: 'utilities', name: 'Utilities', icon: '⚡', typicalRange: '5-10%' },
  { id: 'food', name: 'Food & Groceries', icon: '🍽️', typicalRange: '15-25%' },
  { id: 'children', name: 'Children', icon: '👶', typicalRange: '10-25%' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', typicalRange: '5-15%' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🎭', typicalRange: '5-15%' },
  { id: 'investments', name: 'Investments', icon: '📈', typicalRange: '20-30%' },
  { id: 'miscellaneous', name: 'Miscellaneous', icon: '📦', typicalRange: '5-10%' }
];
```



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Phase Navigation Preserves Data

For any onboarding state and any phase number, navigating forward then backward should preserve all entered data without loss.

**Validates: Requirements 1.4**

### Property 2: Progress Persistence Across Sessions

For any onboarding state, saving to localStorage then reloading the page should restore the exact same state including current phase and all entered data.

**Validates: Requirements 1.6, 18.2, 18.3**

### Property 3: Completion Percentage Accuracy

For any onboarding state, the displayed completion percentage should equal (number of filled fields / total fields) * 100, accounting for conditional fields.

**Validates: Requirements 1.2, 22.3**

### Property 4: Conditional Field Display

For any marital status value, spouse fields should be visible if and only if marital status equals "Married".

**Validates: Requirements 2.2, 4.4**

### Property 5: Dynamic Form Addition

For any number of children N (0 ≤ N ≤ 10), adding N children should result in exactly N child expense form groups being rendered.

**Validates: Requirements 2.3, 10.1, 10.4**

### Property 6: Smart Defaults Scale with Context

For any city tier T and income I, housing expense defaults should equal I * (0.35 for tier 1, 0.30 for tier 2, 0.25 for tier 3).

**Validates: Requirements 5.5, 23.1**

### Property 7: Smart Defaults Scale with Family Size

For any family size F, grocery defaults should equal F * 3000.

**Validates: Requirements 9.3, 23.2**

### Property 8: Annual to Monthly Conversion

For any annual bonus amount A, the monthly income calculation should include A / 12.

**Validates: Requirements 4.2**

### Property 9: Total Income Calculation

For any set of income sources, total monthly income should equal the sum of all individual income values.

**Validates: Requirements 4.5**

### Property 10: Category Total Calculation

For any expense category and any set of expense items within that category, the category total should equal the sum of all item values.

**Validates: Requirements 5.3, 6.3, 7.3, 8.2, 9.2, 11.2, 12.2, 13.2, 14.3**

### Property 11: Category Percentage Calculation

For any expense category total C and total income I where I > 0, the displayed percentage should equal (C / I) * 100.

**Validates: Requirements 5.3, 6.3, 7.3, 8.2, 9.2, 11.2, 12.2, 13.2, 14.3**

### Property 12: Threshold-Based Warnings

For any expense category with threshold T and percentage P, a warning should be displayed if and only if P > T.

**Validates: Requirements 5.4, 6.4, 7.4, 7.5, 8.5, 9.4, 9.5, 10.5, 11.4, 11.5, 12.4, 13.3, 14.5, 16.4**

### Property 13: Total Expenses Calculation

For any complete expense data, total monthly expenses should equal the sum of all category totals.

**Validates: Requirements 17.1**

### Property 14: Remaining Income Calculation

For any total income I and total expenses E, remaining income should equal I - E.

**Validates: Requirements 17.3**

### Property 15: Budget Validation Blocking

For any onboarding state where total expenses exceed total income, the completion button should be disabled.

**Validates: Requirements 17.2, 17.4**

### Property 16: Total Assets Calculation

For any set of assets, total assets should equal the sum of all individual asset values.

**Validates: Requirements 15.2**

### Property 17: Total Liabilities Calculation

For any set of liabilities, total liabilities should equal the sum of all outstanding amounts.

**Validates: Requirements 16.3**

### Property 18: Net Worth Calculation

For any total assets A and total liabilities L, net worth should equal A - L.

**Validates: Requirements 16.5**

### Property 19: Debt-to-Income Ratio Calculation

For any total EMI E and total income I where I > 0, debt-to-income ratio should equal E / I.

**Validates: Requirements 16.3**

### Property 20: Asset Categorization

For any asset type, it should be categorized as exactly one of: Liquid (bank, cash), Semi-Liquid (FD, mutual funds, stocks), or Illiquid (real estate, gold).

**Validates: Requirements 15.5**

### Property 21: Investment Type Distinction

For any investment amount, it should be categorized as either equity or debt, and the sum of equity and debt amounts should equal total investment amount.

**Validates: Requirements 13.5**

### Property 22: Goal Timeline Categorization

For any goal with timeline T years, it should be categorized as Short-term if T < 3, Medium-term if 3 ≤ T ≤ 7, or Long-term if T > 7.

**Validates: Requirements 3.2**

### Property 23: Risk Score Calculation

For any user profile with age A, debt-to-income ratio D, emergency fund E, and monthly expenses M, risk score should increase when D > 0.4 or E < 6*M.

**Validates: Requirements 25.1, 25.3, 25.4**

### Property 24: Risk Profile Categorization

For any risk score S, risk profile should be Conservative if S < 40, Moderate if 40 ≤ S < 70, or Aggressive if S ≥ 70.

**Validates: Requirements 25.2**

### Property 25: Mandatory Field Validation

For any mandatory field that is empty, attempting to advance to the next phase should display the error "This field is required" and prevent advancement.

**Validates: Requirements 19.1, 19.5**

### Property 26: Numeric Field Validation

For any numeric field containing non-numeric characters, the validation should display the error "Please enter a valid number" and prevent advancement.

**Validates: Requirements 19.2, 19.5**

### Property 27: Negative Value Validation

For any income or expense field with a negative value, the validation should display an appropriate error message and prevent advancement.

**Validates: Requirements 4.6**

### Property 28: Custom Category Limit

For any onboarding state, the number of custom miscellaneous expense categories should be limited to a maximum of 10.

**Validates: Requirements 14.4**

### Property 29: Smart Defaults Override

For any field with a smart default value D, entering a user value U should replace D with U in all calculations.

**Validates: Requirements 23.5**

### Property 30: Skip Optional Fields Progression

For any phase with only optional fields remaining unfilled, clicking "Next" should advance to the next phase without errors.

**Validates: Requirements 22.2**

### Property 31: Completion Button Visibility

For any onboarding state, the "Complete Setup" button should be visible if and only if all 4 phases are completed and all mandatory fields are filled.

**Validates: Requirements 20.2**

### Property 32: Data Persistence After Phase Completion

For any phase P, completing phase P should result in that phase's data being saved to localStorage before advancing to phase P+1.

**Validates: Requirements 1.5, 18.1**

### Property 33: Clear and Start Over

Clicking "Clear and Start Over" should remove all onboarding data from localStorage and reset the wizard to phase 1 with empty fields.

**Validates: Requirements 18.4**

### Property 34: Age-Based Investment Defaults

For any age A and income I, investment defaults should equal I * (0.30 if A < 30, 0.25 if 30 ≤ A ≤ 45, 0.20 if A > 45).

**Validates: Requirements 13.4, 23.4**

### Property 35: School Type Defaults

For any school type S, school fees defaults should equal 2000 for government, 10000 for private, or 30000 for international schools.

**Validates: Requirements 10.3, 23.3**

## Error Handling

### Validation Errors

**Strategy**: Inline validation with immediate feedback

**Error Types**:
1. **Required Field**: Display "This field is required" below empty mandatory fields
2. **Invalid Format**: Display format-specific messages (e.g., "Please enter a valid number")
3. **Range Violation**: Display "Value must be between X and Y"
4. **Business Rule**: Display contextual warnings (e.g., "Housing costs are high")

**Error Display**:
```html
<div class="error-message" style="color: var(--red); font-size: 12px; margin-top: 4px;">
  ⚠️ Error message text
</div>
```

**Error Clearing**: Errors clear automatically when user corrects the input

### Data Persistence Errors

**localStorage Full**:
- Catch QuotaExceededError
- Display: "Storage full. Please complete onboarding or clear browser data."
- Fallback: Store only current phase data, discard history

**localStorage Unavailable**:
- Detect at initialization
- Display: "Browser storage disabled. Enable cookies to save progress."
- Fallback: Session-only mode (data lost on page refresh)

### Network Errors (Supabase Transfer)

**Connection Failure**:
- Retry 3 times with exponential backoff (1s, 2s, 4s)
- Display: "Connection error. Retrying..."
- Fallback: Keep data in localStorage, show "Complete Later" button

**Server Error**:
- Display: "Server error. Your data is saved locally. Please try again later."
- Provide manual retry button
- Log error details for debugging

### Calculation Errors

**Division by Zero**:
- Check income > 0 before percentage calculations
- Display 0% if income is zero
- Show warning: "Add income to see expense percentages"

**Invalid Data Types**:
- Sanitize all inputs with `parseFloat()` and default to 0
- Log warning for debugging
- Continue execution with safe defaults

### Browser Compatibility

**Unsupported Features**:
- Check for localStorage support at initialization
- Check for ES6 support (arrow functions, template literals)
- Display upgrade message for IE11 and below
- Graceful degradation: Disable smart defaults if calculations fail

### User Experience Errors

**Accidental Navigation**:
- Warn before leaving page if onboarding incomplete
- Use `beforeunload` event: "Your progress is saved. You can return anytime."

**Timeout**:
- No session timeout during onboarding
- Data persists indefinitely in localStorage
- Show "Welcome back" message on return

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and integration points
- Specific UI interactions (button clicks, form submissions)
- Edge cases (age < 18, negative values, empty fields)
- Integration with existing dashboard
- localStorage operations
- Supabase data transfer

**Property-Based Tests**: Verify universal properties across all inputs
- Calculation correctness across random inputs
- Data persistence round-trips
- Validation rules for all field types
- Smart defaults for all contexts
- State transitions for all phases

### Property-Based Testing Configuration

**Library**: fast-check (JavaScript property-based testing library)

**Installation**:
```bash
npm install --save-dev fast-check
```

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `// Feature: enhanced-onboarding-complete-profile, Property N: [property text]`

**Example Property Test**:
```javascript
// Feature: enhanced-onboarding-complete-profile, Property 9: Total Income Calculation
test('total income equals sum of all income sources', () => {
  fc.assert(
    fc.property(
      fc.record({
        salary: fc.nat(200000),
        bonus: fc.nat(100000),
        rental: fc.nat(50000),
        business: fc.nat(100000),
        spouse: fc.nat(150000)
      }),
      (income) => {
        const total = calculateTotalIncome(income);
        const expected = income.salary + income.bonus/12 + income.rental + 
                        income.business + income.spouse;
        return Math.abs(total - expected) < 0.01; // Float comparison
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Framework**: Jest (existing FamLedger AI test framework)

**Test Categories**:

1. **Phase Rendering Tests**
   - Each phase renders correct form fields
   - Conditional fields appear/disappear correctly
   - Progress indicator updates correctly

2. **Validation Tests**
   - Required fields block progression when empty
   - Numeric fields reject non-numeric input
   - Age validation rejects < 18
   - Email validation rejects invalid formats
   - Negative values trigger appropriate errors

3. **Calculation Tests**
   - Income totals calculate correctly
   - Expense percentages calculate correctly
   - Net worth = assets - liabilities
   - Debt-to-income ratio calculates correctly
   - Risk score calculates correctly

4. **Smart Defaults Tests**
   - City tier determines housing defaults
   - Family size determines grocery defaults
   - Age determines investment defaults
   - School type determines fee defaults

5. **Persistence Tests**
   - Data saves to localStorage after each phase
   - Data restores correctly on page reload
   - Clear function removes all data
   - Supabase transfer succeeds with valid data

6. **Integration Tests**
   - Completed onboarding navigates to dashboard
   - Dashboard receives correct user data
   - Existing userData object extends correctly

### Test Data Generators

**For Property-Based Tests**:
```javascript
const generators = {
  age: fc.integer({ min: 18, max: 100 }),
  income: fc.integer({ min: 0, max: 10000000 }),
  expense: fc.integer({ min: 0, max: 500000 }),
  percentage: fc.float({ min: 0, max: 1 }),
  city: fc.constantFrom('mumbai', 'delhi', 'bangalore', 'jaipur', 'indore'),
  maritalStatus: fc.constantFrom('single', 'married', 'divorced', 'widowed'),
  familySize: fc.integer({ min: 1, max: 10 }),
  timeline: fc.integer({ min: 1, max: 30 })
};
```

### Coverage Goals

- Line coverage: > 80%
- Branch coverage: > 75%
- Function coverage: > 90%
- Property test coverage: All 35 properties implemented

### Testing Edge Cases

**Boundary Values**:
- Age: 17 (invalid), 18 (valid), 100 (valid)
- Income: 0, 1, 10000000
- Family size: 0, 1, 10, 11 (over limit)
- Timeline: 0, 1, 3, 7, 30

**Special Cases**:
- Empty strings in text fields
- Whitespace-only strings
- Very large numbers (> 1 crore)
- Decimal values in integer fields
- Special characters in text fields

**State Combinations**:
- Single with children (unusual but valid)
- Married without spouse income
- Zero income with expenses
- All optional fields skipped
- All fields filled

### Performance Testing

**Metrics**:
- Initial render: < 500ms
- Phase transition: < 200ms
- Validation: < 100ms
- localStorage save: < 50ms
- Calculation update: < 100ms

**Load Testing**:
- Test with maximum data (10 children, 10 vehicles, 10 custom categories)
- Verify no performance degradation
- Ensure smooth scrolling on mobile

### Accessibility Testing

**Manual Testing**:
- Keyboard navigation through all fields
- Screen reader compatibility (NVDA, JAWS)
- High contrast mode
- Zoom to 200%

**Automated Testing**:
- axe-core accessibility checks
- WCAG 2.1 AA compliance
- Color contrast ratios
- Focus indicators

### Mobile Testing

**Devices**:
- iPhone SE (320px width)
- iPhone 12 (390px width)
- Samsung Galaxy S21 (360px width)
- iPad (768px width)

**Test Cases**:
- No horizontal scroll
- Touch targets ≥ 44x44px
- Keyboard appears for appropriate input types
- Progress indicator visible at top
- Forms stack vertically

### Browser Testing

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Unsupported**:
- IE11 (show upgrade message)



## Implementation Details

### Phase 1: Basic Information

**Form Fields**:
```html
<input type="text" id="onb-name" required placeholder="Full Name">
<input type="number" id="onb-age" required min="18" max="100" placeholder="Age">
<select id="onb-gender" required>
  <option value="">Select Gender</option>
  <option value="male">Male</option>
  <option value="female">Female</option>
  <option value="other">Other</option>
</select>
<select id="onb-marital" required>
  <option value="">Marital Status</option>
  <option value="single">Single</option>
  <option value="married">Married</option>
  <option value="divorced">Divorced</option>
  <option value="widowed">Widowed</option>
</select>
<input type="text" id="onb-occupation" required placeholder="Occupation">
<select id="onb-city" required>
  <option value="">Select City</option>
  <!-- Tier 1 cities -->
  <option value="mumbai">Mumbai</option>
  <option value="delhi">Delhi</option>
  <option value="bangalore">Bangalore</option>
  <!-- ... more cities -->
</select>

<!-- Conditional: Spouse (shown when married) -->
<div id="spouse-section" style="display:none">
  <input type="text" id="onb-spouse-name" placeholder="Spouse Name">
  <input type="number" id="onb-spouse-age" min="18" placeholder="Spouse Age">
  <input type="text" id="onb-spouse-occupation" placeholder="Spouse Occupation">
  <input type="number" id="onb-spouse-income" min="0" placeholder="Spouse Monthly Income">
</div>

<!-- Dynamic: Children -->
<div id="children-section">
  <button type="button" onclick="addChild()">+ Add Child</button>
  <div id="children-list"></div>
</div>

<!-- Dynamic: Parents -->
<div id="parents-section">
  <button type="button" onclick="addParent()">+ Add Dependent Parent</button>
  <div id="parents-list"></div>
</div>
```

**JavaScript Logic**:
```javascript
function initPhase1() {
  // Load saved data if exists
  const data = loadOnboardingData();
  if (data.basicInfo) {
    populateFields(data.basicInfo);
  }
  
  // Setup event listeners
  document.getElementById('onb-marital').addEventListener('change', (e) => {
    const spouseSection = document.getElementById('spouse-section');
    spouseSection.style.display = e.target.value === 'married' ? 'block' : 'none';
  });
  
  document.getElementById('onb-city').addEventListener('change', (e) => {
    loadSmartDefaults(e.target.value);
  });
}

function addChild() {
  const childId = generateId();
  const html = `
    <div class="child-group" data-id="${childId}">
      <input type="text" placeholder="Child Name" data-field="name">
      <input type="number" placeholder="Age" min="0" max="25" data-field="age">
      <input type="text" placeholder="School Grade" data-field="grade">
      <button onclick="removeChild('${childId}')">Remove</button>
    </div>
  `;
  document.getElementById('children-list').insertAdjacentHTML('beforeend', html);
}

function validatePhase1() {
  const errors = [];
  
  // Required fields
  if (!getValue('onb-name')) errors.push({ field: 'onb-name', message: 'This field is required' });
  if (!getValue('onb-age')) errors.push({ field: 'onb-age', message: 'This field is required' });
  
  // Age validation
  const age = parseInt(getValue('onb-age'));
  if (age < 18) errors.push({ field: 'onb-age', message: 'Must be 18 or older' });
  
  // Conditional validation
  if (getValue('onb-marital') === 'married' && !getValue('onb-spouse-name')) {
    errors.push({ field: 'onb-spouse-name', message: 'Spouse name is required when married' });
  }
  
  return errors;
}
```

### Phase 2: Income Sources

**Form Structure**:
```html
<div class="income-section">
  <h3>Primary Income</h3>
  <input type="number" id="onb-salary" required min="0" placeholder="Monthly Salary">
  <input type="number" id="onb-bonus" min="0" placeholder="Annual Bonus (optional)">
  <div class="info-text">Bonus will be divided by 12 for monthly calculation</div>
</div>

<div class="income-section">
  <h3>Additional Income Sources</h3>
  <input type="number" id="onb-rental" min="0" placeholder="Rental Income">
  <input type="number" id="onb-business" min="0" placeholder="Business Income">
  <input type="number" id="onb-freelancing" min="0" placeholder="Freelancing Income">
  <input type="number" id="onb-investment-returns" min="0" placeholder="Investment Returns">
  <input type="number" id="onb-other-income" min="0" placeholder="Other Income">
</div>

<!-- Conditional: Spouse Income (if married) -->
<div id="spouse-income-section" style="display:none">
  <h3>Spouse Income</h3>
  <input type="number" id="onb-spouse-income" min="0" placeholder="Spouse Monthly Income">
</div>

<div class="income-summary">
  <h3>Total Monthly Household Income</h3>
  <div class="total-display" id="total-income-display">₹0</div>
</div>
```

**Calculation Logic**:
```javascript
function calculateTotalIncome() {
  const salary = parseFloat(getValue('onb-salary')) || 0;
  const bonus = (parseFloat(getValue('onb-bonus')) || 0) / 12;
  const rental = parseFloat(getValue('onb-rental')) || 0;
  const business = parseFloat(getValue('onb-business')) || 0;
  const freelancing = parseFloat(getValue('onb-freelancing')) || 0;
  const investmentReturns = parseFloat(getValue('onb-investment-returns')) || 0;
  const other = parseFloat(getValue('onb-other-income')) || 0;
  const spouse = parseFloat(getValue('onb-spouse-income')) || 0;
  
  const total = salary + bonus + rental + business + freelancing + investmentReturns + other + spouse;
  
  document.getElementById('total-income-display').textContent = formatCurrency(total);
  return total;
}

// Update total on any input change
document.querySelectorAll('.income-section input').forEach(input => {
  input.addEventListener('input', calculateTotalIncome);
});
```

### Phase 3: Monthly Expenses

**Category Organization**:
```html
<div class="expenses-phase">
  <!-- Housing -->
  <div class="expense-category">
    <h3>🏠 Housing</h3>
    <div class="category-info">Typical: 25-40% of income</div>
    <div class="expense-choice">
      <label><input type="radio" name="housing-type" value="emi"> Home EMI</label>
      <label><input type="radio" name="housing-type" value="rent"> Rent</label>
    </div>
    <input type="number" id="exp-housing-emi" min="0" placeholder="Monthly EMI">
    <input type="number" id="exp-housing-rent" min="0" placeholder="Monthly Rent">
    <input type="number" id="exp-property-tax" min="0" placeholder="Property Tax (optional)">
    <input type="number" id="exp-maintenance" min="0" placeholder="Maintenance Charges">
    <input type="number" id="exp-home-insurance" min="0" placeholder="Home Insurance">
    <div class="category-total">
      Total: <span id="housing-total">₹0</span> 
      (<span id="housing-percent">0%</span> of income)
    </div>
    <div class="warning" id="housing-warning" style="display:none">
      ⚠️ Housing costs are high - consider reviewing
    </div>
  </div>

  <!-- Transportation -->
  <div class="expense-category">
    <h3>🚗 Transportation</h3>
    <div class="category-info">Typical: 10-20% of income</div>
    <input type="number" id="exp-car-emi" min="0" placeholder="Car EMI">
    <input type="number" id="exp-petrol" min="0" placeholder="Petrol/Diesel">
    <input type="number" id="exp-car-insurance" min="0" placeholder="Car Insurance (monthly)">
    <input type="number" id="exp-car-maintenance" min="0" placeholder="Car Maintenance">
    <input type="number" id="exp-public-transport" min="0" placeholder="Public Transport">
    <button onclick="addVehicle()">+ Add Another Vehicle</button>
    <div id="vehicles-list"></div>
    <div class="category-total">
      Total: <span id="transport-total">₹0</span> 
      (<span id="transport-percent">0%</span> of income)
    </div>
  </div>

  <!-- Insurance -->
  <div class="expense-category">
    <h3>🛡️ Insurance</h3>
    <div class="category-info">Typical: 5-10% of income</div>
    <input type="number" id="exp-health-insurance" min="0" placeholder="Health Insurance (annual)">
    <input type="number" id="exp-term-insurance" min="0" placeholder="Term Insurance (annual)">
    <input type="number" id="exp-personal-accident" min="0" placeholder="Personal Accident (annual)">
    <div class="info-text">Annual premiums will be converted to monthly</div>
    <div class="category-total">
      Total: <span id="insurance-total">₹0</span> 
      (<span id="insurance-percent">0%</span> of income)
    </div>
  </div>

  <!-- Continue for all 20+ categories... -->
</div>
```

**Smart Defaults Implementation**:
```javascript
function loadSmartDefaults(city) {
  const income = calculateTotalIncome();
  const cityTier = getCityTier(city);
  const familySize = calculateFamilySize();
  const age = parseInt(getValue('onb-age'));
  
  // Housing defaults
  const housingPercent = cityTier === 1 ? 0.35 : cityTier === 2 ? 0.30 : 0.25;
  setDefaultValue('exp-housing-rent', income * housingPercent);
  
  // Groceries defaults
  setDefaultValue('exp-groceries', familySize * 3000);
  
  // Utilities defaults
  const utilitiesDefault = familySize <= 2 ? 4000 : familySize <= 4 ? 6000 : 8000;
  setDefaultValue('exp-electricity', utilitiesDefault * 0.4);
  setDefaultValue('exp-water', utilitiesDefault * 0.15);
  setDefaultValue('exp-internet', 1500);
  
  // Investment defaults
  const investmentPercent = age < 30 ? 0.30 : age <= 45 ? 0.25 : 0.20;
  setDefaultValue('exp-sip', income * investmentPercent);
}

function setDefaultValue(fieldId, value) {
  const field = document.getElementById(fieldId);
  if (field && !field.value) {  // Only set if empty
    field.value = Math.round(value);
    field.classList.add('smart-default');  // Visual indicator
  }
}
```

**Warning System**:
```javascript
function updateWarnings() {
  const income = calculateTotalIncome();
  
  // Housing warning
  const housingTotal = calculateCategoryTotal('housing');
  const housingPercent = income > 0 ? housingTotal / income : 0;
  const housingWarning = document.getElementById('housing-warning');
  if (housingPercent > 0.40) {
    housingWarning.style.display = 'block';
  } else {
    housingWarning.style.display = 'none';
  }
  
  // Transportation warning
  const transportTotal = calculateCategoryTotal('transportation');
  const transportPercent = income > 0 ? transportTotal / income : 0;
  if (transportPercent > 0.20) {
    showWarning('transport-warning', 'Transportation costs are high');
  }
  
  // Continue for all categories...
}
```



### Phase 4: Assets & Liabilities

**Form Structure**:
```html
<div class="assets-liabilities-phase">
  <!-- Assets Section -->
  <div class="assets-section">
    <h2>Assets</h2>
    
    <h3>Liquid Assets</h3>
    <input type="number" id="asset-bank" min="0" placeholder="Bank Balance">
    
    <h3>Semi-Liquid Assets</h3>
    <input type="number" id="asset-fd" min="0" placeholder="Fixed Deposits">
    <input type="number" id="asset-mutual-funds" min="0" placeholder="Mutual Funds">
    <input type="number" id="asset-stocks" min="0" placeholder="Stocks">
    
    <h3>Illiquid Assets</h3>
    <input type="number" id="asset-gold" min="0" placeholder="Gold (current value)">
    <button onclick="addProperty()">+ Add Real Estate</button>
    <div id="properties-list"></div>
    
    <div class="assets-summary">
      <h3>Total Assets</h3>
      <div class="total-display" id="total-assets-display">₹0</div>
      <div class="breakdown">
        <div>Liquid: <span id="liquid-assets">₹0</span></div>
        <div>Semi-Liquid: <span id="semi-liquid-assets">₹0</span></div>
        <div>Illiquid: <span id="illiquid-assets">₹0</span></div>
      </div>
    </div>
  </div>
  
  <!-- Liabilities Section -->
  <div class="liabilities-section">
    <h2>Liabilities</h2>
    <button onclick="addLiability()">+ Add Loan/Debt</button>
    <div id="liabilities-list"></div>
    
    <div class="liabilities-summary">
      <h3>Total Liabilities</h3>
      <div class="total-display" id="total-liabilities-display">₹0</div>
      <div class="debt-ratio">
        Debt-to-Income Ratio: <span id="debt-ratio">0%</span>
      </div>
      <div class="warning" id="debt-warning" style="display:none">
        ⚠️ High debt burden - consider debt consolidation
      </div>
    </div>
  </div>
  
  <!-- Net Worth -->
  <div class="net-worth-section">
    <h2>Net Worth</h2>
    <div class="net-worth-display" id="net-worth-display">₹0</div>
    <div class="calculation">
      Total Assets - Total Liabilities = Net Worth
    </div>
  </div>
</div>
```

**Liability Form Template**:
```javascript
function addLiability() {
  const liabilityId = generateId();
  const html = `
    <div class="liability-group" data-id="${liabilityId}">
      <select data-field="type">
        <option value="">Loan Type</option>
        <option value="home">Home Loan</option>
        <option value="car">Car Loan</option>
        <option value="personal">Personal Loan</option>
        <option value="creditCard">Credit Card Debt</option>
      </select>
      <input type="number" data-field="outstanding" min="0" placeholder="Outstanding Amount">
      <input type="number" data-field="interestRate" min="0" max="30" step="0.1" placeholder="Interest Rate (%)">
      <input type="number" data-field="emi" min="0" placeholder="Monthly EMI">
      <button onclick="removeLiability('${liabilityId}')">Remove</button>
    </div>
  `;
  document.getElementById('liabilities-list').insertAdjacentHTML('beforeend', html);
  
  // Add event listeners for calculation updates
  const group = document.querySelector(`[data-id="${liabilityId}"]`);
  group.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', updateLiabilitiesCalculations);
  });
}
```

**Calculations**:
```javascript
function updateAssetsCalculations() {
  // Liquid assets
  const bank = parseFloat(getValue('asset-bank')) || 0;
  const liquid = bank;
  
  // Semi-liquid assets
  const fd = parseFloat(getValue('asset-fd')) || 0;
  const mutualFunds = parseFloat(getValue('asset-mutual-funds')) || 0;
  const stocks = parseFloat(getValue('asset-stocks')) || 0;
  const semiLiquid = fd + mutualFunds + stocks;
  
  // Illiquid assets
  const gold = parseFloat(getValue('asset-gold')) || 0;
  const properties = Array.from(document.querySelectorAll('#properties-list .property-group'))
    .reduce((sum, prop) => sum + (parseFloat(prop.querySelector('[data-field="value"]').value) || 0), 0);
  const illiquid = gold + properties;
  
  // Total
  const totalAssets = liquid + semiLiquid + illiquid;
  
  // Update display
  document.getElementById('liquid-assets').textContent = formatCurrency(liquid);
  document.getElementById('semi-liquid-assets').textContent = formatCurrency(semiLiquid);
  document.getElementById('illiquid-assets').textContent = formatCurrency(illiquid);
  document.getElementById('total-assets-display').textContent = formatCurrency(totalAssets);
  
  updateNetWorth();
}

function updateLiabilitiesCalculations() {
  const liabilities = Array.from(document.querySelectorAll('#liabilities-list .liability-group'));
  const totalLiabilities = liabilities.reduce((sum, liability) => {
    const outstanding = parseFloat(liability.querySelector('[data-field="outstanding"]').value) || 0;
    return sum + outstanding;
  }, 0);
  
  const totalEMI = liabilities.reduce((sum, liability) => {
    const emi = parseFloat(liability.querySelector('[data-field="emi"]').value) || 0;
    return sum + emi;
  }, 0);
  
  const income = calculateTotalIncome();
  const debtRatio = income > 0 ? totalEMI / income : 0;
  
  // Update display
  document.getElementById('total-liabilities-display').textContent = formatCurrency(totalLiabilities);
  document.getElementById('debt-ratio').textContent = (debtRatio * 100).toFixed(1) + '%';
  
  // Show warning if debt ratio > 40%
  const debtWarning = document.getElementById('debt-warning');
  if (debtRatio > 0.40) {
    debtWarning.style.display = 'block';
  } else {
    debtWarning.style.display = 'none';
  }
  
  updateNetWorth();
}

function updateNetWorth() {
  const totalAssets = parseFloat(document.getElementById('total-assets-display').textContent.replace(/[₹,]/g, '')) || 0;
  const totalLiabilities = parseFloat(document.getElementById('total-liabilities-display').textContent.replace(/[₹,]/g, '')) || 0;
  const netWorth = totalAssets - totalLiabilities;
  
  document.getElementById('net-worth-display').textContent = formatCurrency(netWorth);
  document.getElementById('net-worth-display').style.color = netWorth >= 0 ? 'var(--green)' : 'var(--red)';
}
```

### Completion Summary

**Summary Display**:
```html
<div class="completion-summary">
  <h2>🎉 Profile Setup Complete!</h2>
  
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-label">Total Monthly Income</div>
      <div class="summary-value" id="summary-income">₹0</div>
    </div>
    
    <div class="summary-card">
      <div class="summary-label">Total Monthly Expenses</div>
      <div class="summary-value" id="summary-expenses">₹0</div>
    </div>
    
    <div class="summary-card">
      <div class="summary-label">Monthly Savings</div>
      <div class="summary-value" id="summary-savings">₹0</div>
    </div>
    
    <div class="summary-card">
      <div class="summary-label">Savings Rate</div>
      <div class="summary-value" id="summary-savings-rate">0%</div>
    </div>
    
    <div class="summary-card">
      <div class="summary-label">Net Worth</div>
      <div class="summary-value" id="summary-net-worth">₹0</div>
    </div>
    
    <div class="summary-card">
      <div class="summary-label">Risk Profile</div>
      <div class="summary-value" id="summary-risk-profile">Moderate</div>
    </div>
  </div>
  
  <div class="expense-breakdown-chart">
    <h3>Expense Breakdown</h3>
    <canvas id="expense-chart"></canvas>
  </div>
  
  <div class="completion-actions">
    <button class="primary-btn" onclick="completeOnboarding()">
      Complete Setup & Go to Dashboard →
    </button>
    <button class="secondary-btn" onclick="goBackToReview()">
      ← Review & Edit
    </button>
  </div>
  
  <div class="completion-time">
    Completed in <span id="completion-time">0</span> minutes
  </div>
</div>
```

**Risk Score Calculation**:
```javascript
function calculateRiskScore() {
  const age = parseInt(getValue('onb-age'));
  const income = calculateTotalIncome();
  const expenses = calculateTotalExpenses();
  const emergencyFund = parseFloat(getValue('asset-bank')) || 0;
  const debtRatio = calculateDebtToIncomeRatio();
  
  let score = 50; // Base score
  
  // Age factor (younger = higher risk tolerance)
  if (age < 30) score += 20;
  else if (age < 45) score += 10;
  else score -= 10;
  
  // Emergency fund factor
  const monthsOfExpenses = expenses > 0 ? emergencyFund / expenses : 0;
  if (monthsOfExpenses >= 6) score += 15;
  else if (monthsOfExpenses >= 3) score += 5;
  else score -= 15;
  
  // Debt factor
  if (debtRatio < 0.20) score += 10;
  else if (debtRatio < 0.40) score += 0;
  else score -= 20;
  
  // Savings rate factor
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  if (savingsRate >= 0.30) score += 15;
  else if (savingsRate >= 0.20) score += 10;
  else if (savingsRate >= 0.10) score += 5;
  else score -= 10;
  
  // Dependents factor
  const childrenCount = document.querySelectorAll('#children-list .child-group').length;
  const parentsCount = document.querySelectorAll('#parents-list .parent-group').length;
  score -= (childrenCount * 5 + parentsCount * 5);
  
  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

function categorizeRiskProfile(score) {
  if (score < 40) return 'Conservative';
  if (score < 70) return 'Moderate';
  return 'Aggressive';
}
```

### Persistence and Data Transfer

**localStorage Operations**:
```javascript
const STORAGE_KEY = 'famledger_onboarding_progress';

function saveProgress() {
  const data = {
    currentPhase: currentPhase,
    completedPhases: completedPhases,
    startTime: startTime,
    lastSaved: Date.now(),
    data: {
      basicInfo: collectBasicInfo(),
      goals: collectGoals(),
      income: collectIncome(),
      expenses: collectExpenses(),
      assets: collectAssets(),
      liabilities: collectLiabilities()
    }
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      showToast('Storage full. Please complete onboarding.', 'warning');
    }
    return false;
  }
}

function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error loading progress:', e);
    return null;
  }
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
```

**Supabase Transfer**:
```javascript
async function transferToSupabase() {
  const onboardingData = loadProgress();
  if (!onboardingData) return false;
  
  const profileData = {
    user_id: currentUserEmail,
    ...onboardingData.data,
    calculated: {
      totalIncome: calculateTotalIncome(),
      totalExpenses: calculateTotalExpenses(),
      remaining: calculateRemaining(),
      savingsRate: calculateSavingsRate(),
      totalAssets: calculateTotalAssets(),
      totalLiabilities: calculateTotalLiabilities(),
      netWorth: calculateNetWorth(),
      debtToIncomeRatio: calculateDebtToIncomeRatio(),
      riskScore: calculateRiskScore(),
      riskProfile: categorizeRiskProfile(calculateRiskScore())
    },
    onboarding_completed_at: new Date().toISOString(),
    onboarding_duration: Math.floor((Date.now() - onboardingData.startTime) / 1000),
    completion_percentage: calculateCompletionPercentage()
  };
  
  try {
    const { data, error } = await sb
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' });
    
    if (error) throw error;
    
    // Clear localStorage after successful transfer
    clearProgress();
    
    // Update global userData object
    userData.profile = profileData;
    
    return true;
  } catch (error) {
    console.error('Error transferring to Supabase:', error);
    showToast('Error saving profile. Your data is safe locally. Please try again.', 'error');
    return false;
  }
}
```

### UI/UX Specifications

**Progress Indicator Design**:
```css
.progress-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.progress-step::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border2);
  z-index: -1;
}

.progress-step:last-child::after {
  display: none;
}

.progress-step.completed::after {
  background: var(--green);
}

.progress-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg3);
  border: 2px solid var(--border2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.progress-step.completed .progress-circle {
  background: var(--green);
  border-color: var(--green);
  color: white;
}

.progress-step.active .progress-circle {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
  box-shadow: 0 0 16px var(--accent-glow);
}

.progress-label {
  font-size: 11px;
  color: var(--text3);
  text-align: center;
}

.progress-step.active .progress-label {
  color: var(--accent2);
  font-weight: 600;
}

.progress-percentage {
  font-size: 24px;
  font-weight: 800;
  color: var(--accent2);
  font-family: var(--mono);
}

@media (max-width: 768px) {
  .progress-indicator {
    padding: 12px;
  }
  
  .progress-circle {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .progress-label {
    font-size: 9px;
  }
  
  .progress-percentage {
    font-size: 18px;
  }
}
```

**Form Field Styling**:
```css
.onboarding-input {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  color: var(--text);
  font-size: 14px;
  font-family: var(--font);
  outline: none;
  transition: border-color 0.2s;
  min-height: 44px; /* Touch-friendly */
}

.onboarding-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.onboarding-input.smart-default {
  background: rgba(59, 126, 255, 0.05);
  border-color: rgba(59, 126, 255, 0.3);
}

.onboarding-input.error {
  border-color: var(--red);
}

.error-message {
  color: var(--red);
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.warning-message {
  background: var(--yellow-dim);
  border: 1px solid var(--yellow);
  border-radius: var(--radius-sm);
  padding: 12px;
  color: var(--yellow);
  font-size: 13px;
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.tip-message {
  background: var(--accent-glow);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: 12px;
  color: var(--accent2);
  font-size: 13px;
  margin-top: 12px;
}
```

**Mobile Responsiveness**:
```css
@media (max-width: 768px) {
  .onboarding-wizard {
    padding: 16px;
  }
  
  .expense-category {
    margin-bottom: 24px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .phase-navigation {
    flex-direction: column;
    gap: 12px;
  }
  
  .phase-navigation button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .onboarding-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
```

**Navigation Buttons**:
```html
<div class="phase-navigation">
  <button class="secondary-btn" onclick="previousPhase()" id="back-btn">
    ← Back
  </button>
  <button class="secondary-btn" onclick="saveAndExit()">
    Save & Exit
  </button>
  <button class="primary-btn" onclick="nextPhase()" id="next-btn">
    Next →
  </button>
</div>
```



### Expense Breakdown Chart

**Chart Implementation** (using Chart.js):
```javascript
function renderExpenseChart() {
  const ctx = document.getElementById('expense-chart').getContext('2d');
  
  const categories = [
    { name: 'Housing', total: calculateCategoryTotal('housing'), color: '#3b7eff' },
    { name: 'Transportation', total: calculateCategoryTotal('transportation'), color: '#10d98e' },
    { name: 'Insurance', total: calculateCategoryTotal('insurance'), color: '#f5c542' },
    { name: 'Utilities', total: calculateCategoryTotal('utilities'), color: '#a78bfa' },
    { name: 'Food', total: calculateCategoryTotal('food'), color: '#f4495c' },
    { name: 'Children', total: calculateCategoryTotal('children'), color: '#06b6d4' },
    { name: 'Healthcare', total: calculateCategoryTotal('healthcare'), color: '#ec4899' },
    { name: 'Lifestyle', total: calculateCategoryTotal('lifestyle'), color: '#f59e0b' },
    { name: 'Investments', total: calculateCategoryTotal('investments'), color: '#8b5cf6' },
    { name: 'Miscellaneous', total: calculateCategoryTotal('miscellaneous'), color: '#6b7280' }
  ].filter(cat => cat.total > 0);
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.total),
        backgroundColor: categories.map(c => c.color),
        borderWidth: 2,
        borderColor: '#0b0f1a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e8edf5',
            font: { family: 'Sora', size: 12 },
            padding: 12
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = formatCurrency(context.parsed);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}
```

### Helper Functions

**Utility Functions**:
```javascript
// Format currency
function formatCurrency(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

// Get value from input
function getValue(fieldId) {
  const field = document.getElementById(fieldId);
  return field ? field.value : '';
}

// Set value to input
function setValue(fieldId, value) {
  const field = document.getElementById(fieldId);
  if (field) field.value = value;
}

// Generate unique ID
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get city tier
function getCityTier(city) {
  const tier1 = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad'];
  const tier2 = ['jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam'];
  
  const cityLower = city.toLowerCase();
  if (tier1.includes(cityLower)) return 1;
  if (tier2.includes(cityLower)) return 2;
  return 3;
}

// Calculate family size
function calculateFamilySize() {
  let size = 1; // User
  
  if (getValue('onb-marital') === 'married') size += 1; // Spouse
  
  const children = document.querySelectorAll('#children-list .child-group').length;
  size += children;
  
  const parents = document.querySelectorAll('#parents-list .parent-group').length;
  size += parents;
  
  return size;
}

// Calculate completion percentage
function calculateCompletionPercentage() {
  const allFields = document.querySelectorAll('.onboarding-input');
  const filledFields = Array.from(allFields).filter(field => {
    if (field.hasAttribute('required')) return field.value.trim() !== '';
    return field.value.trim() !== '';
  });
  
  return Math.round((filledFields.length / allFields.length) * 100);
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Confirm before leaving
window.addEventListener('beforeunload', (e) => {
  const progress = loadProgress();
  if (progress && progress.currentPhase < 4) {
    e.preventDefault();
    e.returnValue = 'Your progress is saved. You can return anytime.';
  }
});
```

### Integration with Existing Dashboard

**Post-Onboarding Flow**:
```javascript
async function completeOnboarding() {
  // Calculate completion time
  const progress = loadProgress();
  const duration = Math.floor((Date.now() - progress.startTime) / 60000); // minutes
  
  // Log completion time for analytics
  if (duration > 10) {
    console.log('Onboarding exceeded 10 minutes:', duration);
    // Could send to analytics service
  }
  
  // Show loading state
  showToast('Saving your profile...', 'info');
  
  // Transfer to Supabase
  const success = await transferToSupabase();
  
  if (success) {
    showToast('Profile saved successfully!', 'success');
    
    // Update global userData
    userData.profile = collectAllData();
    
    // Invalidate computation cache
    computeCache.invalidate();
    
    // Navigate to dashboard
    setTimeout(() => {
      navigateTo('overview');
      renderOverview();
    }, 1000);
  } else {
    showToast('Error saving profile. Please try again.', 'error');
  }
}

// Extend existing userData object
function extendUserData() {
  const onboardingData = loadProgress();
  if (!onboardingData) return;
  
  // Merge onboarding data with existing structure
  userData.profile = {
    ...userData.profile,
    ...onboardingData.data.basicInfo
  };
  
  userData.income = {
    ...userData.income,
    ...onboardingData.data.income
  };
  
  // Expenses need special handling to match existing structure
  const expenses = onboardingData.data.expenses;
  userData.expenses.monthly = convertExpensesToMonthlyArray(expenses);
  
  // Assets and liabilities
  userData.investments = convertAssetsToInvestments(onboardingData.data.assets);
  userData.loans = onboardingData.data.liabilities;
  
  // Update calculated fields
  userData.liquidSavings = onboardingData.data.assets.bank || 0;
  userData.termCover = (onboardingData.data.expenses.insurance?.term || 0) * 12 * 10; // Estimate
}

// Convert expense structure
function convertExpensesToMonthlyArray(expenses) {
  const monthly = [];
  
  // Housing
  if (expenses.housing.emi) monthly.push({ n: 'Home EMI', v: expenses.housing.emi });
  if (expenses.housing.rent) monthly.push({ n: 'Rent', v: expenses.housing.rent });
  if (expenses.housing.maintenance) monthly.push({ n: 'Maintenance', v: expenses.housing.maintenance });
  
  // Transportation
  if (expenses.transportation.carEMI) monthly.push({ n: 'Car EMI', v: expenses.transportation.carEMI });
  if (expenses.transportation.petrol) monthly.push({ n: 'Petrol', v: expenses.transportation.petrol });
  
  // Continue for all categories...
  
  return monthly;
}
```

### Performance Optimizations

**Debounced Calculations**:
```javascript
// Debounce expensive calculations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply to calculation updates
const debouncedUpdateCalculations = debounce(updateAllCalculations, 300);

// Attach to all input fields
document.querySelectorAll('.onboarding-input').forEach(input => {
  input.addEventListener('input', debouncedUpdateCalculations);
});
```

**Lazy Loading**:
```javascript
// Only render current phase
function renderPhase(phaseNumber) {
  // Hide all phases
  document.querySelectorAll('.phase-content').forEach(phase => {
    phase.style.display = 'none';
  });
  
  // Show current phase
  const currentPhaseElement = document.getElementById(`phase-${phaseNumber}`);
  if (currentPhaseElement) {
    currentPhaseElement.style.display = 'block';
  }
  
  // Update progress indicator
  updateProgressIndicator(phaseNumber);
}
```

**Memoization**:
```javascript
// Cache expensive calculations
const calculationCache = new Map();

function getCachedCalculation(key, calculator) {
  if (!calculationCache.has(key)) {
    calculationCache.set(key, calculator());
  }
  return calculationCache.get(key);
}

// Invalidate cache on data change
function invalidateCache() {
  calculationCache.clear();
}
```

## Security Considerations

### Data Privacy

1. **No Sensitive Data in URLs**: All data stored in localStorage and Supabase, never in URL parameters
2. **localStorage Encryption**: Consider encrypting sensitive financial data before storing
3. **Supabase RLS**: Row-level security ensures users can only access their own data
4. **No Third-Party Analytics**: Financial data never sent to external analytics services

### Input Sanitization

```javascript
function sanitizeInput(value, type = 'text') {
  if (type === 'number') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Math.max(0, num);
  }
  
  if (type === 'text') {
    return value.trim().replace(/[<>]/g, ''); // Remove potential XSS
  }
  
  return value;
}
```

### CSRF Protection

- All Supabase requests use authenticated session tokens
- No state-changing operations via GET requests
- Supabase handles CSRF protection automatically

## Accessibility

### Keyboard Navigation

```javascript
// Enable keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const nextInput = findNextInput(e.target);
    if (nextInput) {
      nextInput.focus();
    } else {
      nextPhase();
    }
  }
});

function findNextInput(currentInput) {
  const inputs = Array.from(document.querySelectorAll('.onboarding-input:not([disabled])'));
  const currentIndex = inputs.indexOf(currentInput);
  return inputs[currentIndex + 1] || null;
}
```

### Screen Reader Support

```html
<!-- Proper labels -->
<label for="onb-name">Full Name <span class="required">*</span></label>
<input id="onb-name" type="text" aria-required="true" aria-describedby="name-help">
<div id="name-help" class="help-text">Enter your full legal name</div>

<!-- Error announcements -->
<div role="alert" aria-live="polite" id="error-announcer"></div>

<!-- Progress announcements -->
<div role="status" aria-live="polite" aria-atomic="true">
  Phase <span id="current-phase-number">1</span> of 4: <span id="current-phase-name">Basic Information</span>
</div>
```

### Focus Management

```javascript
function nextPhase() {
  // Validate current phase
  const errors = validateCurrentPhase();
  if (errors.length > 0) {
    // Focus first error field
    const firstErrorField = document.getElementById(errors[0].field);
    if (firstErrorField) {
      firstErrorField.focus();
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  
  // Save and advance
  saveProgress();
  currentPhase++;
  renderPhase(currentPhase);
  
  // Focus first input of new phase
  const firstInput = document.querySelector('.phase-content:not([style*="display: none"]) .onboarding-input');
  if (firstInput) {
    firstInput.focus();
  }
}
```

## Deployment Considerations

### Single-File Integration

All onboarding code must be added to `famledgerai/index.html`:

1. **CSS**: Add to existing `<style>` block
2. **HTML**: Add onboarding wizard container after auth section
3. **JavaScript**: Add to existing `<script type="module">` block
4. **Dependencies**: Use existing libraries (Chart.js already included)

### Feature Flag

```javascript
// Enable/disable onboarding for gradual rollout
const ONBOARDING_ENABLED = true;

function checkOnboardingRequired() {
  if (!ONBOARDING_ENABLED) return false;
  
  // Check if user has completed onboarding
  const { data: profile } = await sb
    .from('user_profiles')
    .select('onboarding_completed_at')
    .eq('user_id', currentUserEmail)
    .single();
  
  return !profile || !profile.onboarding_completed_at;
}
```

### Database Schema

**Supabase Table**: `user_profiles`

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL REFERENCES auth.users(email),
  
  -- Basic Info
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT,
  marital_status TEXT,
  occupation TEXT,
  city TEXT,
  city_tier INTEGER,
  
  -- Family (JSONB)
  spouse JSONB,
  children JSONB[],
  parents JSONB[],
  
  -- Goals (JSONB)
  goals JSONB[],
  
  -- Income (JSONB)
  income JSONB NOT NULL,
  
  -- Expenses (JSONB)
  expenses JSONB NOT NULL,
  
  -- Assets (JSONB)
  assets JSONB NOT NULL,
  
  -- Liabilities (JSONB)
  liabilities JSONB[],
  
  -- Calculated (JSONB)
  calculated JSONB,
  
  -- Metadata
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_duration INTEGER,
  completion_percentage INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.email() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.email() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.email() = user_id);
```

### Rollback Plan

If issues arise:

1. **Disable Feature Flag**: Set `ONBOARDING_ENABLED = false`
2. **Revert to Basic Signup**: Users go directly to dashboard
3. **Data Preservation**: Partial onboarding data remains in localStorage
4. **Manual Migration**: Admin can manually migrate localStorage data to Supabase

## Future Enhancements

### Phase 2 Considerations

Features intentionally deferred to future phases:

1. **Multi-language Support**: Hindi, Telugu translations
2. **Document Upload**: Salary slips, bank statements for verification
3. **Bank Account Linking**: Automated expense import via Plaid/Finicity
4. **Social Login**: OAuth with Google, Facebook
5. **Email Verification**: Verify email during onboarding
6. **Tax Calculation**: Automatic tax estimation based on income
7. **Investment Portfolio Analysis**: Detailed portfolio breakdown
8. **AI-Powered Suggestions**: Real-time recommendations during data entry
9. **Voice Input**: Voice-to-text for faster data entry
10. **Guided Tour**: Interactive tutorial for first-time users

### Extensibility Points

The design allows for easy extension:

- **New Expense Categories**: Add to `EXPENSE_CATEGORIES` array
- **New Smart Defaults**: Extend `SmartDefaultsEngine` class
- **New Validation Rules**: Add to `ValidationEngine` class
- **New Calculations**: Extend `CalculationEngine` class
- **New Risk Factors**: Modify `calculateRiskScore()` function

## Conclusion

This design provides a comprehensive, production-ready specification for the Enhanced Onboarding feature. The implementation follows FamLedger AI's single-file architecture while introducing a sophisticated multi-phase wizard that collects detailed financial information from Indian users.

Key design decisions:
- **Progressive disclosure** reduces cognitive load
- **Smart defaults** minimize data entry time
- **Real-time validation** prevents errors
- **localStorage persistence** ensures no data loss
- **Mobile-first design** ensures accessibility
- **Property-based testing** ensures correctness

The design achieves the target metrics:
- Completion time < 10 minutes (through smart defaults and optional fields)
- Completion rate > 80% (through progress persistence and clear navigation)
- Mobile completion > 60% (through responsive design and touch-friendly UI)
- Profile completeness > 70% (through smart defaults and guided flow)

Implementation can proceed directly from this specification with confidence in correctness, usability, and maintainability.
