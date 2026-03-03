# Frontend Refactor Tasks

## Phase 1: Extract Engines + Add Tests (Days 1-3)

### Task 1: Project Setup

**1.1** Initialize Vite project structure:
```bash
cd famledgerai
npm install -D vite vitest @vitest/ui @vue/reactivity eslint prettier
mkdir -p src/{engines,ui,store,dal,lib,styles}
```

**1.2** Create `vite.config.js` with build configuration

**1.3** Create `vitest.config.js` with test configuration

**1.4** Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### Task 2: Extract Forecast Engine

**2.1** Create `src/engines/forecastEngine.js`

**2.2** Extract these functions from `index.html`:
- `calculateForecast()`
- `calculateInitialNetWorth()`
- `calculateProjectedIncome()`
- `calculateProjectedExpenses()`
- `calculateProjectedInvestments()`

**2.3** Add JSDoc comments to all exported functions

**2.4** Create `src/engines/forecastEngine.test.js`

**2.5** Write tests for:
- 15-year projection length
- Income growth rate
- Expense inflation rate
- Net worth never negative (when income > expenses)
- Zero income edge case
- Zero expenses edge case

**2.6** Run tests: `npm test forecastEngine`

**2.7** Verify coverage ≥ 80%: `npm run test:coverage`

---

### Task 3: Extract Risk Engine ✅ DONE

**3.1** Create `src/engines/riskEngine.js` ✅

**3.2** Extract these functions from `index.html`: ✅
- `computeHouseholdNIM()` - Net Interest Margin calculation
- `computeDSR()` - Debt Service Ratio calculation
- `computeLCR()` - Liquidity Coverage Ratio calculation
- `computeProtectionAdequacy()` - Insurance adequacy calculation
- `computeStabilityScore()` - Composite stability score

**3.3** Add JSDoc comments ✅

**3.4** Create `src/engines/riskEngine.test.js` ✅

**3.5** Write tests for: ✅
- NIM calculation with various investment/loan scenarios (5 tests)
- DSR calculation with edge cases (7 tests)
- LCR calculation with emergency fund scenarios (8 tests)
- Protection adequacy with insurance benchmarks (8 tests)
- Stability score composite calculation (9 tests)
- RAG classification for all metrics
- Edge cases and boundary conditions

**3.6** Run tests and verify coverage ✅
- 37 tests passing in 10ms
- 100% coverage for risk engine functions

---

### Task 4: Extract Stress Engine ✅ DONE

**4.1** Create `src/engines/stressEngine.js` ✅

**4.2** Extract these functions from `index.html`: ✅
- `STRESS_SCENARIOS` - 9 predefined stress scenarios catalog
- `computeShockedEMI()` - EMI recalculation with rate bumps
- `computeShockedMetrics()` - Apply scenario shocks and recompute ratios
- `evaluateShockImpact()` - Deltas, survival analysis, severity classification
- `runStressScenario()` - Full stress test orchestration

**4.3** Add JSDoc comments ✅

**4.4** Create `src/engines/stressEngine.test.js` ✅

**4.5** Write tests for: ✅
- Scenario catalog immutability (5 tests)
- Shocked EMI calculation with rate bumps (6 tests)
- Shocked metrics computation for all shock types (10 tests)
- Impact evaluation with survival analysis (11 tests)
- End-to-end stress scenario execution (6 tests)
- Edge cases and boundary conditions

**4.6** Run tests and verify coverage ✅
- 38 tests passing in 16ms
- 100% coverage for stress engine functions

---

### Task 5: Create Supabase Client Module ✅ DONE

**5.1** Create `src/lib/supabaseClient.js` ✅

**5.2** Extract Supabase initialization: ✅
- `createClient()` with configuration priority (localStorage → env → defaults)
- `getSupabaseUrl()` and `getSupabaseAnonKey()` helpers
- Singleton client instance export

**5.3** Add auth state management: ✅
- `currentUserEmail` tracking
- `setCurrentUserEmail()` setter
- `isAuthenticated()` helper
- `getCurrentSession()` async helper
- `initAuthListener()` for auth state changes
- `signOut()` helper

**5.4** Add JSDoc comments ✅

**5.5** Create `src/lib/supabaseClient.test.js` ✅

**5.6** Write tests for: ✅
- `setCurrentUserEmail()` functionality (3 tests)
- `isAuthenticated()` state checking (3 tests)
- Environment handling (localStorage, import.meta.env)

**5.7** Run tests and verify ✅
- 6 tests passing in 6ms
- Handles Node environment (no localStorage)

---

### Task 6: Set Up Vite Dev Server ✅ DONE

**6.1** Create `src/main.js` entry point ✅
- Import extracted engines (forecast, risk, stress)
- Import Supabase client module
- Expose modules globally for backward compatibility

**6.2** Update `index.html` to use Vite entry point ✅
- Add `<script type="module" src="/src/main.js"></script>`
- Comment out old CDN-based Supabase import
- Use `window.sb` from imported module

**6.3** Test Vite dev server ✅
- Run `npm run dev`
- Server starts in 2.5 seconds on http://localhost:5173/
- Modules load successfully

**6.4** Commit changes ✅
- `git commit -m "refactor(phase1): Set up Vite dev server with module imports"`

---

## Phase 2: Extract UI Rendering (Days 4-6)

### Task 7: Extract Overview Rendering

**6.1** Create `src/ui/renderOverview.js`

**6.2** Extract `renderOverview()` function from `index.html`

**6.3** Extract helper functions:
- `renderKPICard()`
- `renderIncomeCard()`
- `renderExpensesCard()`
- `renderInvestmentsCard()`

**6.4** Import and use in `index.html`

**6.5** Test manually - verify overview page renders correctly

---

### Task 7: Extract Forecast Rendering

**7.1** Create `src/ui/renderForecast.js`

**7.2** Extract `renderForecast()` function

**7.3** Extract chart rendering logic

**7.4** Import and use in `index.html`

**7.5** Test manually - verify forecast card renders correctly

---

### Task 8: Extract Risk Rendering

**8.1** Create `src/ui/renderRisk.js`

**8.2** Extract `renderRisk()` function

**8.3** Extract risk gauge rendering

**8.4** Import and use in `index.html`

**8.5** Test manually - verify risk card renders correctly

---

### Task 9: Extract Stress Rendering

**9.1** Create `src/ui/renderStress.js`

**9.2** Extract `renderStress()` function

**9.3** Extract scenario cards rendering

**9.4** Import and use in `index.html`

**9.5** Test manually - verify stress card renders correctly

---

### Task 10: Extract Reusable Components

**10.1** Create `src/ui/components/` directory

**10.2** Extract reusable components:
- `Card.js` - Generic card wrapper
- `Button.js` - Styled button
- `Input.js` - Styled input
- `Modal.js` - Modal dialog
- `Toast.js` - Toast notifications

**10.3** Update UI files to use components

**10.4** Test manually - verify all UI works

**10.5** Commit: `git commit -m "refactor: Extract UI rendering functions"`

---

## Phase 3: Extract Data Access Layer (Days 7-9)

### Task 11: Extract Supabase Client

**11.1** Create `src/lib/supabaseClient.js`

**11.2** Extract Supabase client initialization

**11.3** Export `sb`, `currentUserEmail`, `isAuthenticated`

**11.4** Create `initAuth()` function

**11.5** Update all files to import from `supabaseClient.js`

---

### Task 12: Extract Household Context

**12.1** Create `src/dal/householdContext.js`

**12.2** Extract these functions from `index.html`:
- `loadHouseholdContext()`
- `bootstrapHousehold()`
- `loadMemberMap()`
- `getLegacyMemberId()`
- `getMemberUuid()`

**12.3** Add JSDoc comments

**12.4** Import and use in `index.html`

**12.5** Test manually - verify household context loads

---

### Task 13: Extract Load Data

**13.1** Create `src/dal/loadData.js`

**13.2** Extract these functions:
- `loadUserData()`
- `loadHouseholdData()`
- `reconstructUserData()`

**13.3** Add JSDoc comments

**13.4** Import and use in `index.html`

**13.5** Test manually - verify data loads correctly

---

### Task 14: Extract Save Data

**14.1** Create `src/dal/saveData.js`

**14.2** Extract these functions:
- `saveUserData()`
- `saveNormalizedData()`
- `saveTable()`
- `deleteRow()`

**14.3** Add JSDoc comments

**14.4** Import and use in `index.html`

**14.5** Test manually - verify dual-write works

**14.6** Verify in Supabase - data appears in both systems

**14.7** Commit: `git commit -m "refactor: Extract data access layer"`

---

## Phase 4: Extract State Management (Days 10-11)

### Task 15: Create User Store

**15.1** Install `@vue/reactivity`: `npm install @vue/reactivity`

**15.2** Create `src/store/userStore.js`

**15.3** Define reactive state:
- `userData`
- `householdId`
- `memberId`
- `memberMap`

**15.4** Define computed properties:
- `totalIncome`
- `totalExpenses`
- `netWorth`
- `dsr`

**15.5** Define actions:
- `setUserData()`
- `setHouseholdContext()`

**15.6** Replace global `userData` with `state.userData` in all files

**15.7** Test manually - verify state updates trigger UI updates

---

### Task 16: Create Compute Cache

**16.1** Create `src/store/computeCache.js`

**16.2** Implement `getCached(key, computeFn)`

**16.3** Implement `invalidate()`

**16.4** Implement `invalidateKey(key)`

**16.5** Update engine calls to use cache:
```javascript
const forecast = getCached('forecast', () => calculateForecast(userData, assumptions));
```

**16.6** Test manually - verify cache hits/misses in console

**16.7** Commit: `git commit -m "refactor: Add state management and caching"`

---

## Phase 5: Set Up CI/CD (Day 12)

### Task 17: Configure ESLint

**17.1** Install ESLint: `npm install -D eslint @eslint/js`

**17.2** Create `.eslintrc.js`:
```javascript
module.exports = {
  extends: ['eslint:recommended'],
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  }
};
```

**17.3** Add lint script: `"lint": "eslint src/"`

**17.4** Run lint: `npm run lint`

**17.5** Fix all linting errors

---

### Task 18: Configure Prettier

**18.1** Install Prettier: `npm install -D prettier eslint-config-prettier`

**18.2** Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**18.3** Add format script: `"format": "prettier --write src/"`

**18.4** Run format: `npm run format`

---

### Task 19: Set Up GitHub Actions

**19.1** Create `.github/workflows/ci.yml`

**19.2** Configure jobs:
- Lint job
- Test job (with coverage upload)
- Build job (with artifact upload)

**19.3** Set up caching for `node_modules`

**19.4** Test CI by creating a PR

**19.5** Verify all jobs pass

---

### Task 20: Configure Branch Protection

**20.1** Go to GitHub repo settings → Branches

**20.2** Add branch protection rule for `main`:
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators

**20.3** Select required status checks:
- lint
- test
- build

**20.4** Test by creating a PR with failing tests

**20.5** Verify merge is blocked

**20.6** Commit: `git commit -m "ci: Add GitHub Actions workflow"`

---

## Phase 6: Final Migration (Day 13)

### Task 21: Create Entry Point

**21.1** Create `src/main.js` as the new entry point

**21.2** Import all modules:
```javascript
import { sb, initAuth } from './lib/supabaseClient.js';
import { loadHouseholdContext } from './dal/householdContext.js';
import { loadUserData } from './dal/loadData.js';
import { renderOverview } from './ui/renderOverview.js';
import './styles/main.css';
```

**21.3** Set up auth state change handler

**21.4** Initialize app

---

### Task 22: Create HTML Template

**22.1** Create `src/index.html` with minimal HTML structure

**22.2** Move all HTML from old `index.html` to `src/index.html`

**22.3** Remove `<script>` tags (now in `main.js`)

**22.4** Add Vite script tag: `<script type="module" src="/main.js"></script>`

---

### Task 23: Extract CSS

**23.1** Create `src/styles/main.css`

**23.2** Move all CSS from `<style>` tags to `main.css`

**23.3** Organize CSS into sections:
- Variables
- Reset
- Layout
- Components
- Utilities

**23.4** Import in `main.js`: `import './styles/main.css';`

---

### Task 24: Test Vite Build

**24.1** Run dev server: `npm run dev`

**24.2** Test all features manually:
- Login/logout
- Add income
- Add expenses
- Add investments
- Run forecast
- Run risk analysis
- Run stress test

**24.3** Run production build: `npm run build`

**24.4** Preview production build: `npm run preview`

**24.5** Test production build manually

---

### Task 25: Update Vercel Configuration

**25.1** Verify `vercel.json` is compatible with Vite

**25.2** Update if needed:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**25.3** Test deployment to Vercel preview

**25.4** Verify preview works correctly

**25.5** Deploy to production

**25.6** Verify production works correctly

---

### Task 26: Documentation

**26.1** Create `REFACTOR_GUIDE.md`:
- Folder structure explanation
- How to add a new feature
- How to add a new test
- How to run locally
- How to deploy

**26.2** Create `TESTING_GUIDE.md`:
- How to write unit tests
- How to run tests
- How to check coverage
- How to debug failing tests

**26.3** Update `README.md` with new setup instructions

**26.4** Add JSDoc comments to all exported functions

**26.5** Commit: `git commit -m "docs: Add refactor and testing guides"`

---

### Task 27: Cleanup

**27.1** Archive old `index.html`:
```bash
mv index.html index.html.backup
```

**27.2** Remove unused files

**27.3** Run final tests: `npm test`

**27.4** Run final lint: `npm run lint`

**27.5** Run final build: `npm run build`

**27.6** Verify all checks pass

**27.7** Create final PR: "refactor: Complete frontend modularization"

**27.8** Merge to main after CI passes

---

## Validation Checklist

Before marking the refactor complete:

- [ ] All files in `src/` follow naming conventions
- [ ] All engines have unit tests with ≥ 80% coverage
- [ ] All tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] Production build succeeds: `npm run build`
- [ ] Dev server starts in ≤ 2 seconds
- [ ] Production build completes in ≤ 30 seconds
- [ ] Bundle size is ≤ 500KB (gzipped)
- [ ] CI/CD pipeline runs on every PR
- [ ] Branch protection blocks merge if tests fail
- [ ] Vercel deployment works
- [ ] All existing features work identically
- [ ] Phase 2 dual-write functionality preserved
- [ ] Documentation is complete
- [ ] Old `index.html` is archived

---

## Rollback Plan

If issues arise during migration:

1. **Immediate**: Revert to `index.html.backup`
2. **Short-term**: Fix issue in a new PR with tests
3. **Long-term**: Improve test coverage

Each phase is independently deployable, so we can roll back to any previous phase if needed.

---

## Timeline

| Phase | Tasks | Days | Deliverable |
|-------|-------|------|-------------|
| 1 | 1-5 | 3 | Engines extracted with tests |
| 2 | 6-10 | 3 | UI rendering extracted |
| 3 | 11-14 | 3 | DAL extracted |
| 4 | 15-16 | 2 | State management added |
| 5 | 17-20 | 1 | CI/CD configured |
| 6 | 21-27 | 1 | Final migration complete |
| **Total** | **27 tasks** | **13 days** | **Fully refactored app** |

---

## Success Metrics

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Lines per file | 15,000 | ≤ 200 | ⏳ |
| Test coverage | 0% | ≥ 80% | ⏳ |
| Build time | N/A | ≤ 30s | ⏳ |
| Dev server start | N/A | ≤ 2s | ⏳ |
| Bundle size (gzip) | ~400KB | ≤ 500KB | ⏳ |
| CI pipeline time | N/A | ≤ 5min | ⏳ |
| Files in `src/` | 1 | ~30 | ⏳ |
| Merge conflicts | High | Low | ⏳ |
