# Requirements Document

## Introduction

The Indian Health Insurance Intelligence System extends FamLedgerAI's existing insurance analysis pipeline with India-specific intelligence capabilities. The existing foundation provides AI-powered field extraction, scoring, risk detection, ML claim prediction, and recommendation generation via the hybrid pipeline orchestrator. This new system builds on top of that foundation to deliver: (1) a comprehensive database of all active Indian health insurers with CSR ratios, network hospitals, strengths, weaknesses, and product catalogs, (2) a hidden trap detection engine that identifies 9 categories of policy traps with severity classification, (3) a predictive intelligence engine that projects coverage adequacy, premium growth, and health risk over time using Indian medical inflation rates, (4) a better alternatives engine that recommends super top-ups, portability options, critical illness add-ons, and plan comparisons, (5) a full analysis report UI with 5 tabs covering summary, traps, score, predictions, and recommendations, (6) a family insurance dashboard showing all members' coverage status across policy types, (7) a side-by-side policy comparison tool, and (8) a medical inflation educator for the Education Center. The system must not break existing insurance functionality, must not change the database schema, and must not install new npm packages.

## Glossary

- **Indian_Insurer_Database**: The static TypeScript data module containing comprehensive profiles of all active Indian health insurance companies, including CSR ratios (FY2023-24), network hospital counts, strengths, weaknesses, popular products, extraction keywords, and contact information
- **Trap_Detector**: The engine that analyzes ExtractedFields and policy text to identify hidden policy traps across 9 categories, classifying each by severity (claim_killer, significant, minor)
- **Predictive_Engine**: The engine that projects coverage adequacy, premium growth, and health risk profiles over 3, 5, and 10-year horizons using Indian medical inflation rate (14%) and demographic factors
- **Alternatives_Engine**: The engine that generates actionable alternative coverage recommendations including super top-ups, portability options, critical illness riders, sum insured upgrades, and plan comparisons
- **Full_Analysis_UI**: The React component (FullInsuranceAnalysis) that renders the comprehensive 5-tab analysis report consuming data from the Trap_Detector, Predictive_Engine, Alternatives_Engine, and existing pipeline outputs
- **Family_Dashboard**: The React component (FamilyInsuranceDashboard) that displays all family members' coverage status across health, term life, accident, and critical illness policy types with a family coverage score
- **Policy_Comparison_Tool**: The React component (PolicyComparison) that renders side-by-side feature matrix comparison of current policy versus recommended alternatives
- **Medical_Inflation_Educator**: The React component added to the Education Center that teaches users about Indian medical inflation (14%), procedure cost projections, and future coverage adequacy
- **Trap_Severity**: The classification of a detected trap as claim_killer (directly causes claim rejection or major deduction), significant (materially reduces coverage value), or minor (inconvenience but limited financial impact)
- **Super_Top_Up**: A health insurance product that provides additional coverage above a deductible threshold, recommended to fill coverage gaps cost-effectively
- **Portability**: The IRDAI-regulated process allowing policyholders to switch insurers while retaining waiting period credits, subject to a 45-day application window before renewal
- **ExtractedFields**: The existing shared data structure from the insurance pipeline containing all extracted policy fields (defined in lib/insurance/types.ts)
- **PolicyScore**: The existing data structure containing total score (0-100), grade (A-F), and breakdown across seven scoring categories
- **RiskAnalysis**: The existing data structure containing detected risks, overall risk level, and risk score
- **LegalDisclaimer**: The existing React component that renders regulatory disclaimers with type variants (general, insurance, investment)
- **PostHog**: The existing analytics service used for tracking user interactions across the application

## Requirements

### Requirement 1: Universal Indian Insurer Database

**User Story:** As a user, I want the system to have comprehensive knowledge of all active Indian health insurers, so that the analysis can identify my insurer, display accurate CSR data, and provide insurer-specific context without relying on external API calls.

#### Acceptance Criteria

1. THE Indian_Insurer_Database SHALL contain profiles for at least 16 active Indian health insurers: Star Health, HDFC ERGO, Care Health, Niva Bupa, Aditya Birla Health, ManipalCigna, ICICI Lombard, Bajaj Allianz, New India Assurance, United India Insurance, Oriental Insurance, National Insurance, Tata AIG, SBI General, Acko, and Digit Insurance
2. WHEN an insurer profile is stored, THE Indian_Insurer_Database SHALL include the following fields for each insurer: company name, CSR ratio (labeled FY2023-24), network hospital count, array of strengths, array of weaknesses, array of popular product names, array of extraction keywords for matching against policy text, and contact information (website, toll-free number, email)
3. WHEN the existing InsurerDetector identifies an insurer name from a policy document, THE Indian_Insurer_Database SHALL provide a lookup function that returns the matching insurer profile using case-insensitive keyword matching
4. WHEN no insurer profile matches the detected insurer name, THE Indian_Insurer_Database SHALL return null rather than guessing a profile
5. THE Indian_Insurer_Database SHALL export a typed TypeScript interface (IndianInsurerProfile) defining the shape of each insurer record so that consuming components receive compile-time type safety

### Requirement 2: Hidden Trap Detection — Room Rent Proportionate Deduction

**User Story:** As a user, I want the system to detect room rent proportionate deduction traps in my policy, so that I understand how room rent limits can cause claim deductions beyond just the room charge.

#### Acceptance Criteria

1. WHEN ExtractedFields contain a roomRentLimit with type "percentage" or "fixed" and the value is below the single private room rate threshold (1% of sum insured or ₹5,000 daily, whichever is lower), THE Trap_Detector SHALL flag a "Room Rent Proportionate Deduction" trap with Trap_Severity claim_killer
2. WHEN the Trap_Detector flags a room rent trap, THE Trap_Detector SHALL include an explanation describing how proportionate deduction applies to all claim components (surgeon fees, medicines, diagnostics) and not just the room charge
3. WHEN the Trap_Detector flags a room rent trap, THE Trap_Detector SHALL include a financial impact estimate showing the potential deduction percentage on a sample ₹5,00,000 claim

### Requirement 3: Hidden Trap Detection — Disease-Specific Sub-Limits

**User Story:** As a user, I want the system to detect disease-specific sub-limits in my policy, so that I know which conditions have capped coverage below my sum insured.

#### Acceptance Criteria

1. WHEN ExtractedFields contain a non-empty subLimits array, THE Trap_Detector SHALL flag a "Disease-Specific Sub-Limits" trap with Trap_Severity significant
2. WHEN the Trap_Detector flags a sub-limits trap, THE Trap_Detector SHALL list each sub-limited condition and its cap amount from the ExtractedFields subLimits array
3. WHEN any sub-limit cap is below 50% of the sum insured, THE Trap_Detector SHALL escalate that specific sub-limit finding to Trap_Severity claim_killer

### Requirement 4: Hidden Trap Detection — Co-Payment Clause

**User Story:** As a user, I want the system to detect co-payment clauses in my policy, so that I understand my out-of-pocket obligation on every claim.

#### Acceptance Criteria

1. WHEN ExtractedFields contain a coPaymentPercentage greater than 0, THE Trap_Detector SHALL flag a "Co-Payment Clause" trap
2. WHEN the coPaymentPercentage is 20 or higher, THE Trap_Detector SHALL classify the trap as Trap_Severity claim_killer
3. WHEN the coPaymentPercentage is between 1 and 19, THE Trap_Detector SHALL classify the trap as Trap_Severity significant
4. WHEN the Trap_Detector flags a co-payment trap, THE Trap_Detector SHALL include a note that senior citizen co-payment (for policyholders aged 60 and above) is an IRDAI-allowed practice

### Requirement 5: Hidden Trap Detection — PED Waiting Period

**User Story:** As a user, I want the system to detect long pre-existing disease waiting periods, so that I know when my existing conditions will be covered.

#### Acceptance Criteria

1. WHEN ExtractedFields contain a preExistingDiseaseWaitingPeriod greater than 0, THE Trap_Detector SHALL flag a "PED Waiting Period" trap
2. WHEN the preExistingDiseaseWaitingPeriod exceeds 1095 days (3 years), THE Trap_Detector SHALL classify the trap as Trap_Severity claim_killer
3. WHEN the preExistingDiseaseWaitingPeriod is between 731 and 1095 days, THE Trap_Detector SHALL classify the trap as Trap_Severity significant
4. WHEN the preExistingDiseaseWaitingPeriod is 730 days or fewer, THE Trap_Detector SHALL classify the trap as Trap_Severity minor
5. WHEN the Trap_Detector flags a PED waiting trap, THE Trap_Detector SHALL include the exact waiting period in months and the date when PED coverage begins (calculated from policyStartDate)

### Requirement 6: Hidden Trap Detection — Initial Waiting Period

**User Story:** As a user, I want the system to detect initial waiting periods, so that I know when my policy coverage actually begins.

#### Acceptance Criteria

1. WHEN ExtractedFields contain an initialWaitingPeriod greater than 30 days, THE Trap_Detector SHALL flag an "Initial Waiting Period" trap
2. WHEN the initialWaitingPeriod is 90 days or more, THE Trap_Detector SHALL classify the trap as Trap_Severity claim_killer
3. WHEN the initialWaitingPeriod is between 31 and 89 days, THE Trap_Detector SHALL classify the trap as Trap_Severity significant
4. WHEN the Trap_Detector flags an initial waiting trap, THE Trap_Detector SHALL include the coverage start date (policyStartDate plus initialWaitingPeriod days)

### Requirement 7: Hidden Trap Detection — Maternity, Restore Benefit, Cumulative Bonus, and Low Sum Insured

**User Story:** As a user, I want the system to detect additional coverage traps including missing maternity coverage, missing restore benefit, cumulative bonus reset on claim, and inadequate sum insured relative to medical inflation, so that I have a complete picture of my policy's weaknesses.

#### Acceptance Criteria

1. WHEN ExtractedFields indicate the policy excludes maternity coverage (detected via exclusions array containing maternity-related terms) AND any member in memberDetails is aged between 20 and 40, THE Trap_Detector SHALL flag a "Maternity Not Covered" trap with Trap_Severity significant
2. WHEN ExtractedFields contain restorationBenefit as false AND policyType is "floater", THE Trap_Detector SHALL flag a "No Restore Benefit" trap with Trap_Severity significant
3. WHEN the policy text contains terms indicating cumulative bonus resets fully on any claim (detected via keyword matching against the policy text), THE Trap_Detector SHALL flag a "Cumulative Bonus Reset on Claim" trap with Trap_Severity minor
4. WHEN ExtractedFields contain a sumInsured below ₹5,00,000 for a policy with 1-2 members or below ₹10,00,000 for a policy with 3 or more members, THE Trap_Detector SHALL flag a "Low Sum Insured vs Medical Inflation" trap with Trap_Severity significant
5. WHEN the Trap_Detector flags a low sum insured trap, THE Trap_Detector SHALL include a projection showing the coverage gap after 5 years at 14% annual medical inflation

### Requirement 8: Trap Detection Output Structure

**User Story:** As a developer, I want the trap detection engine to produce a structured, typed output, so that UI components can render traps grouped by severity with consistent data.

#### Acceptance Criteria

1. THE Trap_Detector SHALL return a typed result containing: an array of detected traps, a total trap count, and counts grouped by Trap_Severity (claim_killer count, significant count, minor count)
2. WHEN the Trap_Detector returns a trap, THE Trap_Detector SHALL include for each trap: trap type identifier, trap name, Trap_Severity, description, financial impact explanation, and actionable recommendation
3. THE Trap_Detector SHALL accept ExtractedFields and raw policy text as inputs, matching the interface of the existing RiskDetectionEngine
4. THE Trap_Detector SHALL operate as a pure function with no external API calls or database queries

### Requirement 9: Predictive Intelligence — Coverage Adequacy Projection

**User Story:** As a user, I want to see how adequate my current coverage will be in 3, 5, and 10 years, so that I can plan for future medical cost increases.

#### Acceptance Criteria

1. WHEN ExtractedFields containing sumInsured and memberCount are provided, THE Predictive_Engine SHALL project coverage adequacy at 3-year, 5-year, and 10-year horizons using a 14% annual medical inflation rate
2. WHEN the Predictive_Engine projects adequacy, THE Predictive_Engine SHALL calculate for each horizon: the projected medical cost for the family size, the current sum insured (unchanged), the coverage gap amount, and the adequacy percentage (sum insured divided by projected cost times 100)
3. WHEN the adequacy percentage drops below 50% at any horizon, THE Predictive_Engine SHALL flag that horizon as "Critical" adequacy
4. THE Predictive_Engine SHALL return an array of projection data points (one per year up to 10 years) suitable for rendering as a line chart using recharts

### Requirement 10: Predictive Intelligence — Premium Impact Forecast

**User Story:** As a user, I want to see how my premium will grow over time and what my lifetime premium commitment looks like, so that I can budget for future insurance costs.

#### Acceptance Criteria

1. WHEN ExtractedFields containing premiumAmount are provided along with the policyholder age, THE Predictive_Engine SHALL forecast annual premium amounts for each year up to age 80
2. WHEN the Predictive_Engine forecasts premiums, THE Predictive_Engine SHALL apply age-band-based premium increase rates: 5% annual increase for ages below 35, 8% for ages 35-45, 12% for ages 45-55, 15% for ages 55-65, and 20% for ages above 65
3. WHEN the Predictive_Engine completes the forecast, THE Predictive_Engine SHALL calculate the total lifetime premium (sum of all projected annual premiums from current age to age 80)
4. THE Predictive_Engine SHALL label all premium projections as "indicative — get actual quote from insurer" in the output metadata
5. THE Predictive_Engine SHALL return an array of annual premium data points suitable for rendering as a bar or line chart using recharts

### Requirement 11: Predictive Intelligence — Health Risk Profile Assessment

**User Story:** As a user, I want the system to assess my health risk profile based on my demographics and policy details, so that I understand how my risk factors affect my insurance needs.

#### Acceptance Criteria

1. WHEN policyholder age, pre-existing disease information (from ExtractedFields), family medical history (if available from memberDetails), and city tier are provided, THE Predictive_Engine SHALL calculate a health risk score between 0 and 100
2. WHEN the Predictive_Engine calculates the health risk score, THE Predictive_Engine SHALL classify the risk level as Low (0-30), Moderate (31-55), High (56-75), or Very High (76-100)
3. WHEN the Predictive_Engine assesses risk, THE Predictive_Engine SHALL list contributing risk factors with individual impact scores (e.g., age factor, PED factor, family history factor, lifestyle factor)
4. THE Predictive_Engine SHALL operate as a deterministic calculation with no external API calls

### Requirement 12: Predictive Intelligence — Optimization Plan Generation

**User Story:** As a user, I want the system to generate an actionable optimization plan based on detected traps, coverage gaps, and risk profile, so that I have clear steps to improve my insurance coverage.

#### Acceptance Criteria

1. WHEN trap detection results, coverage gap analysis, and health risk profile are provided, THE Predictive_Engine SHALL generate an ordered list of optimization steps prioritized by impact
2. WHEN the Predictive_Engine generates an optimization step, THE Predictive_Engine SHALL include: step title, description, priority (fix_immediately, at_renewal, long_term), estimated cost impact, and expected benefit
3. THE Predictive_Engine SHALL generate between 3 and 8 optimization steps per analysis
4. WHEN the optimization plan includes portability advice, THE Predictive_Engine SHALL include the 45-day IRDAI portability rule in the step description

### Requirement 13: Better Alternatives — Super Top-Up Recommendations

**User Story:** As a user, I want the system to recommend specific super top-up plans to fill my coverage gap, so that I can increase my coverage cost-effectively.

#### Acceptance Criteria

1. WHEN the coverage gap analysis indicates a gap amount greater than zero, THE Alternatives_Engine SHALL recommend up to 3 super top-up plans from the Indian_Insurer_Database with indicative premium ranges
2. WHEN the Alternatives_Engine recommends a super top-up, THE Alternatives_Engine SHALL include: insurer name, product name, deductible amount (matching current sum insured), top-up sum insured, indicative annual premium range, and key features
3. THE Alternatives_Engine SHALL label all premium figures as "indicative — get actual quote from insurer"
4. WHEN the Alternatives_Engine generates super top-up recommendations, THE Alternatives_Engine SHALL include a LegalDisclaimer of type "insurance" alongside the recommendations

### Requirement 14: Better Alternatives — Portability Recommendations

**User Story:** As a user, I want the system to recommend better policies I can port to while retaining my waiting period credits, so that I can switch insurers without losing accumulated benefits.

#### Acceptance Criteria

1. WHEN the PolicyScore grade is C, D, or F, THE Alternatives_Engine SHALL recommend up to 3 alternative policies from higher-rated insurers in the Indian_Insurer_Database
2. WHEN the Alternatives_Engine recommends a portability option, THE Alternatives_Engine SHALL include: target insurer name, recommended product name, expected benefits over current policy, and indicative premium range
3. WHEN the Alternatives_Engine generates portability recommendations, THE Alternatives_Engine SHALL include the 45-day IRDAI portability rule: the policyholder must apply to the new insurer at least 45 days before the current policy renewal date
4. THE Alternatives_Engine SHALL label all premium figures as "indicative — get actual quote from insurer"

### Requirement 15: Better Alternatives — Critical Illness and SI Upgrade Recommendations

**User Story:** As a user, I want the system to recommend critical illness standalone plans and sum insured upgrades, so that I can address specific coverage gaps.

#### Acceptance Criteria

1. WHEN the health risk profile score exceeds 55 (High or Very High risk), THE Alternatives_Engine SHALL recommend a standalone critical illness plan with indicative coverage amounts and premium ranges
2. WHEN the sum insured is below the recommended coverage for the family size, THE Alternatives_Engine SHALL recommend a sum insured upgrade within the same insurer with the estimated premium difference
3. THE Alternatives_Engine SHALL label all premium and coverage figures as "indicative — get actual quote from insurer"

### Requirement 16: Better Alternatives — Plan Comparison Matrix

**User Story:** As a user, I want to see a detailed feature comparison of my current policy against the top 3 recommended alternatives, so that I can make an informed switching decision.

#### Acceptance Criteria

1. WHEN the Alternatives_Engine generates portability or alternative plan recommendations, THE Alternatives_Engine SHALL produce a comparison matrix containing: sum insured, annual premium, room rent limit type, restore benefit (yes/no), co-payment percentage, CSR ratio, network hospital count, and PED waiting period for each plan
2. THE Alternatives_Engine SHALL include the current policy as the first column in the comparison matrix
3. THE Alternatives_Engine SHALL highlight cells where an alternative plan is superior to the current policy

### Requirement 17: Full Insurance Analysis Report UI — Policy Summary Tab

**User Story:** As a user, I want to see a clear summary of my extracted policy details alongside my insurer's profile, so that I can verify the analysis accuracy and understand my insurer's reputation.

#### Acceptance Criteria

1. WHEN the Full_Analysis_UI renders the Policy Summary tab, THE Full_Analysis_UI SHALL display all key ExtractedFields: insurer name, plan name, policy number, sum insured, premium amount, premium frequency, policy start and end dates, member count, member details, and policy type
2. WHEN the insurer is found in the Indian_Insurer_Database, THE Full_Analysis_UI SHALL display an insurer card showing: company name, CSR ratio (labeled FY2023-24), network hospital count, top 3 strengths, and top 3 weaknesses
3. WHEN the Full_Analysis_UI renders member details, THE Full_Analysis_UI SHALL display each member's name, age, and relation in a visual timeline or card layout
4. THE Full_Analysis_UI SHALL use the existing dark theme colors (#0D1120 background, #FF9933 orange accent, #5BE6C4 green, #E85D75 red)

### Requirement 18: Full Insurance Analysis Report UI — Hidden Traps Tab

**User Story:** As a user, I want to see all detected hidden traps grouped by severity, so that I can quickly identify the most dangerous clauses in my policy.

#### Acceptance Criteria

1. WHEN the Full_Analysis_UI renders the Hidden Traps tab, THE Full_Analysis_UI SHALL group detected traps into three severity sections: Claim Killers (claim_killer), Significant Issues (significant), and Minor Issues (minor)
2. WHEN the Full_Analysis_UI renders a trap card, THE Full_Analysis_UI SHALL display: trap name, severity badge (color-coded: #E85D75 red for claim_killer, #FF9933 orange for significant, #5BE6C4 green for minor), description, financial impact, and recommendation
3. WHEN no traps are detected, THE Full_Analysis_UI SHALL display a positive message indicating the policy has no detected hidden traps
4. THE Full_Analysis_UI SHALL display the total trap count and breakdown by severity at the top of the tab

### Requirement 19: Full Insurance Analysis Report UI — Policy Score Tab

**User Story:** As a user, I want to see my policy's overall score with a visual breakdown by category, so that I understand the quality of my coverage at a glance.

#### Acceptance Criteria

1. WHEN the Full_Analysis_UI renders the Policy Score tab, THE Full_Analysis_UI SHALL display the total PolicyScore (0-100) in a circular ring/gauge visualization with the letter grade (A-F) in the center
2. WHEN the Full_Analysis_UI renders the score breakdown, THE Full_Analysis_UI SHALL display each of the seven scoring categories (coverage strength, claim friendliness, absence of hidden clauses, network hospital coverage, premium fairness, restoration benefits, waiting period fairness) as individual progress bars with scores
3. WHEN the Full_Analysis_UI renders the score tab, THE Full_Analysis_UI SHALL list the top 3 strengths and top 3 weaknesses/gaps identified from the scoring breakdown
4. THE Full_Analysis_UI SHALL color-code the score ring: #5BE6C4 green for scores 70-100, #FF9933 orange for scores 40-69, #E85D75 red for scores 0-39

### Requirement 20: Full Insurance Analysis Report UI — Future Predictions Tab

**User Story:** As a user, I want to see visual projections of my coverage adequacy and premium growth over time, so that I can plan my insurance strategy for the future.

#### Acceptance Criteria

1. WHEN the Full_Analysis_UI renders the Future Predictions tab, THE Full_Analysis_UI SHALL display a line chart (using recharts) showing coverage adequacy percentage over 10 years with a horizontal reference line at 100% adequacy
2. WHEN the Full_Analysis_UI renders the Future Predictions tab, THE Full_Analysis_UI SHALL display a bar or line chart (using recharts) showing projected annual premium amounts up to age 80
3. WHEN the Full_Analysis_UI renders the Future Predictions tab, THE Full_Analysis_UI SHALL display the health risk profile as a score card with risk level classification and contributing factors
4. WHEN the Full_Analysis_UI renders premium projections, THE Full_Analysis_UI SHALL display the total lifetime premium figure prominently with the label "indicative — get actual quote from insurer"
5. THE Full_Analysis_UI SHALL display a LegalDisclaimer of type "insurance" at the bottom of the predictions tab

### Requirement 21: Full Insurance Analysis Report UI — Recommendations Tab

**User Story:** As a user, I want to see prioritized recommendations with actionable steps, so that I know exactly what to do to improve my insurance coverage.

#### Acceptance Criteria

1. WHEN the Full_Analysis_UI renders the Recommendations tab, THE Full_Analysis_UI SHALL group recommendations into sections: "Fix Immediately" (fix_immediately priority), "At Next Renewal" (at_renewal priority), and "Long-Term Planning" (long_term priority)
2. WHEN the Full_Analysis_UI renders the Recommendations tab and super top-up recommendations exist, THE Full_Analysis_UI SHALL display a super top-up calculator section showing recommended plans with indicative premiums
3. WHEN the Full_Analysis_UI renders the Recommendations tab and plan comparison data exists, THE Full_Analysis_UI SHALL display the comparison matrix from the Alternatives_Engine
4. WHEN the Full_Analysis_UI renders any recommendation involving premium or coverage amounts, THE Full_Analysis_UI SHALL label those figures as "indicative — get actual quote from insurer"
5. THE Full_Analysis_UI SHALL display a LegalDisclaimer of type "insurance" at the bottom of the recommendations tab

### Requirement 22: Family Insurance Dashboard

**User Story:** As a user, I want to see a dashboard showing all family members' insurance coverage status across policy types, so that I can identify which family members have coverage gaps.

#### Acceptance Criteria

1. WHEN the Family_Dashboard renders, THE Family_Dashboard SHALL display each family member as a card showing their name, age, relation, and coverage status for four policy types: health insurance, term life insurance, accident insurance, and critical illness insurance
2. WHEN a family member has active coverage for a policy type, THE Family_Dashboard SHALL display a green (#5BE6C4) indicator with the policy name and sum insured
3. WHEN a family member lacks coverage for a policy type, THE Family_Dashboard SHALL display a red (#E85D75) indicator with a "Not Covered" label
4. WHEN the Family_Dashboard renders, THE Family_Dashboard SHALL calculate and display a family coverage score (0-100) based on the percentage of coverage slots filled across all members and policy types
5. WHEN the Family_Dashboard renders, THE Family_Dashboard SHALL highlight the top 3 biggest coverage gaps across the family with recommended actions
6. THE Family_Dashboard SHALL read family member data from the existing family data hooks (useFamily) without requiring database schema changes

### Requirement 23: Policy Comparison Tool

**User Story:** As a user, I want to compare my current policy side-by-side with recommended alternatives in a feature matrix, so that I can evaluate which plan offers the best value.

#### Acceptance Criteria

1. WHEN the Policy_Comparison_Tool renders with a current policy and at least one alternative, THE Policy_Comparison_Tool SHALL display a side-by-side feature matrix with columns for each policy and rows for: sum insured, annual premium, room rent limit, restore benefit, co-payment percentage, CSR ratio (FY2023-24), network hospital count, and PED waiting period
2. WHEN a feature value in an alternative policy is superior to the current policy, THE Policy_Comparison_Tool SHALL highlight that cell with a green (#5BE6C4) background
3. WHEN a feature value in an alternative policy is inferior to the current policy, THE Policy_Comparison_Tool SHALL highlight that cell with a red (#E85D75) background
4. THE Policy_Comparison_Tool SHALL display a LegalDisclaimer of type "insurance" below the comparison matrix
5. THE Policy_Comparison_Tool SHALL label all premium figures as "indicative — get actual quote from insurer"

### Requirement 24: Medical Inflation Educator

**User Story:** As a user, I want to learn about Indian medical inflation and how it affects my insurance coverage over time, so that I can make informed decisions about my sum insured.

#### Acceptance Criteria

1. THE Medical_Inflation_Educator SHALL display the current Indian medical inflation rate (14% per annum) with a source citation
2. WHEN the Medical_Inflation_Educator renders, THE Medical_Inflation_Educator SHALL display a table of common medical procedures (heart bypass surgery, knee replacement, cancer treatment, normal delivery, C-section delivery, angioplasty) with current average costs and projected costs at 5-year and 10-year horizons at 14% inflation
3. WHEN the Medical_Inflation_Educator renders, THE Medical_Inflation_Educator SHALL display an interactive projection showing how a user-selected sum insured amount erodes in purchasing power over 10 years at 14% inflation
4. THE Medical_Inflation_Educator SHALL integrate into the existing Education Center component structure alongside existing education tabs (BasicsTab, ClaimsGuideTab, GlossaryTab, etc.)
5. THE Medical_Inflation_Educator SHALL use the existing dark theme colors and match the visual style of other education tabs

### Requirement 25: Analytics Tracking

**User Story:** As a product owner, I want all key user interactions with the insurance intelligence features tracked via PostHog, so that I can measure feature adoption and identify improvement areas.

#### Acceptance Criteria

1. WHEN a user views any tab in the Full_Analysis_UI, THE Full_Analysis_UI SHALL send a PostHog event with the tab name and policy identifier
2. WHEN a user interacts with the Policy_Comparison_Tool, THE Policy_Comparison_Tool SHALL send a PostHog event with the comparison action and number of policies compared
3. WHEN a user views the Family_Dashboard, THE Family_Dashboard SHALL send a PostHog event with the family member count and coverage score
4. WHEN a user views the Medical_Inflation_Educator, THE Medical_Inflation_Educator SHALL send a PostHog event with the section viewed
5. WHEN a user clicks on a recommendation in the Recommendations tab, THE Full_Analysis_UI SHALL send a PostHog event with the recommendation type and priority level

### Requirement 26: Non-Functional Constraints

**User Story:** As a developer, I want the insurance intelligence system to respect existing system boundaries, so that the new features integrate cleanly without breaking existing functionality.

#### Acceptance Criteria

1. THE insurance intelligence system SHALL NOT modify the existing Supabase database schema
2. THE insurance intelligence system SHALL NOT require installation of new npm packages beyond those already in the project
3. THE insurance intelligence system SHALL NOT modify existing insurance pipeline files (lib/insurance/types.ts, lib/insurance/risk-detection-engine.ts, lib/insurance/scoring-engine.ts, lib/insurance/coverage-gap-analyzer.ts, lib/insurance/report-generator.ts) except to import from new modules
4. THE insurance intelligence system SHALL consume ExtractedFields, PolicyScore, RiskAnalysis, ClaimProbability, and CoverageGapAnalysis from the existing types without modifying those interfaces
5. WHEN the Trap_Detector, Predictive_Engine, or Alternatives_Engine encounters missing or null input fields, THE respective engine SHALL handle the missing data gracefully by skipping the affected analysis and noting the omission in the output rather than throwing an error
6. THE Full_Analysis_UI, Family_Dashboard, Policy_Comparison_Tool, and Medical_Inflation_Educator SHALL render correctly on the existing dark theme (#0D1120 background, #FF9933 orange accent, #5BE6C4 green, #E85D75 red)
