# Implementation Plan: 15-Year Forecast + Suggestions

## Overview

All implementation is client-side JavaScript within `famledgerai/index.html`. The ForecastEngine is a set of pure computation functions; UI is rendered via existing `sh()` / template literal patterns. Tasks follow the 30/60/90 day plan: assumptions + net worth + savings first, then goals + loans, then insurance + polish.

## Tasks

- [x] 1. Implement Forecast Assumptions storage and panel (Day 30 — US-6)
  - [x] 1.1 Add `getDefaultAssumptions()` helper and `getForecastAssumptions()` accessor
    - Return `{ equityReturn: 12, debtReturn: 7, incomeGrowth: 8, expenseInflation: 6, medicalInflation: 10 }` as defaults
    - `getForecastAssumptions()` reads from `userData.profile.forecastAssumptions`, falling back to defaults
    - _Requirements: 6.1, 1.8_

  - [x] 1.2 Add Forecast Assumptions section to `renderSettings()`
    - Render editable number inputs for all 5 assumption fields inside the Settings tab
    - Display one-line explainer below each field (e.g., "Long-term equity index return after expense ratio")
    - Add "Reset to defaults" button that restores all values to defaults
    - On change: save to `userData.profile.forecastAssumptions` via `debounceSave()`, then re-render active forecast views
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 1.3 Write unit tests for `getDefaultAssumptions()` and `getForecastAssumptions()`
    - Test default values returned when `forecastAssumptions` is undefined
    - Test custom values returned when `forecastAssumptions` exists
    - Test partial overrides merge correctly with defaults
    - _Requirements: 6.1, 1.8_

- [x] 2. Implement ForecastEngine core computation functions (Day 30 — US-1, US-2)
  - [x] 2.1 Implement `computeWeightedReturnRate()`
    - Derive equity/debt allocation fractions from `getInvestmentsForMember(currentProfile)`
    - Compute `(equityReturn × equityFraction) + (debtReturn × debtFraction)` using forecast assumptions
    - Handle edge case: no investments → use 50/50 split
    - _Requirements: 1.3_

  - [x] 2.2 Implement `computeLoanAmortization(loan, extraMonthlyPayment)`
    - Given a loan object (`outstanding`, `emi`, `rate`), compute month-by-month amortization
    - Return array of year-end outstanding balances (15 entries), setting to 0 when paid off
    - Accept optional `extraMonthlyPayment` parameter for prepayment scenarios
    - Also return `totalInterestPaid` and `payoffMonth` for loan freedom calculations
    - _Requirements: 1.4, 4.2_

  - [x] 2.3 Implement `computeNetWorthProjection(assumptions)`
    - For each year 0–15: compute total investments compounded at weighted return rate, subtract total loan outstanding after amortization, add liquid savings
    - Source data from `getInvestmentsForMember`, `getLoansForMember`, `userData.liquidSavings`
    - Return array of 16 objects: `{ year, investments, loanOutstanding, netWorth }`
    - _Requirements: 1.2, 1.3, 1.4, 1.7, 1.8_

  - [x] 2.4 Implement `computeSavingsTrajectory(assumptions)`
    - Project annual income using `computeMonthlyIncome() × 12 × (1 + incomeGrowth)^year`
    - Project annual expenses using `computeMonthlyExpenses() × 12 × (1 + expenseInflation)^year`
    - Project annual EMIs from loan amortization schedules (EMIs drop to 0 after loan payoff)
    - Compute net savings per year, add to investment corpus, compound in subsequent years
    - Return array of 16 objects: `{ year, income, expenses, emis, netSavings, cumulativeCorpus }`
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.5 Write property tests for net worth projection
    - **Property 1: Monotonic net worth growth** — With positive return rate and no loans, net worth must be non-decreasing each year
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 2.6 Write property tests for savings trajectory
    - **Property 2: Cumulative corpus non-negative** — Cumulative corpus must never go negative regardless of assumption values within valid ranges
    - **Validates: Requirements 2.4, 2.5**

- [x] 3. Checkpoint — Day 30 core engine
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Forecast Card UI on Overview tab (Day 30 — US-1, US-2, US-6)
  - [x] 4.1 Add `renderForecastCard()` and integrate into `renderOverview()`
    - Create a Forecast_Card container below existing KPI cards in the Overview tab
    - Add toggle tabs: "Net Worth" (default) and "Savings Trajectory"
    - Add "⚙️ Assumptions" button that scrolls to Settings tab assumptions section or opens inline
    - _Requirements: 1.1, 2.1, 6.2_

  - [x] 4.2 Implement SVG net worth line chart in `renderNetWorthChart(projection)`
    - Render a responsive SVG line chart with Year 0–15 on x-axis, ₹ values on y-axis
    - Plot net worth data points from `computeNetWorthProjection()`
    - Add hover/tap tooltips showing "Investments: ₹X, Loans: ₹Y, Net: ₹Z" per year
    - Add ℹ️ icon with formula tooltip explaining the net worth calculation
    - No external chart library — pure SVG with inline event handlers
    - _Requirements: 1.1, 1.5, 1.6_

  - [x] 4.3 Implement `renderSavingsTrajectoryView(trajectory)`
    - Render a table/accordion view showing each year's projected income, expenses, EMIs, net savings, cumulative corpus
    - Each year row is expandable to show the full breakdown
    - Re-renders client-side when assumptions change (no API call)
    - _Requirements: 2.1, 2.6, 2.7_

- [x] 5. Implement Goal Gap Analysis (Day 60 — US-3)
  - [x] 5.1 Implement `computeGoalGaps(assumptions, savingsTrajectory)`
    - Read goals from `userData.profile.goals`
    - Map each goal label to default target amount and target year based on user age and income
    - Compute inflation-adjusted target: `targetAmount × (1 + expenseInflation)^targetYear`
    - Compute gap: `inflatedTarget − projectedCorpus at targetYear`
    - When gap > 0, compute monthly SIP needed using PMT formula: `PMT = FV × r / ((1+r)^n − 1)`
    - Return array sorted by gap size (largest first), capped at 5 goals
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [x] 5.2 Add Goal Gap Analysis section to `renderForecastCard()`
    - Display table: goal name, target amount (inflation-adjusted), target year, projected corpus, gap/surplus
    - Color-code: green (surplus or met), yellow (gap ≤ 20% of target), red (gap > 20%)
    - Show "You need ₹X/month extra SIP to close this gap" for goals with gaps
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 5.3 Write property tests for goal gap computation
    - **Property 3: PMT formula consistency** — Monthly SIP computed by PMT, when compounded over remaining months at weighted return rate, must produce an amount within 1% of the goal gap
    - **Validates: Requirements 3.2, 3.5**

- [x] 6. Implement Loan Freedom Date (Day 60 — US-4)
  - [x] 6.1 Implement `computeDebtFreeDate(loans, extraMonthly)`
    - For each active loan from `getLoansForMember(currentProfile)`, compute payoff month using `computeLoanAmortization()`
    - Determine overall debt-free date as the latest payoff date among all loans
    - Accept `extraMonthly` parameter to compute prepayment scenario
    - Return `{ debtFreeDate, monthsSaved, interestSaved, perLoanDetails }`
    - _Requirements: 4.2, 4.3, 4.8_

  - [x] 6.2 Add `renderLoanFreedomCard()` to `renderLoans()`
    - Render a "Loan Freedom" card at the top of the Loans tab
    - Display headline: "Debt-free by: [Month Year]"
    - Add prepayment slider: ₹1,000 to ₹50,000 in ₹1,000 increments
    - On slider change: recalculate and display new debt-free date + "You save ₹Y in interest"
    - Add tooltip explaining months saved formula: `original tenure − new tenure`
    - Handle edge case: no active loans → show "You're debt-free! 🎉"
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 6.3 Write property tests for loan amortization
    - **Property 4: Amortization terminates** — For any loan with positive EMI > monthly interest, the outstanding balance must reach 0 within a finite number of months
    - **Validates: Requirements 4.2**
    - **Property 5: Extra payment reduces tenure** — Adding any positive extra monthly payment must result in a payoff month ≤ the original payoff month
    - **Validates: Requirements 4.6**

- [x] 7. Checkpoint — Day 60 goals and loans
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Insurance Adequacy Forecast (Day 90 — US-5)
  - [x] 8.1 Implement `computeInsuranceAdequacy(assumptions)`
    - Compute recommended term cover at years 5, 10, 15: `annualIncome × 12 × (1 + incomeGrowth)^year`
    - Compute recommended health cover at years 5, 10, 15: `(₹10,00,000 + ₹2,00,000 × dependentCount) × (1 + medicalInflation)^year`
    - Get current covers from `computeInsuranceCoverage().termCover` and `.healthCover` (static, not projected)
    - Return `{ term: [{year, recommended, current, gap}], health: [{year, recommended, current, gap}] }`
    - _Requirements: 5.2, 5.3, 5.5_

  - [x] 8.2 Add `renderInsuranceAdequacyCard()` to `renderInsurance()`
    - Render "Insurance Adequacy Forecast" card at top of Insurance tab
    - Display table with columns: Year | Recommended Cover | Current Cover | Gap — separate sections for Term Life and Health
    - Color-code rows: green when current ≥ recommended, red when current < recommended
    - Add tooltip on health section: "Medical inflation assumed at 10% p.a. — healthcare costs double roughly every 7 years."
    - _Requirements: 5.1, 5.4, 5.6, 5.7_

  - [ ]* 8.3 Write property tests for insurance adequacy
    - **Property 6: Recommended cover increases over time** — For any positive growth/inflation rate, recommended cover at year N+5 must exceed recommended cover at year N
    - **Validates: Requirements 5.2, 5.3**

- [x] 9. Polish and edge cases (Day 90)
  - [x] 9.1 Handle empty/missing data gracefully across all forecast views
    - No investments: show net worth chart with 0 baseline, display helpful message
    - No loans: skip loan amortization, show "No active loans" in Loan Freedom card
    - No goals: show "Add goals in Settings to see gap analysis"
    - No insurance: show "Add insurance policies to see adequacy forecast"
    - No income/expenses: show savings trajectory with 0 baseline and prompt to set up income
    - _Requirements: 1.7, 4.8, 5.5_

  - [x] 9.2 Wire assumption changes to re-render all forecast views
    - When any assumption changes in Settings, trigger re-render of: net worth chart, savings trajectory, goal gap analysis, loan freedom card, insurance adequacy card
    - Ensure `computeCache.invalidate()` is called before re-render
    - Verify no API calls are made during re-computation
    - _Requirements: 2.7, 6.5, 6.6, 6.7_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code is vanilla JavaScript in `famledgerai/index.html` — no external libraries
- All computation is deterministic and client-side — no new API endpoints
- SVG chart is hand-rolled (no chart library dependency)
- Property tests validate universal correctness properties; unit tests validate specific examples
- Checkpoints at Day 30 (task 3), Day 60 (task 7), and final (task 10)
