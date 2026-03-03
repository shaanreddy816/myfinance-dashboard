# Requirements Document

## Introduction

FamLedgerAI's "Household Stress Testing Layer" (Phase 1.5) adds deterministic what-if scenario analysis on top of the existing Risk_Engine and Forecast_Engine. The feature defines 9 predefined stress scenarios across 4 categories (Income Shock, Expense Shock, Rate Shock, Combined Shock), applies mathematical adjustments to base financial inputs, recomputes all risk metrics (DSR, LCR, NIM, Stability Score) with shocked values, and runs household survival analysis — all without modifying `userData`. The UI renders as a single "Stress Test" card on the Overview tab below the Risk Dashboard, showing before-vs-after comparisons and severity-coded warnings. All computation is client-side, fully deterministic, vanilla JS, no external libraries, no API calls, no database changes.

## Glossary

- **Stress_Engine**: The client-side JavaScript module that applies shock scenarios to base financial inputs and recomputes risk metrics using temporary overrides
- **Stress_Card**: The new UI card on the Overview tab (below the Risk Dashboard) that displays scenario selection, before-vs-after comparison, and survival analysis
- **Risk_Engine**: The existing client-side module that computes DSR, LCR, NIM, Protection_Adequacy, and Stability_Score (from Phase 1)
- **Forecast_Engine**: The existing client-side module providing accessor functions: `computeMonthlyIncome()`, `computeMonthlyExpenses()`, `computeTotalEmi()`, `getLoansForMember()`, etc.
- **STRESS_SCENARIOS**: The constant catalog object mapping each scenario ID to its type, label, parameters, and severity thresholds
- **Base_Metrics**: A snapshot of the current (unshocked) risk state captured before applying any scenario — includes DSR, LCR, NIM, Stability_Score, monthly income, monthly expenses, total EMI, and liquid savings
- **Shocked_Metrics**: The recomputed risk metrics after applying a scenario's mathematical adjustments to the base inputs
- **Scenario_ID**: A unique string identifier for each stress scenario (e.g., `income-10`, `expense-med`, `combined-severe`)
- **Income_Factor**: A multiplier applied to base monthly income (e.g., 0.90 means income reduced by 10%)
- **Expense_Factor**: A multiplier applied to base monthly expenses (e.g., 1.20 means expenses increased by 20%)
- **Rate_Bump**: The number of percentage points added to each loan's interest rate for rate shock scenarios (e.g., 1 means +1%)
- **Liquid_Hit**: A one-time deduction from liquid savings representing emergency drain (e.g., 6 months of expenses for medical emergency)
- **Stability_Delta**: The difference between the base Stability_Score and the shocked Stability_Score (`base.score − shocked.score`)
- **Survival_Analysis**: A set of household resilience indicators computed from shocked values: months liquidity lasts, DSR breach flag, stability breach flag, and net worth sign in year 1
- **Severity**: A classification of shock impact — `manageable` (green), `warning` (yellow), or `critical` (red) — derived from survival analysis thresholds
- **Shocked_EMI**: The recalculated monthly EMI for a loan after applying a Rate_Bump, computed using the standard EMI formula with the bumped interest rate and remaining tenure
- **FamLedgerAI**: The family finance management application (single-file vanilla JS app in `famledgerai/index.html`)

## Requirements

### Requirement 1: Stress Scenario Catalog

**User Story:** As a family finance user, I want a predefined set of stress scenarios covering income loss, expense spikes, interest rate hikes, and combined shocks, so that I can test my household's resilience against realistic adverse events.

#### Acceptance Criteria

1. THE Stress_Engine SHALL define a STRESS_SCENARIOS constant catalog containing 9 scenarios across 4 categories: Income Shock, Expense Shock, Rate Shock, and Combined Shock.
2. THE Stress_Engine SHALL define Income Shock scenarios: `income-10` with Income_Factor 0.90 and `income-20` with Income_Factor 0.80.
3. THE Stress_Engine SHALL define Expense Shock scenarios: `expense-10` with Expense_Factor 1.10, `expense-20` with Expense_Factor 1.20, and `expense-med` with Expense_Factor 1.50 and Liquid_Hit equal to 6 months of base monthly expenses.
4. THE Stress_Engine SHALL define Rate Shock scenarios: `rate-100` with Rate_Bump 1 and `rate-200` with Rate_Bump 2.
5. THE Stress_Engine SHALL define Combined Shock scenarios: `combined-mild` with Income_Factor 0.90 and Rate_Bump 1, and `combined-severe` with Income_Factor 0.80 and Rate_Bump 2.
6. THE Stress_Engine SHALL store each scenario entry with: Scenario_ID, category label, display name, parameter overrides (Income_Factor, Expense_Factor, Rate_Bump, Liquid_Hit as applicable), and a human-readable description.
7. THE Stress_Engine SHALL treat STRESS_SCENARIOS as immutable — the catalog values are read-only constants that are defined at module initialization and remain unchanged during execution.

### Requirement 2: Base Metrics Capture

**User Story:** As a user, I want the system to snapshot my current financial risk state before applying any stress scenario, so that I can see an accurate before-vs-after comparison.

#### Acceptance Criteria

1. THE Stress_Engine SHALL implement a `captureBaseMetrics()` function that captures the current unshocked risk state.
2. THE `captureBaseMetrics()` function SHALL capture: monthly income from `computeMonthlyIncome()`, monthly expenses from `computeMonthlyExpenses()`, total EMI from `computeTotalEmi()`, liquid savings from `userData.liquidSavings`, DSR from `computeDSR()`, LCR from `computeLCR()`, NIM from `computeHouseholdNIM()`, and Stability_Score from `computeStabilityScore()`.
3. THE `captureBaseMetrics()` function SHALL return a plain object containing all captured values as a read-only snapshot.
4. THE `captureBaseMetrics()` function SHALL use existing Forecast_Engine and Risk_Engine accessor functions without modifying `userData`.
5. WHEN any captured base value is missing or undefined, THE `captureBaseMetrics()` function SHALL default that value to zero.

### Requirement 3: Shocked EMI Computation

**User Story:** As a user with active loans, I want to see how a rate hike would change my monthly EMI payments, so that I can understand the impact of interest rate increases on my debt burden.

#### Acceptance Criteria

1. THE Stress_Engine SHALL implement a `computeShockedEMI(rateBump)` function that recalculates total monthly EMI with bumped interest rates.
2. THE `computeShockedEMI(rateBump)` function SHALL retrieve all active loans via `getLoansForMember(currentProfile)` and for each loan compute a new EMI using the standard EMI formula: `EMI = P × r × (1+r)^n / ((1+r)^n − 1)`, where P is `loan.outstanding`, r is `(loan.rate + rateBump) / 12 / 100` (monthly rate with bump), and n is `loan.remainingTenure × 12` (remaining months).
3. WHEN Rate_Bump is zero or undefined, THE `computeShockedEMI(rateBump)` function SHALL return the original total EMI from `computeTotalEmi()`.
4. WHEN a loan has zero outstanding balance, THE `computeShockedEMI(rateBump)` function SHALL contribute zero EMI for that loan.
5. THE `computeShockedEMI(rateBump)` function SHALL not modify any loan data in `userData`.

### Requirement 4: Shocked Metrics Computation

**User Story:** As a user, I want the system to recompute all risk metrics using stressed financial inputs, so that I can see how each metric degrades under adverse conditions.

#### Acceptance Criteria

1. THE Stress_Engine SHALL implement a `computeShockedMetrics(scenario, base)` function that applies a scenario's parameter overrides to the Base_Metrics and recomputes DSR, LCR, NIM, and Stability_Score.
2. THE `computeShockedMetrics(scenario, base)` function SHALL compute shocked monthly income as `base.monthlyIncome × scenario.incomeFactor` when Income_Factor is defined, or use `base.monthlyIncome` when Income_Factor is not defined.
3. THE `computeShockedMetrics(scenario, base)` function SHALL compute shocked monthly expenses as `base.monthlyExpenses × scenario.expenseFactor` when Expense_Factor is defined, or use `base.monthlyExpenses` when Expense_Factor is not defined.
4. THE `computeShockedMetrics(scenario, base)` function SHALL compute shocked total EMI by calling `computeShockedEMI(scenario.rateBump)` when Rate_Bump is defined, or use `base.totalEmi` when Rate_Bump is not defined.
5. THE `computeShockedMetrics(scenario, base)` function SHALL compute shocked liquid savings as `base.liquidSavings − scenario.liquidHit` when Liquid_Hit is defined, clamped to a minimum of zero, or use `base.liquidSavings` when Liquid_Hit is not defined.
6. THE `computeShockedMetrics(scenario, base)` function SHALL recompute DSR as `(shockedEmi / shockedIncome) × 100`, applying the same zero-income guard as the existing `computeDSR()` function.
7. THE `computeShockedMetrics(scenario, base)` function SHALL recompute LCR as `shockedLiquidSavings / (shockedExpenses × 6)`, applying the same zero-expense guard as the existing `computeLCR()` function.
8. THE `computeShockedMetrics(scenario, base)` function SHALL recompute NIM using the existing `computeHouseholdNIM()` return value (NIM is unaffected by income/expense/rate shocks as it depends on investment yields and loan rates, not cash flow — except for rate shocks where the weighted cost increases by Rate_Bump percentage points).
9. WHEN a Rate_Bump is defined, THE `computeShockedMetrics(scenario, base)` function SHALL compute shocked NIM as `base.nim.weightedYield − (base.nim.weightedCost + rateBump)`.
10. THE `computeShockedMetrics(scenario, base)` function SHALL recompute the Stability_Score using the same normalization formulas and weights as the existing `computeStabilityScore()` function: `nimScore = clamp(0, 100, 50 + shockedNIM × 25)`, `dsrScore = clamp(0, 100, 100 − shockedDSR × 2)`, `lcrScore = clamp(0, 100, shockedLCR × 100)`, `protScore` unchanged from base, composite = `round(dsrScore × 0.30 + lcrScore × 0.25 + nimScore × 0.20 + protScore × 0.25)`.
11. THE `computeShockedMetrics(scenario, base)` function SHALL not modify `userData` or call any function that modifies `userData`.
12. FOR ALL scenarios in STRESS_SCENARIOS, computing shocked metrics with a given base and then recomputing with the same base and scenario SHALL produce identical results (deterministic property).

### Requirement 5: Shock Impact Evaluation and Survival Analysis

**User Story:** As a user, I want to see how much my financial stability degrades under each scenario and whether my household can survive the shock, so that I can identify vulnerabilities and plan contingencies.

#### Acceptance Criteria

1. THE Stress_Engine SHALL implement an `evaluateShockImpact(base, shocked, scenario)` function that computes deltas and survival indicators.
2. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL compute Stability_Delta as `base.stabilityScore − shocked.stabilityScore`.
3. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL compute DSR delta as `shocked.dsr − base.dsr` (positive means worsened).
4. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL compute LCR delta as `base.lcr − shocked.lcr` (positive means worsened).
5. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL compute NIM delta as `base.nim − shocked.nim` (positive means worsened).
6. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL compute months of liquidity as `shocked.liquidSavings / monthlyDeficit`, where monthly deficit is `shocked.expenses + shocked.emi − shocked.income` when deficit is positive, or report liquidity as unlimited (capped at 999) when there is no deficit.
7. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL flag DSR breach as true when shocked DSR exceeds 50%.
8. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL flag stability breach as true when shocked Stability_Score drops below 50.
9. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL flag net worth negative as true when `(shocked.income − shocked.expenses − shocked.emi) × 12` plus total investments minus total loan outstanding is less than zero in year 1.
10. THE `evaluateShockImpact(base, shocked, scenario)` function SHALL classify Severity as `critical` when shocked Stability_Score is below 50 or shocked DSR exceeds 50%, as `warning` when months of liquidity is less than 6, or as `manageable` when none of the critical or warning conditions are met.
11. FOR ALL valid base and shocked metric pairs, the Stability_Delta SHALL equal the difference of the independently computed base and shocked stability scores (round-trip consistency of delta computation).

### Requirement 6: Stress Scenario Orchestrator

**User Story:** As a user, I want to run any stress scenario with a single action and get a complete impact report, so that I can quickly assess my household's vulnerability to specific shocks.

#### Acceptance Criteria

1. THE Stress_Engine SHALL implement a `runStressScenario(scenarioId)` function that orchestrates the full stress test pipeline for a given Scenario_ID.
2. THE `runStressScenario(scenarioId)` function SHALL look up the scenario from STRESS_SCENARIOS, call `captureBaseMetrics()`, call `computeShockedMetrics(scenario, base)`, call `evaluateShockImpact(base, shocked, scenario)`, and return a complete result object.
3. THE `runStressScenario(scenarioId)` function SHALL return an object containing: the Scenario_ID, scenario display name, Base_Metrics, Shocked_Metrics, all deltas, Survival_Analysis results, and Severity classification.
4. IF an invalid Scenario_ID is provided, THEN THE `runStressScenario(scenarioId)` function SHALL return an error object with a descriptive message instead of throwing an exception.
5. THE `runStressScenario(scenarioId)` function SHALL complete execution without modifying `userData`, without making API calls, and without accessing the database.
6. FOR ALL valid Scenario_IDs, running `runStressScenario(scenarioId)` twice with the same `userData` state SHALL produce identical result objects (idempotence property).

### Requirement 7: Stress Test UI Card

**User Story:** As a user, I want a Stress Test card on the Overview tab that lets me select scenarios and see before-vs-after comparisons with clear severity indicators, so that I can visually assess my household's resilience.

#### Acceptance Criteria

1. THE Stress_Card SHALL render on the Overview tab, positioned below the Risk Dashboard card, using the existing `card` CSS class.
2. THE Stress_Card SHALL display a scenario category selector (Income Shock, Expense Shock, Rate Shock, Combined Shock) using tabs or a dropdown, consistent with existing UI patterns.
3. WHEN a user selects a scenario category, THE Stress_Card SHALL display the available scenarios within that category as selectable options.
4. WHEN a user selects a specific scenario, THE Stress_Card SHALL call `runStressScenario(scenarioId)` and render the results.
5. THE Stress_Card SHALL display a before-vs-after side-by-side comparison showing: Stability_Score, DSR, LCR, and NIM — each with base value, shocked value, and delta.
6. THE Stress_Card SHALL display the Stability_Delta prominently, formatted as a negative number (e.g., "−12 points").
7. WHEN Severity is `critical` (shocked Stability_Score below 50 or shocked DSR above 50%), THE Stress_Card SHALL display a red warning banner with a descriptive message.
8. WHEN Severity is `warning` (months of liquidity less than 6), THE Stress_Card SHALL display a yellow warning banner with a descriptive message.
9. WHEN Severity is `manageable`, THE Stress_Card SHALL display a green "Resilient" indicator.
10. THE Stress_Card SHALL display the Survival_Analysis section showing: months liquidity lasts, DSR breach warning (when applicable), stability breach warning (when applicable), and net worth sign in year 1.
11. THE Stress_Card SHALL render all currency values using `fl()` for Indian currency formatting.
12. THE Stress_Card SHALL use `sh()` for DOM updates and `$()` for element lookups, consistent with the existing codebase pattern.
13. WHEN `userData` changes (via profile switch, data edit, or assumption change), THE Stress_Card SHALL re-render with updated stress test results for the currently selected scenario without any API call.
14. THE Stress_Card SHALL respect the `currentProfile` selection from the Profile_Selector, computing stress metrics for the selected family member.

### Requirement 8: Deterministic and Non-Destructive Constraints

**User Story:** As a user, I want all stress computations to be transparent, repeatable, and performed without altering my actual financial data, so that I can safely explore what-if scenarios.

#### Acceptance Criteria

1. THE Stress_Engine SHALL perform all computations client-side using only data available in `userData` and existing Forecast_Engine and Risk_Engine accessor functions.
2. THE Stress_Engine SHALL produce identical output for identical input (deterministic computation with no randomness, no Monte Carlo simulation, no stochastic modeling).
3. THE Stress_Engine SHALL not modify `userData` at any point during stress scenario execution — all shocks are temporary overrides applied to copied values.
4. THE Stress_Engine SHALL introduce no new API endpoints, no new database tables, and no new external library dependencies.
5. THE Stress_Engine SHALL use vanilla JavaScript only, consistent with the existing `famledgerai/index.html` single-file architecture.
6. THE Stress_Engine SHALL include inline formula comments in the source code explaining each shock computation step for auditability.
7. THE Stress_Engine SHALL reuse existing Risk_Engine functions (`computeHouseholdNIM`, `computeDSR`, `computeLCR`, `computeProtectionAdequacy`, `computeStabilityScore`, `clamp`) for formula reference and consistency, applying the same formulas to shocked inputs.
8. WHEN any input value is missing or undefined, THE Stress_Engine SHALL fall back to zero for that input and continue computation without throwing an error.
9. FOR ALL valid `userData` states and all 9 scenarios, running the full stress test pipeline and then running it again with the same input SHALL produce identical results (idempotence property).
