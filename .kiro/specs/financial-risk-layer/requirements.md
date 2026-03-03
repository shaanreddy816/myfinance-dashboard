# Requirements Document

## Introduction

FamLedgerAI's "Financial Risk Layer" adds a Phase-1 risk assessment dashboard on top of the existing deterministic Forecast_Engine. The feature computes five banking-style risk metrics — Household NIM, Debt Service Ratio, Liquidity Coverage Ratio, Protection Adequacy Ratio, and a composite Financial Stability Score — using data already available in `userData` via existing accessor functions. All computation is client-side, fully deterministic (no Monte Carlo, no macro modeling), and explainable to a 35-year salaried Indian user. The UI renders as a single "Risk Dashboard" card on the Overview tab, positioned below the existing Forecast Card, using the app's existing `kpi-card`, `score-ring-svg`, `sh()`, `fl()`, and `$()` patterns. No external libraries, no API calls, no database schema changes.

## Glossary

- **Risk_Engine**: The client-side JavaScript module that computes all five risk metrics using deterministic formulas and existing Forecast_Engine accessors
- **Risk_Dashboard**: The new UI card on the Overview tab (below the Forecast Card) that displays the Financial Stability Score as a hero element and four sub-metrics as expandable detail rows
- **FamLedgerAI**: The family finance management application (single-file vanilla JS app in `famledgerai/index.html`)
- **Forecast_Engine**: The existing client-side JavaScript module that computes 15-year projections and provides accessor functions
- **Forecast_Assumptions**: The object stored at `userData.profile.forecastAssumptions` containing configurable rates: `{equityReturn, debtReturn, incomeGrowth, expenseInflation, medicalInflation}`
- **NIM**: Net Interest Margin — the spread between weighted investment yield and weighted borrowing cost, adapted from banking terminology to household finance
- **DSR**: Debt Service Ratio — the percentage of gross monthly income consumed by loan EMIs, used by banks to evaluate borrower capacity
- **LCR**: Liquidity Coverage Ratio — the ratio of liquid savings to six months of expenses, measuring emergency buffer adequacy
- **Protection_Adequacy**: The ratio of current insurance coverage (term life and health) to recommended benchmarks, measuring insurance gap risk
- **Stability_Score**: A composite weighted score (0–100) combining DSR, LCR, NIM, and Protection_Adequacy into a single financial health indicator
- **RAG_Status**: Red-Amber-Green traffic-light classification applied to each metric based on defined thresholds
- **Weighted_Yield**: The blended annual return across all investments for a member, computed as `Σ(investment_i × return_i) / Σ(investment_i)`
- **Weighted_Cost**: The blended annual interest cost across all loans for a member, computed as `Σ(loan_i.outstanding × loan_i.rate) / Σ(loan_i.outstanding)`
- **Health_Benchmark**: The recommended health insurance cover computed as `(₹10,00,000 + ₹2,00,000 × dependents) × (1 + medicalInflation)^5`

## Requirements

### Requirement 1: Household Net Interest Margin (NIM) Computation

**User Story:** As a family finance user, I want to see the spread between what my investments earn and what my loans cost, so that I can understand whether my assets are outpacing my liabilities.

#### Acceptance Criteria

1. THE Risk_Engine SHALL compute Weighted_Yield as `Σ(investment_i.value × investment_i.returnRate) / Σ(investment_i.value)` using investment data from `getInvestmentsForMember(currentProfile)` and return rates from `getForecastAssumptions()`.
2. WHEN a member has no investments, THE Risk_Engine SHALL set Weighted_Yield to zero.
3. THE Risk_Engine SHALL compute Weighted_Cost as `Σ(loan_i.outstanding × loan_i.rate) / Σ(loan_i.outstanding)` using loan data from `getLoansForMember(currentProfile)`.
4. WHEN a member has no loans, THE Risk_Engine SHALL set Weighted_Cost to zero.
5. THE Risk_Engine SHALL compute NIM as `Weighted_Yield − Weighted_Cost`, expressed as a percentage.
6. THE Risk_Engine SHALL classify NIM with RAG_Status: green when NIM is greater than or equal to 2%, yellow when NIM is greater than or equal to 0% and less than 2%, red when NIM is less than 0%.
7. THE Risk_Engine SHALL source equity and debt return rates from `getForecastAssumptions()` to compute per-investment return rates based on investment type (equity instruments use `equityReturn`, debt instruments use `debtReturn`).

### Requirement 2: Debt Service Ratio (DSR) Computation

**User Story:** As a salaried user, I want to know what percentage of my income goes toward loan repayments, so that I can assess whether my debt load is sustainable by banking standards.

#### Acceptance Criteria

1. THE Risk_Engine SHALL compute DSR as `(computeTotalEmi() / computeMonthlyIncome()) × 100`, expressed as a percentage.
2. WHEN `computeMonthlyIncome()` returns zero, THE Risk_Engine SHALL set DSR to 100 if any EMIs exist, or 0 if no EMIs exist.
3. THE Risk_Engine SHALL classify DSR with RAG_Status: green when DSR is less than or equal to 35%, yellow when DSR is greater than 35% and less than or equal to 50%, red when DSR is greater than 50%.
4. THE Risk_Engine SHALL use `computeTotalEmi()` for total monthly EMI and `computeMonthlyIncome()` for gross monthly income, both existing Forecast_Engine functions.

### Requirement 3: Liquidity Coverage Ratio (LCR) Computation

**User Story:** As a user, I want to know how many months of expenses my liquid savings can cover, so that I can evaluate my emergency buffer against the 6-month banking benchmark.

#### Acceptance Criteria

1. THE Risk_Engine SHALL compute LCR as `userData.liquidSavings / (computeMonthlyExpenses() × 6)`.
2. THE Risk_Engine SHALL compute months of coverage as `userData.liquidSavings / (computeMonthlyExpenses() + computeTotalEmi())`.
3. WHEN `computeMonthlyExpenses()` returns zero, THE Risk_Engine SHALL set LCR to 1.0 if `userData.liquidSavings` is greater than zero, or 0 if `userData.liquidSavings` is zero.
4. THE Risk_Engine SHALL classify LCR with RAG_Status: green when LCR is greater than or equal to 1.0 (6 or more months of coverage), yellow when LCR is greater than or equal to 0.5 and less than 1.0 (3 to 6 months), red when LCR is less than 0.5 (fewer than 3 months).
5. THE Risk_Dashboard SHALL display both the LCR ratio and the months of coverage value to provide intuitive context.

### Requirement 4: Protection Adequacy Ratio Computation

**User Story:** As a user with dependents, I want to know if my term life and health insurance coverage meets recommended benchmarks, so that I can identify protection gaps before they become critical.

#### Acceptance Criteria

1. THE Risk_Engine SHALL compute term life adequacy as `computeInsuranceCoverage().termCover / (computeMonthlyIncome() × 12 × 12)`, where the benchmark is 12 times annual income.
2. THE Risk_Engine SHALL compute Health_Benchmark as `(1000000 + 200000 × dependentCount) × (1 + medicalInflation)^5`, where `dependentCount` is derived from `userData.profile.familyMembers` array length and `medicalInflation` is sourced from `getForecastAssumptions().medicalInflation` (default 10%).
3. THE Risk_Engine SHALL compute health adequacy as `computeInsuranceCoverage().healthCover / Health_Benchmark`.
4. THE Risk_Engine SHALL compute the overall Protection_Adequacy as the average of term life adequacy and health adequacy.
5. THE Risk_Engine SHALL classify Protection_Adequacy with RAG_Status: green when the ratio is greater than or equal to 0.8, yellow when the ratio is greater than or equal to 0.5 and less than 0.8, red when the ratio is less than 0.5.
6. WHEN `computeMonthlyIncome()` returns zero, THE Risk_Engine SHALL set term life adequacy to 1.0 (no income to protect).

### Requirement 5: Financial Stability Score Computation

**User Story:** As a user, I want a single composite score (0–100) that summarizes my overall financial health, so that I can quickly gauge my risk posture and track improvement over time.

#### Acceptance Criteria

1. THE Risk_Engine SHALL normalize each sub-metric to a 0–100 scale using these formulas: `nimScore = clamp(0, 100, 50 + NIM × 25)`, `dsrScore = clamp(0, 100, 100 − DSR × 2)`, `lcrScore = clamp(0, 100, LCR × 100)`, `protScore = clamp(0, 100, avgProtectionRatio × 100)`.
2. THE Risk_Engine SHALL compute the Stability_Score as a weighted sum: `DSR × 0.30 + LCR × 0.25 + NIM × 0.20 + Protection × 0.25`, using the normalized sub-scores.
3. THE Risk_Engine SHALL round the Stability_Score to the nearest integer.
4. THE Risk_Engine SHALL classify the Stability_Score with RAG_Status: green when the score is 75 to 100, yellow when the score is 50 to 74, red when the score is 0 to 49.
5. THE Risk_Engine SHALL identify the top risk as the sub-metric with the lowest normalized score.
6. THE Risk_Engine SHALL return an actionable suggestion string based on the top risk: a DSR-related suggestion when DSR is the weakest, an LCR-related suggestion when LCR is the weakest, a NIM-related suggestion when NIM is the weakest, or a protection-related suggestion when Protection_Adequacy is the weakest.
7. THE Risk_Engine SHALL implement the `clamp` function as `clamp(min, max, value) = Math.max(min, Math.min(max, value))`.
8. FOR ALL valid input combinations, computing the Stability_Score then decomposing it back into weighted sub-scores SHALL produce values that sum to the original Stability_Score (round-trip property of the weighted composition).

### Requirement 6: Risk Dashboard UI on Overview Tab

**User Story:** As a user, I want to see a Risk Dashboard card on the Overview tab that shows my Financial Stability Score prominently and lets me drill into each sub-metric, so that I can understand my financial risk at a glance.

#### Acceptance Criteria

1. THE Risk_Dashboard SHALL render as a card on the Overview tab, positioned below the existing Forecast Card, using the existing `card` CSS class.
2. THE Risk_Dashboard SHALL display the Stability_Score as a hero element using the existing `score-ring-svg` pattern with the score value centered inside the ring.
3. THE Risk_Dashboard SHALL color the score ring stroke according to the Stability_Score RAG_Status: green (`var(--green)`), yellow (`var(--yellow)`), or red (`var(--red)`).
4. THE Risk_Dashboard SHALL display the top risk label and actionable suggestion text below the score ring.
5. THE Risk_Dashboard SHALL display four sub-metric rows (NIM, DSR, LCR, Protection_Adequacy) using the existing `kpi-card` pattern, each showing: metric name, computed value, and RAG_Status color indicator.
6. WHEN a user clicks or taps on a sub-metric row, THE Risk_Dashboard SHALL expand that row to show: the formula used, the input values, and a one-line plain-language explanation suitable for a non-technical user.
7. THE Risk_Dashboard SHALL render all content using `sh()` for DOM updates and `fl()` for Indian currency formatting.
8. THE Risk_Dashboard SHALL use `$()` for element lookups, consistent with the existing codebase pattern.
9. WHEN `userData` changes (via profile switch, data edit, or assumption change), THE Risk_Dashboard SHALL re-render with updated risk metrics without any API call.
10. THE Risk_Dashboard SHALL respect the `currentProfile` selection from the Profile_Selector, computing risk metrics for the selected family member or aggregated across all members when set to "all".

### Requirement 7: Deterministic and Client-Side Constraints

**User Story:** As a user, I want all risk computations to be transparent, repeatable, and performed locally, so that I can trust the results and use the feature without internet dependency.

#### Acceptance Criteria

1. THE Risk_Engine SHALL perform all computations client-side using only data available in `userData` and existing Forecast_Engine accessor functions.
2. THE Risk_Engine SHALL produce identical output for identical input (deterministic computation with no randomness, no Monte Carlo simulation, no stochastic modeling).
3. THE Risk_Engine SHALL introduce no new API endpoints, no new database tables, and no new external library dependencies.
4. THE Risk_Engine SHALL use vanilla JavaScript only, consistent with the existing `famledgerai/index.html` single-file architecture.
5. THE Risk_Engine SHALL include inline formula comments in the source code explaining each computation step for auditability.
6. WHEN any input value is missing or undefined, THE Risk_Engine SHALL fall back to zero for that input and continue computation without throwing an error.
7. FOR ALL valid `userData` states, computing all five risk metrics and then recomputing them with the same input SHALL produce identical results (idempotence property).
