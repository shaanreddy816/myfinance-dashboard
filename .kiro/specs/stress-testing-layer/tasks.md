# Implementation Plan: Household Stress Testing Layer (Phase 1.5)

## Overview

Add 6 pure computation functions, 1 frozen constant, and 1 UI render function to `famledgerai/index.html` as the Stress Engine. All functions reuse existing Risk_Engine and Forecast_Engine accessors, apply shock formulas to copied values, and never modify `userData`. The UI integrates into `renderOverview()` below the Risk Dashboard. No external libraries, no API calls, no DB changes.

## Tasks

- [x] 1. Implement STRESS_SCENARIOS constant and captureBaseMetrics
  - [x] 1.1 Add `STRESS_SCENARIOS` frozen constant and `captureBaseMetrics()` function
    - Insert a `// ========== STRESS ENGINE ==========` section after the Risk Engine section (after `renderRiskDashboard` and related functions)
    - Define `STRESS_SCENARIOS` as `Object.freeze({...})` with all 9 scenarios across 4 categories: Income Shock (`income-10`, `income-20`), Expense Shock (`expense-10`, `expense-20`, `expense-med`), Rate Shock (`rate-100`, `rate-200`), Combined Shock (`combined-mild`, `combined-severe`)
    - Each entry: `{ id, category, label, description, incomeFactor?, expenseFactor?, rateBump?, liquidHit? }` — only relevant parameters defined per scenario
    - `expense-med` uses `liquidHit: 'sixMonthExpenses'` (string sentinel for 6× base monthly expenses)
    - Implement `captureBaseMetrics()` calling existing accessors: `computeMonthlyIncome()`, `computeMonthlyExpenses()`, `computeTotalEmi()`, `userData.liquidSavings`, `computeDSR()`, `computeLCR()`, `computeHouseholdNIM()`, `computeStabilityScore()`, `computeProtectionAdequacy()`, `computeTotalInvestments()`, `computeTotalLoanOutstanding()`
    - Return plain snapshot object with `(value || 0)` fallbacks for all numeric fields
    - Include `protScore` from `computeStabilityScore().protScore` for stability recomputation
    - Include inline formula comments for auditability
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 1.2 Write property test for scenario catalog structural completeness
    - **Property 1: Scenario catalog structural completeness**
    - Iterate all entries in STRESS_SCENARIOS; assert each has `id`, `category`, `label`, `description`; assert `category` is one of the 4 defined categories; assert `id` matches lookup key; assert at least one parameter override is defined
    - **Validates: Requirements 1.6**

  - [ ]* 1.3 Write property test for scenario catalog immutability
    - **Property 2: Scenario catalog immutability**
    - Attempt random mutations (set, delete, add) on STRESS_SCENARIOS; assert `Object.isFrozen(STRESS_SCENARIOS)` is true and catalog remains unchanged
    - **Validates: Requirements 1.7**

- [x] 2. Implement computeShockedEMI
  - [x] 2.1 Add `computeShockedEMI(rateBump)` function
    - When `rateBump` is 0 or undefined, return `computeTotalEmi() || 0`
    - Retrieve loans via `getLoansForMember(currentProfile)`
    - For each loan: skip if `outstanding === 0`; compute `r = (loan.rate + rateBump) / 12 / 100`, `n = loan.remainingTenure × 12`
    - If `n === 0` or `r === 0`, use original `loan.emi`
    - Otherwise apply standard EMI formula: `P × r × (1+r)^n / ((1+r)^n − 1)`
    - Sum all individual EMIs into total shocked EMI
    - Does NOT modify any loan data in `userData`
    - Include inline formula comments
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.2 Write property test for shocked EMI formula correctness
    - **Property 4: Shocked EMI formula correctness**
    - Generate random loan arrays (outstanding ∈ [0, 1e8], rate ∈ [1, 20], tenure ∈ [1, 30]) × random rateBump ∈ [0.5, 5]; assert total equals sum of individual EMI formula applications; assert zero-outstanding loans contribute zero
    - **Validates: Requirements 3.1, 3.2**

- [x] 3. Implement computeShockedMetrics
  - [x] 3.1 Add `computeShockedMetrics(scenario, base)` function
    - Compute shocked income: `base.monthlyIncome × (scenario.incomeFactor || 1)`
    - Compute shocked expenses: `base.monthlyExpenses × (scenario.expenseFactor || 1)`
    - Compute shocked EMI: call `computeShockedEMI(scenario.rateBump)` when rateBump defined, else `base.totalEmi`
    - Compute shocked liquid savings: deduct `base.monthlyExpenses × 6` when `liquidHit === 'sixMonthExpenses'`, deduct numeric liquidHit when number, clamp to 0 minimum via `Math.max(0, ...)`
    - Recompute DSR: `(shockedEmi / shockedIncome) × 100` with zero-income guard (100 if EMI > 0, 0 if both zero)
    - Recompute LCR: `shockedLiquidSavings / (shockedExpenses × 6)` with zero-expense guard (1.0 if savings > 0, 0 if both zero)
    - Recompute NIM: `weightedYield − (weightedCost + rateBump)` when rateBump defined, else `base.nim.nim`
    - Recompute Stability Score: `nimScore = clamp(0,100, 50 + nim×25)`, `dsrScore = clamp(0,100, 100 − dsr×2)`, `lcrScore = clamp(0,100, lcr×100)`, `protScore` unchanged from base, composite = `round(dsrScore×0.30 + lcrScore×0.25 + nimScore×0.20 + protScore×0.25)`
    - Return object with all shocked values plus sub-scores
    - Does NOT modify `userData` or call any function that modifies `userData`
    - Include inline formula comments
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_

  - [ ]* 3.2 Write property test for factor application correctness
    - **Property 3: Factor application correctness**
    - Generate random base metrics (income ∈ [0, 1e7], expenses ∈ [0, 1e6], savings ∈ [0, 1e8]) × random factors (incomeFactor ∈ [0.5, 1], expenseFactor ∈ [1, 2], liquidHit ∈ [0, 1e7]); assert shocked values match formulas exactly
    - **Validates: Requirements 4.2, 4.3, 4.5**

  - [ ]* 3.3 Write property test for shocked ratio metrics
    - **Property 5: Shocked ratio metrics follow Risk_Engine formulas**
    - Generate random shocked values (income ∈ [0, 1e7], expenses ∈ [0, 1e6], emi ∈ [0, 1e6], savings ∈ [0, 1e8], NIM components ∈ [-5, 15]); assert DSR, LCR, NIM formulas and zero-denominator guards
    - **Validates: Requirements 4.6, 4.7, 4.9**

  - [ ]* 3.4 Write property test for shocked stability score recomputation
    - **Property 6: Shocked stability score recomputation**
    - Generate random sub-metrics (DSR ∈ [0, 100], LCR ∈ [0, 3], NIM ∈ [-10, 20], protScore ∈ [0, 100]); assert composite formula and result ∈ [0, 100]
    - **Validates: Requirements 4.10**

- [x] 4. Implement evaluateShockImpact
  - [x] 4.1 Add `evaluateShockImpact(base, shocked, scenario)` function
    - Compute `stabilityDelta = base.stabilityScore − shocked.stabilityScore`
    - Compute `dsrDelta = shocked.dsr − base.dsr`
    - Compute `lcrDelta = base.lcr − shocked.lcr`
    - Compute `nimDelta = (base.nim.nim || 0) − shocked.nim`
    - Compute `monthlyDeficit = shocked.monthlyExpenses + shocked.totalEmi − shocked.monthlyIncome`; if deficit ≤ 0 then `monthsLiquidity = 999`, else `monthsLiquidity = shocked.liquidSavings / monthlyDeficit`, capped at 999
    - Compute `dsrBreach = shocked.dsr > 50`
    - Compute `stabilityBreach = shocked.stabilityScore < 50`
    - Compute `netWorthYear1 = (shocked.monthlyIncome − shocked.monthlyExpenses − shocked.totalEmi) × 12 + base.totalInvestments − base.totalLoanOutstanding`; `netWorthNegative = netWorthYear1 < 0`
    - Classify severity: `critical` if `stabilityScore < 50 OR dsr > 50`, `warning` if `monthsLiquidity < 6`, else `manageable`
    - Return complete impact result object
    - Include inline formula comments
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [ ]* 4.2 Write property test for delta computation correctness
    - **Property 7: Delta computation correctness**
    - Generate random base/shocked metric pairs with numeric values; assert all four deltas match their formulas exactly
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.11**

  - [ ]* 4.3 Write property test for survival analysis and severity classification
    - **Property 8: Survival analysis and severity classification**
    - Generate random shocked metrics covering all severity regions; assert months of liquidity formula, breach flags, and severity classification rules
    - **Validates: Requirements 5.6, 5.7, 5.8, 5.10**

- [x] 5. Implement runStressScenario orchestrator
  - [x] 5.1 Add `runStressScenario(scenarioId)` function
    - Look up scenario from `STRESS_SCENARIOS[scenarioId]`; if not found, return `{ error: true, message: 'Unknown scenario: ...' }`
    - Call `captureBaseMetrics()` → `computeShockedMetrics(scenario, base)` → `evaluateShockImpact(base, shocked, scenario)`
    - Return `{ scenarioId, scenarioLabel, category, description, base, shocked, impact }`
    - Does NOT modify `userData`, make API calls, or access the database
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.2 Write property test for invalid scenario error handling
    - **Property 13: Invalid scenario error handling**
    - Generate random strings not in STRESS_SCENARIOS keys; assert return has `error: true` and non-empty `message`, no exception thrown
    - **Validates: Requirements 6.4**

- [x] 6. Checkpoint — Verify all Stress Engine computation functions
  - Ensure all 6 functions (`captureBaseMetrics`, `computeShockedEMI`, `computeShockedMetrics`, `evaluateShockImpact`, `runStressScenario`) and `STRESS_SCENARIOS` constant are implemented
  - Ensure `runStressScenario` returns correct shapes for all 9 scenario IDs
  - Ensure invalid scenario ID returns error object without throwing
  - Ensure no `userData` mutation occurs during any stress computation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement renderStressTestCard and integrate into renderOverview
  - [x] 7.1 Add module-level state variables and `renderStressTestCard()` function
    - Add `let stressActiveCategory = 'Income Shock';` and `let stressActiveScenario = 'income-10';` module-level variables
    - Implement `renderStressTestCard()` returning HTML string using existing `card` CSS class
    - Card title: `🧪 Stress Test`
    - Category tabs: 4 buttons (Income Shock, Expense Shock, Rate Shock, Combined Shock) with active state styling, calling `switchStressCategory(category)`
    - Scenario selector: buttons for scenarios within active category, calling `selectStressScenario(scenarioId)`
    - Results section (`id="stress-results"`): call `runStressScenario(stressActiveScenario)` and render:
      - Before-vs-after comparison: 4 × `kpi-card` showing Stability Score, DSR, LCR, NIM — each with base value, shocked value, and delta
      - Stability Delta displayed prominently as negative number (e.g., "−12 points")
      - Severity banner: red for `critical`, yellow for `warning`, green for `manageable` — with descriptive message
      - Survival analysis panel: months liquidity lasts, DSR breach warning, stability breach warning, net worth sign in year 1
    - Use `fl()` for currency formatting, `sh()` for DOM updates, `$()` for element lookups
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12_

  - [x] 7.2 Add `switchStressCategory(category)` and `selectStressScenario(scenarioId)` functions
    - `switchStressCategory`: update `stressActiveCategory`, set `stressActiveScenario` to first scenario in that category, re-render stress card scenarios + results via `sh()`
    - `selectStressScenario`: update `stressActiveScenario`, call `runStressScenario()`, re-render results section only via `sh()`
    - Expose both on `window` for onclick handlers
    - _Requirements: 7.3, 7.4, 7.13_

  - [x] 7.3 Integrate `renderStressTestCard()` into `renderOverview()`
    - Insert `${renderStressTestCard()}` in the `sh('page-overview', ...)` template immediately after `${renderRiskDashboard()}` and before the AI Dashboard section
    - No new event wiring needed — existing `renderOverview()` re-render triggers cover profile switch, data edit, assumption change
    - Respects `currentProfile` selection — all computation functions already use `currentProfile`
    - _Requirements: 7.1, 7.13, 7.14_

- [x] 8. Edge case handling and polish
  - [x] 8.1 Verify defensive fallbacks and non-destructive constraints
    - Ensure all Stress Engine functions use `(value || 0)` pattern for undefined/NaN inputs
    - Ensure `userData.liquidSavings || 0` fallback in `captureBaseMetrics()`
    - Ensure `getLoansForMember()` returning empty array produces 0 shocked EMI
    - Ensure no division-by-zero paths exist without explicit guards
    - Ensure no `try/catch` blocks — use explicit guards consistent with existing codebase
    - Test with empty/minimal `userData` state: `runStressScenario` for all 9 scenarios should return numeric results without errors
    - Ensure all computations are client-side only, no API calls, no DB access, no external libraries
    - Include inline formula comments in all computation functions for auditability
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ]* 8.2 Write property test for non-mutation of userData
    - **Property 9: Non-mutation of userData**
    - Generate random userData blobs × random valid scenario IDs; deep-compare userData before and after `runStressScenario`; assert no field added, removed, or modified
    - **Validates: Requirements 2.4, 3.5, 4.11, 6.5, 8.3**

  - [ ]* 8.3 Write property test for idempotence and determinism
    - **Property 10: Idempotence and determinism**
    - Generate random userData × random valid scenario IDs; call `runStressScenario` twice; assert deeply equal results across both calls
    - **Validates: Requirements 4.12, 6.6, 8.2, 8.9**

  - [ ]* 8.4 Write property test for missing input resilience
    - **Property 11: Missing input resilience**
    - Generate userData with fields randomly set to undefined/null × all 9 scenarios; assert no errors thrown and all metric fields are numeric (non-NaN, non-undefined)
    - **Validates: Requirements 2.5, 8.8**

  - [ ]* 8.5 Write property test for formula consistency with Risk_Engine
    - **Property 12: Formula consistency with Risk_Engine (model-based)**
    - Use identity scenario (incomeFactor=1, no other shocks); assert shocked DSR, LCR, NIM, Stability Score equal base values within ±0.01 floating-point tolerance
    - **Validates: Requirements 8.7**

- [x] 9. Final checkpoint
  - Ensure all Stress Engine functions produce correct output for all 9 scenarios
  - Ensure Stress Test card renders correctly on Overview tab below Risk Dashboard
  - Ensure category tabs switch correctly and scenario selection triggers re-render
  - Ensure severity banners display correct colors (red/yellow/green) based on impact
  - Ensure re-render works on profile switch, data edit, and assumption change
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code goes into `famledgerai/index.html` — single-file architecture
- Stress Engine section is placed after the Risk Engine section
- No `computeCache` usage for stress functions — they depend on UI-selected scenario, not just `userData`
- Property tests validate the 13 correctness properties from the design document
- Each task references specific requirements for traceability
