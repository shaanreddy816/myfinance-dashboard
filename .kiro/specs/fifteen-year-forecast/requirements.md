# Requirements Document

## Introduction

FamLedgerAI's "15-Year Forecast + Suggestions" feature provides deterministic, formula-driven financial projections embedded within existing tabs (Overview, Loans, Insurance, Settings). The feature projects net worth, savings trajectory, goal gap analysis, loan freedom date, and insurance adequacy over a 15-year horizon using configurable assumptions. All computation is client-side using data already present in `userData`. No new API endpoints are introduced. The target user is a 35-year-old salaried professional who needs transparent, explainable projections — no black-box AI or probabilistic simulations.

## Glossary

- **Forecast_Engine**: The client-side JavaScript module that computes all 15-year projections using deterministic formulas
- **Forecast_Card**: A new UI card on the Overview tab that houses the net worth chart, savings trajectory, and goal gap analysis as togglable sections
- **Assumptions_Panel**: The editable panel (in Settings tab and accessible via ⚙️ button on Forecast_Card) where users configure forecast parameters
- **Net_Worth**: Total investments + liquid savings − total loan outstanding at a given point in time
- **Weighted_Return_Rate**: The blended annual return computed as (equity return % × equity allocation fraction) + (debt return % × debt allocation fraction), derived from the user's current investment mix
- **PMT_Formula**: The standard Present Value of Annuity formula used to calculate the monthly SIP needed to close a goal gap: `PMT = FV × r / ((1+r)^n − 1)` where r = monthly rate, n = months remaining
- **Goal_Gap**: The difference between a goal's inflation-adjusted target amount and the projected corpus at the goal's target year
- **Debt_Free_Date**: The calendar month and year when all active loans reach zero outstanding balance
- **Amortization_Schedule**: The month-by-month breakdown of principal and interest payments for a loan, computed from remaining principal, EMI, and interest rate
- **Medical_Inflation_Rate**: The annual rate at which healthcare costs increase (default 10%), used for health insurance adequacy projections
- **FamLedgerAI**: The family finance management application (single-file vanilla JS app in `index.html`)
- **Forecast_Assumptions**: The object stored at `userData.profile.forecastAssumptions` containing all configurable rates: `{equityReturn, debtReturn, incomeGrowth, expenseInflation, medicalInflation}`

## Requirements

### Requirement 1: Net Worth Projection Chart

**User Story:** As a user, I want to see a year-by-year line chart of my projected net worth for the next 15 years on the Overview tab, so that I can visualize my long-term financial trajectory.

#### Acceptance Criteria

1. THE Forecast_Card SHALL render a line chart displaying projected Net_Worth for Year 0 (current) through Year 15 on the Overview tab, positioned below the existing KPI cards.
2. THE Forecast_Engine SHALL compute Net_Worth for each year as: total investments + liquid savings − total loan outstanding, where investments are compounded annually at the Weighted_Return_Rate.
3. THE Forecast_Engine SHALL compute the Weighted_Return_Rate as `(equityReturn × equityAllocation) + (debtReturn × debtAllocation)`, where equity and debt allocations are derived from the user's current investment mix in `userData.investments.byMember`.
4. THE Forecast_Engine SHALL amortize each active loan using its existing EMI, interest rate, and remaining tenure, reducing outstanding balance each year and setting it to zero when the loan is fully paid off.
5. WHEN a user hovers or taps on any year data point in the chart, THE Forecast_Card SHALL display a tooltip showing: "Investments: ₹X, Loans: ₹Y, Net: ₹Z" for that year.
6. THE Forecast_Card SHALL display a formula tooltip (accessible via an ℹ️ icon) explaining the Net_Worth calculation: "Net Worth = Investments × (1 + weighted return)^year + Liquid Savings − Loan Outstanding after amortization".
7. THE Forecast_Engine SHALL source all input data exclusively from `userData` (investments via `getInvestmentsForMember`, loans via `getLoansForMember`, liquid savings from `userData.liquidSavings`).
8. THE Forecast_Engine SHALL use default assumption values (equity return: 12%, debt return: 7%) when `userData.profile.forecastAssumptions` does not exist.

### Requirement 2: Savings Trajectory with Income Growth

**User Story:** As a salaried user, I want the forecast to account for my annual salary increment and expense inflation, so that I can see a realistic savings trajectory over 15 years.

#### Acceptance Criteria

1. THE Forecast_Card SHALL provide a toggle or tab within the forecast card to switch between the Net Worth chart and the Savings Trajectory view.
2. THE Forecast_Engine SHALL project annual income for each year by applying the income growth rate (default 8%) compounded annually from the current monthly income (`computeMonthlyIncome() × 12`).
3. THE Forecast_Engine SHALL project annual expenses for each year by applying the expense inflation rate (default 6% CPI) compounded annually from the current monthly expenses (`computeMonthlyExpenses() × 12`).
4. THE Forecast_Engine SHALL compute projected monthly savings for each year as: `(projected annual income − projected annual expenses − projected annual EMIs) / 12`.
5. THE Forecast_Engine SHALL add each year's projected annual savings to the investment corpus, compounding at the Weighted_Return_Rate in subsequent years.
6. WHEN a user expands a year row in the Savings Trajectory view, THE Forecast_Card SHALL display a breakdown showing: projected income, projected expenses, projected EMIs, net savings, and cumulative corpus for that year.
7. WHEN a user changes any forecast assumption, THE Forecast_Engine SHALL recalculate the entire savings trajectory client-side and re-render the view without any API call.

### Requirement 3: Goal Gap Analysis

**User Story:** As a user with financial goals, I want to see whether my projected trajectory meets each goal's target amount by the target year, so that I can take corrective action early.

#### Acceptance Criteria

1. THE Forecast_Engine SHALL read goals from `userData.profile.goals` and map each goal label to a default target amount and target year based on the user's age and income (e.g., "retirement" → age 60, "child-education" → 18 years from now, "house" → 5 years, "emergency" → 1 year).
2. THE Forecast_Engine SHALL compute the Goal_Gap for each goal as: `target amount inflated at expense inflation rate (6%) to the target year − projected corpus at the target year`.
3. THE Forecast_Card SHALL display a Goal Gap Analysis section showing for each goal: goal name, target amount (inflation-adjusted), target year, projected corpus at target year, and gap or surplus amount.
4. THE Forecast_Card SHALL color-code each goal: green when projected corpus meets or exceeds the target, yellow when the gap is within 20% of the target, and red when the gap exceeds 20% of the target.
5. WHEN a goal has a gap, THE Forecast_Card SHALL display "You need ₹X/month extra SIP to close this gap" computed using the PMT_Formula with the Weighted_Return_Rate and months remaining until the target year.
6. THE Forecast_Card SHALL display a maximum of 5 goals, sorted by gap size (largest gap first).

### Requirement 4: Loan Freedom Date

**User Story:** As a user with active loans, I want to see when I will be completely debt-free and how prepayment changes that date, so that I can plan my debt payoff strategy.

#### Acceptance Criteria

1. THE FamLedgerAI SHALL render a new "Loan Freedom" card at the top of the Loans tab.
2. THE Forecast_Engine SHALL calculate the payoff date for each active loan using its remaining principal (`loan.outstanding`), EMI (`loan.emi`), and interest rate (`loan.rate`), producing the month and year when outstanding reaches zero.
3. THE Forecast_Engine SHALL determine the overall Debt_Free_Date as the latest payoff date among all active loans for the current profile (respecting `currentProfile` selection).
4. THE Loan Freedom card SHALL display a headline: "Debt-free by: [Month Year]".
5. THE Loan Freedom card SHALL provide a slider labeled "What if I pay ₹X extra/month?" with a range of ₹1,000 to ₹50,000 in ₹1,000 increments.
6. WHEN the user adjusts the prepayment slider, THE Forecast_Engine SHALL recalculate the Debt_Free_Date and total interest saved in real-time, displaying both the new debt-free date and "You save ₹Y in interest" below the slider.
7. THE Loan Freedom card SHALL display the formula for months saved: `months saved = original tenure − new tenure` with a tooltip explaining the amortization calculation.
8. THE Forecast_Engine SHALL use per-member loan data from `getLoansForMember(currentProfile)` to respect the currently selected family member.

### Requirement 5: Insurance Adequacy Forecast

**User Story:** As a user, I want to see if my term life and health insurance cover will be adequate at 5, 10, and 15 years from now, so that I can plan coverage increases before gaps become critical.

#### Acceptance Criteria

1. THE FamLedgerAI SHALL render a new "Insurance Adequacy Forecast" card at the top of the Insurance tab.
2. THE Forecast_Engine SHALL compute recommended term cover at years 5, 10, and 15 as: `current annual income × 12 (multiplier) × (1 + income growth rate)^year`.
3. THE Forecast_Engine SHALL compute recommended health cover at years 5, 10, and 15 as: `(₹10,00,000 base + ₹2,00,000 per dependent) × (1 + Medical_Inflation_Rate)^year`, where dependent count is derived from `userData.profile.familyMembers`.
4. THE Insurance Adequacy card SHALL display a table with columns: Year | Recommended Cover | Current Cover | Gap, with separate sections for Term Life and Health insurance.
5. THE Insurance Adequacy card SHALL use the current term cover from `computeInsuranceCoverage().termCover` and current health cover from `computeInsuranceCoverage().healthCover` as the "Current Cover" values (static, not projected to grow).
6. THE Insurance Adequacy card SHALL color-code each row: green when current cover meets or exceeds recommended, red when current cover falls short.
7. THE Insurance Adequacy card SHALL display a tooltip on the health section explaining: "Medical inflation assumed at 10% p.a. — healthcare costs double roughly every 7 years."

### Requirement 6: Forecast Assumptions Panel

**User Story:** As a user, I want to view and edit all forecast assumptions in one place, so that I can customize projections to match my expectations.

#### Acceptance Criteria

1. THE FamLedgerAI SHALL render a "Forecast Assumptions" section in the Settings tab containing editable fields for: equity return % (default 12), debt return % (default 7), income growth % (default 8), expense inflation % (default 6), and medical inflation % (default 10).
2. THE Forecast_Card SHALL display a "⚙️ Assumptions" button that opens the Assumptions_Panel inline or navigates to the Settings tab section.
3. THE Assumptions_Panel SHALL display a one-line explainer below each field (e.g., "Long-term equity index return after expense ratio" for equity return).
4. THE Assumptions_Panel SHALL provide a "Reset to defaults" button that restores all assumption values to their defaults (12, 7, 8, 6, 10).
5. WHEN a user edits any assumption value, THE FamLedgerAI SHALL save the updated values to `userData.profile.forecastAssumptions` via `debounceSave()`.
6. WHEN a user edits any assumption value, THE FamLedgerAI SHALL trigger a re-render of all forecast views (Net Worth chart, Savings Trajectory, Goal Gap Analysis, Loan Freedom, Insurance Adequacy) with the updated assumptions.
7. THE Assumptions_Panel SHALL perform all computation client-side with no new API endpoints.
