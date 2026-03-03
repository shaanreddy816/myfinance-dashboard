# Implementation Plan: Financial Risk Layer

## Overview

Add five pure computation functions (Risk Engine) and a Risk Dashboard UI card to `famledgerai/index.html`. All functions use existing Forecast_Engine accessors and `computeCache` memoization. The UI integrates into `renderOverview()` below the Forecast Card. No external libraries, no API calls, no DB changes.

## Tasks

- [x] 1. Implement clamp helper and computeHouseholdNIM
  - [x] 1.1 Add `clamp(min, max, value)` utility and `computeHouseholdNIM()` function
    - Insert a `// ========== RISK ENGINE ==========` section after the Forecast Engine / Insurance Adequacy Forecast section (after `computeInsuranceAdequacy`)
    - Implement `clamp(min, max, value)` as `Math.max(min, Math.min(max, value))`
    - Implement `computeHouseholdNIM()` wrapped in `computeCache.get('householdNIM', ...)`
    - Compute `weightedYield` from `getInvestmentsForMember(currentProfile)` — equity types (mutualFunds, stocks) use `getForecastAssumptions().equityReturn`, debt types (fd, ppf) use `debtReturn`
    - Compute `weightedCost` from `getLoansForMember(currentProfile)` — `Σ(loan.outstanding × loan.rate) / Σ(loan.outstanding)`
    - Handle empty arrays: yield=0 when no investments, cost=0 when no loans
    - Use `(value || 0)` pattern for undefined/NaN fields
    - Compute NIM = weightedYield − weightedCost
    - RAG: green ≥ 2%, yellow ≥ 0% & < 2%, red < 0%
    - Return `{ nim, weightedYield, weightedCost, rag }`
    - Include inline formula comments for auditability
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.7, 7.1, 7.4, 7.5, 7.6_

  - [ ]* 1.2 Write property test for clamp output bounds
    - **Property 6: Clamp output bounds**
    - Generate random min, max (min ≤ max), and value; assert result ∈ [min, max]
    - **Validates: Requirement 5.7**

  - [ ]* 1.3 Write property test for NIM computation correctness
    - **Property 1: NIM computation correctness**
    - Generate random investment arrays (value ∈ [0, 1e8], type ∈ {equity, debt}) and loan arrays (outstanding ∈ [0, 1e8], rate ∈ [0, 30])
    - Assert NIM = weighted yield − weighted cost, with zero fallbacks for empty arrays
    - **Validates: Requirements 1.1, 1.3, 1.5**

- [x] 2. Implement computeDSR
  - [x] 2.1 Add `computeDSR()` function
    - Implement wrapped in `computeCache.get('dsr', ...)`
    - DSR = `(computeTotalEmi() / computeMonthlyIncome()) × 100`
    - When income = 0: DSR = 100 if EMIs exist, 0 if no EMIs
    - RAG: green ≤ 35%, yellow > 35% & ≤ 50%, red > 50%
    - Return `{ dsr, totalEmi, monthlyIncome, rag }`
    - Include inline formula comments
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.5, 7.6_

  - [ ]* 2.2 Write property test for DSR computation correctness
    - **Property 2: DSR computation correctness**
    - Generate random income ∈ [0, 1e7] and EMI ∈ [0, 1e6]; assert DSR formula and zero-income edge cases
    - **Validates: Requirements 2.1, 2.2**

- [x] 3. Implement computeLCR
  - [x] 3.1 Add `computeLCR()` function
    - Implement wrapped in `computeCache.get('lcr', ...)`
    - LCR = `userData.liquidSavings / (computeMonthlyExpenses() × 6)`
    - monthsCoverage = `userData.liquidSavings / (computeMonthlyExpenses() + computeTotalEmi())`
    - When expenses = 0: LCR = 1.0 if liquid > 0, LCR = 0 if liquid = 0
    - RAG: green ≥ 1.0, yellow ≥ 0.5 & < 1.0, red < 0.5
    - Return `{ lcr, monthsCoverage, liquidSavings, monthlyExpenses, rag }`
    - Include inline formula comments
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.5, 7.6_

  - [ ]* 3.2 Write property test for LCR and months-of-coverage correctness
    - **Property 3: LCR and months-of-coverage computation correctness**
    - Generate random liquidSavings ∈ [0, 1e8], expenses ∈ [0, 1e6], EMI ∈ [0, 1e6]; assert formulas and zero-expense edge cases
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 4. Implement computeProtectionAdequacy
  - [x] 4.1 Add `computeProtectionAdequacy()` function
    - Implement wrapped in `computeCache.get('protectionAdequacy', ...)`
    - termAdequacy = `computeInsuranceCoverage().termCover / (computeMonthlyIncome() × 12 × 12)`
    - healthBenchmark = `(1000000 + 200000 × dependentCount) × (1 + medicalInflation/100)^5`
    - dependentCount from `(userData.profile.familyMembers || []).length`
    - medicalInflation from `getForecastAssumptions().medicalInflation` (default 10%)
    - healthAdequacy = `computeInsuranceCoverage().healthCover / healthBenchmark`
    - ratio = `(termAdequacy + healthAdequacy) / 2`
    - When income = 0: termAdequacy = 1.0
    - RAG: green ≥ 0.8, yellow ≥ 0.5 & < 0.8, red < 0.5
    - Return `{ ratio, termAdequacy, healthAdequacy, termCover, healthCover, termBenchmark, healthBenchmark, dependentCount, rag }`
    - Include inline formula comments
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.1, 7.5, 7.6_

  - [ ]* 4.2 Write property test for Protection adequacy computation correctness
    - **Property 4: Protection adequacy computation correctness**
    - Generate random termCover, healthCover, income, dependents, medInflation; assert formula and zero-income edge case
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6**

- [x] 5. Implement computeStabilityScore
  - [x] 5.1 Add `computeStabilityScore()` function
    - Implement wrapped in `computeCache.get('stabilityScore', ...)`
    - Call all four sub-metric functions to get raw values
    - Normalize each to 0–100: `nimScore = clamp(0, 100, 50 + nim × 25)`, `dsrScore = clamp(0, 100, 100 − dsr × 2)`, `lcrScore = clamp(0, 100, lcr × 100)`, `protScore = clamp(0, 100, ratio × 100)`
    - Composite: `Math.round(dsrScore × 0.30 + lcrScore × 0.25 + nimScore × 0.20 + protScore × 0.25)`
    - topRisk = sub-metric with lowest normalized score
    - suggestion = actionable string based on topRisk (DSR → reduce EMIs, LCR → build emergency fund, NIM → review investment mix, Protection → increase coverage)
    - RAG: green 75–100, yellow 50–74, red 0–49
    - Return `{ score, nimScore, dsrScore, lcrScore, protScore, topRisk, suggestion, rag }`
    - Include inline formula comments
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 7.1, 7.5_

  - [ ]* 5.2 Write property test for RAG classification correctness
    - **Property 5: RAG classification correctness**
    - Generate random metric values; assert RAG thresholds for all five metrics
    - **Validates: Requirements 1.6, 2.3, 3.4, 4.5, 5.4**

  - [ ]* 5.3 Write property test for stability score normalization and weighted composition
    - **Property 7: Stability score normalization and weighted composition**
    - Generate random NIM, DSR, LCR, protection values; assert sub-scores ∈ [0, 100] and composite formula
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 5.4 Write property test for top risk identification
    - **Property 8: Top risk identification**
    - Generate random 4-tuple of scores; assert topRisk matches the lowest sub-score
    - **Validates: Requirement 5.5**

- [x] 6. Checkpoint — Verify all Risk Engine functions
  - Ensure all five computation functions are implemented and return correct shapes
  - Ensure `computeCache` integration works (functions are memoized)
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement renderRiskDashboard and integrate into renderOverview
  - [x] 7.1 Add `renderRiskDashboard()` function returning HTML string
    - Call `computeStabilityScore()` to get all data (it internally calls all sub-metrics)
    - Call each sub-metric function for detail data (NIM, DSR, LCR, Protection)
    - Build card HTML using existing `card` CSS class
    - Hero section: `score-ring-svg` with RAG-colored stroke, score number centered, top risk label + suggestion below
    - Sub-metric grid: 4 × `kpi-card` rows showing metric name, value (use `fl()` for currency values), RAG color dot
    - Use `sh()` pattern for DOM updates, `$()` for element lookups, `fl()` for Indian currency formatting
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8, 6.10_

  - [x] 7.2 Integrate `renderRiskDashboard()` into `renderOverview()`
    - Insert the `renderRiskDashboard()` call inside `renderOverview()` after the Forecast Card section and before the Priority Actions / Health Indicators grid
    - Concatenate the returned HTML into the `sh('page-overview', ...)` template
    - Respects `currentProfile` selection — all sub-metric functions already use `currentProfile`
    - No new event wiring needed — existing `renderOverview()` re-render triggers cover profile switch, data edit, assumption change
    - _Requirements: 6.1, 6.9, 6.10_

- [x] 8. Add expandable detail rows
  - [x] 8.1 Add `toggleRiskDetail(metricId)` function and detail row HTML
    - Add `window.toggleRiskDetail = function(metricId) { ... }` using `$('risk-detail-' + metricId).hidden` toggle
    - Add hidden `<div>` sections in `renderRiskDashboard()` for each metric: `risk-detail-nim`, `risk-detail-dsr`, `risk-detail-lcr`, `risk-detail-prot`
    - Each detail row shows: formula used, input values (formatted with `fl()`), one-line plain-language explanation
    - Wire `onclick="toggleRiskDetail('nim')"` etc. on each kpi-card
    - _Requirements: 6.6, 6.7, 6.8_

- [x] 9. Edge case handling and polish
  - [x] 9.1 Verify defensive fallbacks for missing/undefined data
    - Ensure all Risk Engine functions use `(value || 0)` pattern for undefined/NaN inputs
    - Ensure `userData.liquidSavings || 0`, `userData.profile.familyMembers || []` fallbacks are in place
    - Ensure no division-by-zero paths exist without guards
    - Ensure no `try/catch` blocks — use explicit guards consistent with existing codebase
    - Test with empty `userData` state: all five metrics should return numeric results without errors
    - _Requirements: 7.2, 7.3, 7.6_

  - [ ]* 9.2 Write property test for idempotence of risk computation
    - **Property 10: Idempotence of risk computation**
    - Compute all five metrics twice with same input; assert identical results
    - **Validates: Requirements 7.2, 7.7**

  - [ ]* 9.3 Write property test for missing input resilience
    - **Property 11: Missing input resilience**
    - Generate userData with fields randomly set to undefined; assert no errors and all numeric results
    - **Validates: Requirement 7.6**

  - [ ]* 9.4 Write property test for weighted composition round-trip
    - **Property 9: Weighted composition round-trip**
    - Generate random 4-tuple of normalized scores; assert decomposition sums to original within ±1
    - **Validates: Requirement 5.8**

- [x] 10. Final checkpoint
  - Ensure all Risk Engine functions produce correct output for known test cases
  - Ensure Risk Dashboard renders correctly on Overview tab below Forecast Card
  - Ensure expandable detail rows toggle correctly
  - Ensure re-render works on profile switch, data edit, and assumption change
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code goes into `famledgerai/index.html` — single-file architecture
- Risk Engine functions are placed after the Insurance Adequacy Forecast section, before the Forecast Card UI section
- All functions use `computeCache.get()` for memoization — no new cache invalidation wiring needed
- Property tests validate universal correctness properties from the design document
- Each task references specific requirements for traceability
