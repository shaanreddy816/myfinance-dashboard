# Requirements Document: Frontend Refactoring

## Introduction

Refactor the monolithic `index.html` (15,000+ lines) into a maintainable, modular structure with proper separation of concerns, build tooling, and automated testing. This refactor will NOT change any UI or features - it's purely structural improvements to enable safer development and easier maintenance.

## Glossary

- **Vite**: Modern build tool that provides fast dev server and optimized production builds
- **Vitest**: Unit testing framework built on Vite
- **ESM**: ECMAScript Modules (import/export syntax)
- **Tree-shaking**: Removing unused code from production bundles
- **Hot Module Replacement (HMR)**: Update modules in the browser without full page reload
- **CI/CD**: Continuous Integration/Continuous Deployment
- **GitHub Actions**: GitHub's built-in CI/CD platform
- **Deterministic Engine**: Pure function that always returns same output for same input
- **State Store**: Centralized state management with computed/cached values
- **Supabase Client**: Singleton instance for database operations

## Requirements

### Requirement 1: Folder Structure

**User Story:** As a developer, I want a clear folder structure that separates concerns, so that I can find and modify code quickly.

#### Acceptance Criteria

1. THE refactor SHALL create a `src/` directory with the following structure:
   ```
   src/
   ├── main.js                 # Entry point
   ├── lib/
   │   ├── supabaseClient.js   # Supabase singleton
   │   └── utils.js            # Shared utilities (fl, formatDate, etc.)
   ├── engines/
   │   ├── forecastEngine.js   # 15-year forecast calculations
   │   ├── riskEngine.js       # Risk score calculations
   │   └── stressEngine.js     # Stress test scenarios
   ├── ui/
   │   ├── renderOverview.js   # Overview page rendering
   │   ├── renderForecast.js   # Forecast card rendering
   │   ├── renderRisk.js       # Risk card rendering
   │   ├── renderStress.js     # Stress card rendering
   │   └── components/         # Reusable UI components
   ├── store/
   │   ├── userStore.js        # User data state + cache
   │   └── computeCache.js     # Memoization for expensive calculations
   ├── dal/
   │   ├── householdContext.js # Phase 2: Household context management
   │   ├── loadData.js         # Data loading (normalized + legacy)
   │   └── saveData.js         # Data saving (dual-write)
   └── styles/
       └── main.css            # Extracted CSS from <style> tags
   ```

2. WHEN a developer needs to modify forecast logic, THEN they SHALL only need to edit `engines/forecastEngine.js`.

3. WHEN a developer needs to modify UI rendering, THEN they SHALL only need to edit files in `ui/` directory.

4. WHEN a developer needs to modify data access, THEN they SHALL only need to edit files in `dal/` directory.

---

### Requirement 2: Build Tool Integration (Vite)

**User Story:** As a developer, I want a modern build tool that provides fast development and optimized production builds, so that I can iterate quickly and deploy efficiently.

#### Acceptance Criteria

1. THE refactor SHALL use Vite as the build tool with the following configuration:
   - Dev server on `localhost:5173`
   - Hot Module Replacement (HMR) enabled
   - Production build outputs to `dist/`
   - Source maps enabled for debugging

2. THE refactor SHALL provide these npm scripts:
   ```json
   {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview",
     "test": "vitest",
     "test:ui": "vitest --ui",
     "lint": "eslint src/",
     "type-check": "tsc --noEmit"
   }
   ```

3. WHEN a developer runs `npm run dev`, THEN the app SHALL start on `localhost:5173` with HMR.

4. WHEN a developer runs `npm run build`, THEN Vite SHALL produce an optimized bundle in `dist/` with:
   - Minified JavaScript
   - CSS extracted and minified
   - Assets hashed for cache busting
   - Tree-shaken code (unused exports removed)

5. THE production build SHALL maintain the same functionality as the current `index.html`.

6. THE Vercel deployment SHALL continue to work without changes (Vercel auto-detects Vite).

---

### Requirement 3: Unit Tests for Engines (Vitest)

**User Story:** As a developer, I want automated tests for financial calculation engines, so that I can refactor with confidence and catch regressions early.

#### Acceptance Criteria

1. THE refactor SHALL create test files for each engine:
   ```
   src/engines/
   ├── forecastEngine.js
   ├── forecastEngine.test.js
   ├── riskEngine.js
   ├── riskEngine.test.js
   ├── stressEngine.js
   └── stressEngine.test.js
   ```

2. THE forecast engine tests SHALL verify:
   - **Invariant 1**: Net worth never decreases when income > expenses
   - **Invariant 2**: Retirement corpus calculation matches manual formula
   - **Invariant 3**: Inflation compounds correctly over 15 years
   - **Invariant 4**: Investment growth matches expected CAGR
   - **Edge case**: Zero income, zero expenses → flat net worth
   - **Edge case**: Negative cash flow → declining net worth

3. THE risk engine tests SHALL verify:
   - **Range check**: Overall score is between 0-100
   - **Range check**: Category scores are between 0-100
   - **Risk level mapping**: Score 0-25 = low, 26-50 = medium, 51-75 = high, 76-100 = critical
   - **Weighted average**: Overall score = weighted sum of category scores
   - **Edge case**: No data → default risk level
   - **Edge case**: Perfect coverage → low risk score

4. THE stress engine tests SHALL verify:
   - **Scenario 1**: Job loss → survival months calculation
   - **Scenario 2**: Medical emergency → impact on liquid savings
   - **Scenario 3**: Market crash → portfolio value decline
   - **Delta check**: Stress result shows difference from baseline
   - **Edge case**: Zero liquid savings → survival months = 0
   - **Edge case**: High emergency fund → survival months > 12

5. WHEN a developer runs `npm test`, THEN all tests SHALL pass.

6. WHEN a test fails, THEN the output SHALL clearly show:
   - Which test failed
   - Expected vs actual values
   - Stack trace for debugging

---

### Requirement 4: GitHub Actions CI

**User Story:** As a team lead, I want automated CI checks on every PR, so that broken code never reaches production.

#### Acceptance Criteria

1. THE refactor SHALL create `.github/workflows/ci.yml` with the following jobs:
   - **Lint**: Run ESLint on all source files
   - **Test**: Run Vitest with coverage report
   - **Build**: Verify production build succeeds

2. THE CI workflow SHALL run on:
   - Every push to `main` branch
   - Every pull request to `main` branch

3. WHEN a PR is opened, THEN GitHub Actions SHALL:
   - Run lint, test, and build jobs in parallel
   - Report status on the PR (✅ or ❌)
   - Block merge if any job fails

4. THE CI workflow SHALL use caching for:
   - `node_modules/` (cache key: `package-lock.json` hash)
   - Vite build cache

5. THE CI workflow SHALL upload test coverage report as an artifact.

6. WHEN all checks pass, THEN the PR SHALL show "All checks have passed" and allow merge.

7. WHEN any check fails, THEN the PR SHALL show "Some checks were not successful" and block merge.

---

### Requirement 5: State Management (userStore)

**User Story:** As a developer, I want centralized state management with computed values, so that I don't have to manually invalidate caches or recalculate derived data.

#### Acceptance Criteria

1. THE refactor SHALL create `src/store/userStore.js` with:
   - `userData` state object (reactive)
   - `householdId`, `memberId`, `memberMap` (Phase 2 context)
   - Computed properties: `totalIncome`, `totalExpenses`, `netWorth`, `dsr`
   - Cache invalidation on state changes

2. THE refactor SHALL create `src/store/computeCache.js` with:
   - Memoization for expensive calculations (forecast, risk, stress)
   - Cache key based on input hash
   - TTL (time-to-live) for cache entries
   - Manual invalidation API

3. WHEN `userData.income` changes, THEN `totalIncome` SHALL automatically recompute.

4. WHEN `userData.expenses` changes, THEN `totalExpenses` SHALL automatically recompute.

5. WHEN forecast is requested with same inputs, THEN cached result SHALL be returned (no recalculation).

6. WHEN `computeCache.invalidate()` is called, THEN all cached results SHALL be cleared.

---

### Requirement 6: Supabase Client Singleton

**User Story:** As a developer, I want a single Supabase client instance shared across the app, so that I don't create multiple connections or duplicate configuration.

#### Acceptance Criteria

1. THE refactor SHALL create `src/lib/supabaseClient.js` that exports:
   - `sb`: Supabase client instance
   - `currentUserEmail`: Reactive state
   - `isAuthenticated`: Computed boolean

2. THE Supabase client SHALL be initialized once with:
   - `SUPABASE_URL` from environment variable
   - `SUPABASE_ANON_KEY` from environment variable

3. WHEN any module needs Supabase, THEN it SHALL import from `src/lib/supabaseClient.js`.

4. THE refactor SHALL NOT create multiple Supabase client instances.

---

### Requirement 7: Backward Compatibility

**User Story:** As a product owner, I want the refactored app to work exactly like the current app, so that users experience no disruption.

#### Acceptance Criteria

1. THE refactored app SHALL have identical UI to the current app:
   - Same layout
   - Same colors
   - Same fonts
   - Same interactions

2. THE refactored app SHALL have identical functionality:
   - All features work the same
   - All calculations produce same results
   - All API calls work the same

3. THE refactored app SHALL maintain Phase 2 dual-write functionality:
   - Writes to both `user_data` and normalized tables
   - Reads from normalized tables when `householdId` is set
   - Falls back to legacy path when needed

4. WHEN a user logs in, THEN they SHALL see the same dashboard as before.

5. WHEN a user adds income, THEN it SHALL save to both systems (dual-write).

6. WHEN a user runs forecast, THEN the results SHALL match the current implementation.

---

### Requirement 8: Vercel Deployment

**User Story:** As a DevOps engineer, I want the refactored app to deploy to Vercel without configuration changes, so that the deployment pipeline remains simple.

#### Acceptance Criteria

1. THE refactor SHALL maintain the existing `vercel.json` configuration.

2. WHEN code is pushed to `main` branch, THEN Vercel SHALL:
   - Detect Vite project automatically
   - Run `npm run build`
   - Deploy `dist/` directory
   - Serve the app at `https://famledgerai.com`

3. THE refactor SHALL maintain the existing API routes:
   - `/api/[...catchall].js` continues to work
   - Environment variables are accessible

4. THE refactor SHALL maintain the existing cron jobs:
   - `/api/aa/refresh` runs daily at 00:30

5. WHEN deployment succeeds, THEN the app SHALL be accessible at production URL.

6. WHEN deployment fails, THEN Vercel SHALL show clear error messages.

---

### Requirement 9: Developer Experience

**User Story:** As a developer, I want clear documentation and tooling, so that I can onboard quickly and contribute effectively.

#### Acceptance Criteria

1. THE refactor SHALL create `REFACTOR_GUIDE.md` with:
   - Folder structure explanation
   - How to add a new feature
   - How to add a new test
   - How to run locally
   - How to deploy

2. THE refactor SHALL create `TESTING_GUIDE.md` with:
   - How to write unit tests
   - How to run tests
   - How to check coverage
   - How to debug failing tests

3. THE refactor SHALL add JSDoc comments to all exported functions:
   - Function purpose
   - Parameter types and descriptions
   - Return type and description
   - Example usage

4. THE refactor SHALL configure ESLint with:
   - Airbnb style guide
   - Prettier integration
   - Auto-fix on save (VS Code)

5. WHEN a developer opens the project in VS Code, THEN ESLint SHALL highlight issues in real-time.

6. WHEN a developer saves a file, THEN Prettier SHALL auto-format the code.

---

### Requirement 10: Migration Strategy

**User Story:** As a project manager, I want a phased migration plan, so that we can refactor incrementally without breaking production.

#### Acceptance Criteria

1. THE migration SHALL follow this phased approach:
   - **Phase 1**: Extract engines (forecast, risk, stress) + add tests
   - **Phase 2**: Extract UI rendering functions
   - **Phase 3**: Extract data access layer (DAL)
   - **Phase 4**: Extract state management
   - **Phase 5**: Set up CI/CD

2. AFTER each phase, THE app SHALL be fully functional and deployable.

3. THE migration SHALL maintain a working `index.html` until Phase 5 is complete.

4. WHEN Phase 5 is complete, THEN `index.html` SHALL be replaced by the Vite build output.

5. THE migration SHALL NOT require database changes.

6. THE migration SHALL NOT require API changes.

---

## Non-Functional Requirements

### Performance

1. THE refactored app SHALL load in ≤ 3 seconds on 3G connection.
2. THE production bundle SHALL be ≤ 500KB (gzipped).
3. THE dev server SHALL start in ≤ 2 seconds.
4. THE production build SHALL complete in ≤ 30 seconds.

### Maintainability

1. THE refactored codebase SHALL have ≥ 80% test coverage for engines.
2. THE refactored codebase SHALL have ≤ 200 lines per file (average).
3. THE refactored codebase SHALL have ≤ 3 levels of nesting (average).
4. THE refactored codebase SHALL pass ESLint with zero warnings.

### Reliability

1. THE CI pipeline SHALL have ≥ 99% uptime.
2. THE CI pipeline SHALL complete in ≤ 5 minutes.
3. THE CI pipeline SHALL retry failed jobs up to 2 times.

---

## Success Criteria

The refactor is successful when:

1. ✅ All 15,000+ lines of `index.html` are split into modular files
2. ✅ All engines have unit tests with ≥ 80% coverage
3. ✅ CI/CD pipeline blocks broken code from merging
4. ✅ Production app works identically to current app
5. ✅ Vercel deployment works without changes
6. ✅ Dev server provides fast HMR for rapid iteration
7. ✅ New developers can onboard in < 1 hour with documentation

---

## Out of Scope

The following are explicitly OUT of scope for this refactor:

1. ❌ UI redesign or visual changes
2. ❌ New features or functionality
3. ❌ Database schema changes
4. ❌ API endpoint changes
5. ❌ Performance optimizations (beyond build tool benefits)
6. ❌ Accessibility improvements
7. ❌ Mobile app development
8. ❌ Backend refactoring

---

## Dependencies

This refactor depends on:

1. Node.js ≥ 18.0.0
2. npm ≥ 9.0.0
3. Vite ≥ 5.0.0
4. Vitest ≥ 1.0.0
5. ESLint ≥ 8.0.0
6. Prettier ≥ 3.0.0
7. GitHub Actions (free tier)
8. Vercel (existing account)

---

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking changes during refactor | High | Medium | Phased migration + comprehensive testing |
| CI/CD pipeline failures | Medium | Low | Retry logic + clear error messages |
| Performance regression | Medium | Low | Bundle size monitoring + performance tests |
| Developer resistance to new structure | Low | Medium | Clear documentation + training |
| Vercel deployment issues | High | Low | Test deployment on staging first |

---

## Timeline Estimate

- **Phase 1** (Engines + Tests): 2-3 days
- **Phase 2** (UI Extraction): 2-3 days
- **Phase 3** (DAL Extraction): 2-3 days
- **Phase 4** (State Management): 1-2 days
- **Phase 5** (CI/CD Setup): 1 day
- **Total**: 8-12 days

---

## Validation Checklist

Before marking this refactor complete:

- [ ] All files in `src/` follow naming conventions
- [ ] All engines have unit tests with ≥ 80% coverage
- [ ] CI/CD pipeline runs on every PR
- [ ] Production build deploys successfully to Vercel
- [ ] All existing features work identically
- [ ] Phase 2 dual-write functionality preserved
- [ ] Documentation is complete and accurate
- [ ] ESLint passes with zero warnings
- [ ] Bundle size is ≤ 500KB (gzipped)
- [ ] Dev server starts in ≤ 2 seconds
