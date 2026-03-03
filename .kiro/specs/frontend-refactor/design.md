# Design Document: Frontend Refactoring

## Overview

This document outlines the technical design for refactoring the monolithic 15,000+ line `index.html` into a maintainable, modular structure using Vite, Vitest, and modern JavaScript practices. The refactor will NOT change any UI or functionality - it's purely structural improvements.

## Architecture

### Current State (Before Refactor)

```
famledgerai/
├── index.html (15,000+ lines)
│   ├── <style> tags (CSS)
│   ├── <script> tags (JavaScript)
│   │   ├── Supabase client
│   │   ├── State management
│   │   ├── Forecast engine
│   │   ├── Risk engine
│   │   ├── Stress engine
│   │   ├── UI rendering
│   │   ├── Data access layer
│   │   └── Event handlers
│   └── <body> (HTML)
├── api/[...catchall].js
├── vercel.json
└── package.json
```

**Problems:**
- Hard to find specific code
- No module boundaries
- No unit tests
- No type safety
- Hard to refactor safely
- Merge conflicts on every change

### Target State (After Refactor)

```
famledgerai/
├── src/
│   ├── main.js                      # Entry point
│   ├── index.html                   # HTML template
│   ├── lib/
│   │   ├── supabaseClient.js        # Supabase singleton
│   │   └── utils.js                 # Shared utilities
│   ├── engines/
│   │   ├── forecastEngine.js        # Pure functions
│   │   ├── forecastEngine.test.js
│   │   ├── riskEngine.js
│   │   ├── riskEngine.test.js
│   │   ├── stressEngine.js
│   │   └── stressEngine.test.js
│   ├── ui/
│   │   ├── renderOverview.js
│   │   ├── renderForecast.js
│   │   ├── renderRisk.js
│   │   ├── renderStress.js
│   │   └── components/
│   ├── store/
│   │   ├── userStore.js             # Reactive state
│   │   └── computeCache.js          # Memoization
│   ├── dal/
│   │   ├── householdContext.js      # Phase 2
│   │   ├── loadData.js
│   │   └── saveData.js
│   └── styles/
│       └── main.css
├── api/[...catchall].js             # Unchanged
├── vite.config.js                   # Vite configuration
├── vitest.config.js                 # Test configuration
├── .eslintrc.js                     # Linting rules
├── .github/workflows/ci.yml         # CI/CD
├── vercel.json                      # Unchanged
└── package.json                     # Updated scripts
```

**Benefits:**
- Clear separation of concerns
- Easy to find and modify code
- Unit tests for critical logic
- Fast dev server with HMR
- Automated CI/CD checks
- Smaller, more maintainable files

---

## Component Design

### 1. Entry Point (`src/main.js`)

**Purpose**: Initialize the app, set up Supabase auth, and mount the UI.

```javascript
import { sb, initAuth } from './lib/supabaseClient.js';
import { initUserStore } from './store/userStore.js';
import { loadHouseholdContext } from './dal/householdContext.js';
import { loadUserData } from './dal/loadData.js';
import { renderOverview } from './ui/renderOverview.js';
import './styles/main.css';

// Initialize auth
initAuth();

// Set up auth state change handler
sb.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    await loadHouseholdContext();
    await loadUserData(session.user.email);
    renderOverview();
  } else if (event === 'SIGNED_OUT') {
    // Reset state and show auth screen
  }
});

// Check for existing session
sb.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    // User is already logged in
  } else {
    // Show landing page
  }
});
```

---

### 2. Supabase Client (`src/lib/supabaseClient.js`)

**Purpose**: Singleton Supabase client shared across the app.

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Reactive state
export let currentUserEmail = '';
export let isAuthenticated = false;

export function initAuth() {
  sb.auth.onAuthStateChange((event, session) => {
    currentUserEmail = session?.user?.email || '';
    isAuthenticated = !!session;
  });
}
```

---

### 3. Forecast Engine (`src/engines/forecastEngine.js`)

**Purpose**: Pure function that calculates 15-year financial forecast.

```javascript
/**
 * Calculate 15-year financial forecast
 * @param {Object} userData - User financial data
 * @param {Object} assumptions - Forecast assumptions (inflation, returns, etc.)
 * @returns {Array<Object>} - Array of yearly projections
 */
export function calculateForecast(userData, assumptions) {
  const years = [];
  let currentNetWorth = calculateInitialNetWorth(userData);
  
  for (let year = 0; year < 15; year++) {
    const yearData = {
      year: new Date().getFullYear() + year,
      age: userData.profile.age + year,
      income: calculateProjectedIncome(userData, assumptions, year),
      expenses: calculateProjectedExpenses(userData, assumptions, year),
      investments: calculateProjectedInvestments(currentNetWorth, assumptions, year),
      netWorth: currentNetWorth
    };
    
    currentNetWorth = yearData.netWorth + yearData.income - yearData.expenses + yearData.investments;
    years.push(yearData);
  }
  
  return years;
}

function calculateInitialNetWorth(userData) {
  // Sum all investments - all loans
  const totalInvestments = Object.values(userData.investments.byMember || {})
    .flatMap(member => [
      ...member.mutualFunds,
      ...member.stocks,
      ...member.fd,
      ...member.ppf
    ])
    .reduce((sum, inv) => sum + (inv.value || 0), 0);
  
  const totalLoans = Object.values(userData.loans.byMember || {})
    .flatMap(member => member)
    .reduce((sum, loan) => sum + (loan.outstanding || 0), 0);
  
  return totalInvestments - totalLoans + (userData.liquidSavings || 0);
}

function calculateProjectedIncome(userData, assumptions, year) {
  const currentIncome = (userData.income?.husband || 0) + (userData.income?.wife || 0);
  const growthRate = assumptions.incomeGrowth / 100;
  return currentIncome * Math.pow(1 + growthRate, year);
}

function calculateProjectedExpenses(userData, assumptions, year) {
  // Calculate total monthly expenses
  const monthlyExpenses = Object.values(userData.expenses?.byMonth || {})
    .flatMap(month => Object.values(month.byMember || {}))
    .flatMap(member => member)
    .reduce((sum, exp) => sum + (exp.v || exp.amount || 0), 0);
  
  const inflationRate = assumptions.expenseInflation / 100;
  return monthlyExpenses * 12 * Math.pow(1 + inflationRate, year);
}

function calculateProjectedInvestments(netWorth, assumptions, year) {
  const equityReturn = assumptions.equityReturn / 100;
  return netWorth * equityReturn;
}
```

**Tests** (`src/engines/forecastEngine.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { calculateForecast } from './forecastEngine.js';

describe('Forecast Engine', () => {
  const mockUserData = {
    profile: { age: 30 },
    income: { husband: 100000, wife: 80000 },
    expenses: {
      byMonth: {
        '2024-01': {
          byMember: {
            self: [{ v: 30000 }]
          }
        }
      }
    },
    investments: { byMember: {} },
    loans: { byMember: {} },
    liquidSavings: 500000
  };
  
  const mockAssumptions = {
    incomeGrowth: 8,
    expenseInflation: 6,
    equityReturn: 12,
    debtReturn: 7
  };
  
  it('should return 15 years of projections', () => {
    const result = calculateForecast(mockUserData, mockAssumptions);
    expect(result).toHaveLength(15);
  });
  
  it('should increase income by growth rate each year', () => {
    const result = calculateForecast(mockUserData, mockAssumptions);
    const year0Income = result[0].income;
    const year1Income = result[1].income;
    const expectedGrowth = 1.08; // 8% growth
    expect(year1Income / year0Income).toBeCloseTo(expectedGrowth, 2);
  });
  
  it('should increase expenses by inflation each year', () => {
    const result = calculateForecast(mockUserData, mockAssumptions);
    const year0Expenses = result[0].expenses;
    const year1Expenses = result[1].expenses;
    const expectedInflation = 1.06; // 6% inflation
    expect(year1Expenses / year0Expenses).toBeCloseTo(expectedInflation, 2);
  });
  
  it('should never have negative net worth when income > expenses', () => {
    const result = calculateForecast(mockUserData, mockAssumptions);
    result.forEach(year => {
      expect(year.netWorth).toBeGreaterThanOrEqual(0);
    });
  });
  
  it('should handle zero income gracefully', () => {
    const zeroIncomeData = { ...mockUserData, income: { husband: 0, wife: 0 } };
    const result = calculateForecast(zeroIncomeData, mockAssumptions);
    expect(result).toHaveLength(15);
    expect(result[0].income).toBe(0);
  });
});
```

---

### 4. User Store (`src/store/userStore.js`)

**Purpose**: Centralized reactive state management.

```javascript
import { reactive, computed } from '@vue/reactivity'; // Lightweight reactivity

// State
export const state = reactive({
  userData: {
    profile: {},
    income: {},
    expenses: {},
    investments: {},
    loans: {},
    insurance: {}
  },
  householdId: null,
  memberId: null,
  memberMap: {}
});

// Computed properties
export const totalIncome = computed(() => {
  return (state.userData.income?.husband || 0) + 
         (state.userData.income?.wife || 0) + 
         (state.userData.income?.rental || 0);
});

export const totalExpenses = computed(() => {
  return Object.values(state.userData.expenses?.byMonth || {})
    .flatMap(month => Object.values(month.byMember || {}))
    .flatMap(member => member)
    .reduce((sum, exp) => sum + (exp.v || exp.amount || 0), 0);
});

export const netWorth = computed(() => {
  const totalInvestments = Object.values(state.userData.investments?.byMember || {})
    .flatMap(member => [
      ...member.mutualFunds,
      ...member.stocks,
      ...member.fd,
      ...member.ppf
    ])
    .reduce((sum, inv) => sum + (inv.value || 0), 0);
  
  const totalLoans = Object.values(state.userData.loans?.byMember || {})
    .flatMap(member => member)
    .reduce((sum, loan) => sum + (loan.outstanding || 0), 0);
  
  return totalInvestments - totalLoans + (state.userData.liquidSavings || 0);
});

export const dsr = computed(() => {
  const monthlyIncome = totalIncome.value / 12;
  const monthlyEMI = Object.values(state.userData.loans?.byMember || {})
    .flatMap(member => member)
    .reduce((sum, loan) => sum + (loan.emi || 0), 0);
  
  return monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 0;
});

// Actions
export function setUserData(data) {
  state.userData = data;
}

export function setHouseholdContext(householdId, memberId, memberMap) {
  state.householdId = householdId;
  state.memberId = memberId;
  state.memberMap = memberMap;
}
```

---

### 5. Compute Cache (`src/store/computeCache.js`)

**Purpose**: Memoization for expensive calculations.

```javascript
const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached result or compute and cache
 * @param {string} key - Cache key
 * @param {Function} computeFn - Function to compute result
 * @returns {any} - Cached or computed result
 */
export function getCached(key, computeFn) {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < TTL) {
    console.log('✅ Cache hit:', key);
    return cached.value;
  }
  
  console.log('🔄 Cache miss, computing:', key);
  const value = computeFn();
  cache.set(key, { value, timestamp: Date.now() });
  return value;
}

/**
 * Invalidate all cached results
 */
export function invalidate() {
  console.log('🗑️ Cache invalidated');
  cache.clear();
}

/**
 * Invalidate specific cache key
 * @param {string} key - Cache key to invalidate
 */
export function invalidateKey(key) {
  cache.delete(key);
}
```

---

### 6. Data Access Layer (`src/dal/loadData.js`)

**Purpose**: Load user data from Supabase (normalized or legacy).

```javascript
import { sb } from '../lib/supabaseClient.js';
import { state, setUserData, setHouseholdContext } from '../store/userStore.js';
import { reconstructUserData } from './reconstructData.js';

/**
 * Load user data (Phase 2: normalized tables or legacy user_data)
 * @param {string} email - User email
 */
export async function loadUserData(email) {
  console.log('📥 Loading user data for:', email);
  
  // Phase 2: Check if householdId is set (normalized path)
  if (state.householdId) {
    console.log('🔄 Using normalized tables');
    await loadHouseholdData();
    return;
  }
  
  // Legacy path: load from user_data table
  console.log('📦 Using legacy user_data table');
  const { data, error } = await sb
    .from('user_data')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Load error:', error);
    throw error;
  }
  
  if (data) {
    setUserData({
      profile: data.profile || {},
      income: data.income || {},
      expenses: data.expenses || {},
      investments: data.investments || {},
      loans: data.loans || {},
      insurance: data.insurance || {}
    });
  }
}

async function loadHouseholdData() {
  // Query all normalized tables in parallel
  const [
    { data: incomes },
    { data: expenses },
    { data: investments },
    { data: loans },
    { data: insurance },
    { data: assumptions }
  ] = await Promise.all([
    sb.from('incomes').select('*').eq('household_id', state.householdId),
    sb.from('expenses').select('*').eq('household_id', state.householdId),
    sb.from('investments').select('*').eq('household_id', state.householdId),
    sb.from('loans').select('*').eq('household_id', state.householdId),
    sb.from('insurance_policies').select('*').eq('household_id', state.householdId),
    sb.from('forecast_assumptions').select('*').eq('household_id', state.householdId).maybeSingle()
  ]);
  
  // Reconstruct legacy userData shape
  const userData = reconstructUserData(
    {},
    [],
    incomes || [],
    expenses || [],
    investments || [],
    loans || [],
    insurance || [],
    assumptions
  );
  
  setUserData(userData);
}
```

---

## Migration Strategy

### Phase 1: Extract Engines + Add Tests (Days 1-3)

**Goal**: Extract forecast, risk, and stress engines into separate files with unit tests.

**Steps**:
1. Create `src/engines/` directory
2. Extract `calculateForecast()` from `index.html` → `forecastEngine.js`
3. Write tests for forecast engine
4. Extract `calculateRiskScore()` → `riskEngine.js`
5. Write tests for risk engine
6. Extract `runStressTest()` → `stressEngine.js`
7. Write tests for stress engine
8. Run tests: `npm test`
9. Verify all tests pass

**Validation**:
- [ ] All engines extracted
- [ ] All tests pass
- [ ] Coverage ≥ 80%
- [ ] App still works (engines imported back into `index.html`)

---

### Phase 2: Extract UI Rendering (Days 4-6)

**Goal**: Extract UI rendering functions into separate files.

**Steps**:
1. Create `src/ui/` directory
2. Extract `renderOverview()` → `renderOverview.js`
3. Extract `renderForecast()` → `renderForecast.js`
4. Extract `renderRisk()` → `renderRisk.js`
5. Extract `renderStress()` → `renderStress.js`
6. Extract reusable components → `ui/components/`
7. Test UI rendering manually

**Validation**:
- [ ] All UI functions extracted
- [ ] App renders correctly
- [ ] No visual regressions

---

### Phase 3: Extract Data Access Layer (Days 7-9)

**Goal**: Extract data loading and saving logic.

**Steps**:
1. Create `src/dal/` directory
2. Extract `loadHouseholdContext()` → `householdContext.js`
3. Extract `loadUserData()` → `loadData.js`
4. Extract `saveUserData()` → `saveData.js`
5. Extract `saveNormalizedData()` → `saveData.js`
6. Test data loading and saving

**Validation**:
- [ ] All DAL functions extracted
- [ ] Data loads correctly
- [ ] Dual-write works
- [ ] Phase 2 functionality preserved

---

### Phase 4: Extract State Management (Days 10-11)

**Goal**: Centralize state management with reactivity.

**Steps**:
1. Create `src/store/` directory
2. Create `userStore.js` with reactive state
3. Create `computeCache.js` with memoization
4. Replace global `userData` with `state.userData`
5. Replace manual cache invalidation with reactive computed properties
6. Test state changes trigger UI updates

**Validation**:
- [ ] State management centralized
- [ ] Computed properties work
- [ ] Cache invalidation automatic
- [ ] UI updates on state changes

---

### Phase 5: Set Up CI/CD (Day 12)

**Goal**: Automate testing and deployment.

**Steps**:
1. Create `.github/workflows/ci.yml`
2. Configure lint, test, build jobs
3. Set up branch protection rules
4. Test CI pipeline with a PR
5. Verify merge is blocked if tests fail

**Validation**:
- [ ] CI pipeline runs on every PR
- [ ] All jobs pass
- [ ] Merge blocked if tests fail
- [ ] Coverage report uploaded

---

## Vite Configuration

**`vite.config.js`**:

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  server: {
    port: 5173,
    open: true
  },
  define: {
    'process.env': {}
  }
});
```

**`vitest.config.js`**:

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.js'
      ]
    }
  }
});
```

---

## CI/CD Configuration

**`.github/workflows/ci.yml`**:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

---

## Success Metrics

| Metric | Target | Current | After Refactor |
|--------|--------|---------|----------------|
| Lines per file | ≤ 200 | 15,000 | ≤ 200 |
| Test coverage | ≥ 80% | 0% | ≥ 80% |
| Build time | ≤ 30s | N/A | ≤ 30s |
| Dev server start | ≤ 2s | N/A | ≤ 2s |
| Bundle size (gzip) | ≤ 500KB | ~400KB | ≤ 500KB |
| CI pipeline time | ≤ 5min | N/A | ≤ 5min |

---

## Rollback Plan

If the refactor causes issues:

1. **Immediate**: Revert the PR that introduced the issue
2. **Short-term**: Fix the issue in a new PR with tests
3. **Long-term**: Improve test coverage to catch similar issues

The phased migration ensures we can roll back to any previous phase if needed.
