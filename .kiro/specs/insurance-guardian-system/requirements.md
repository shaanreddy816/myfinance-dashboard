# Requirements Document

## Introduction

The Insurance Guardian System extends FamLedgerAI's existing insurance analysis pipeline and the Insurance Intelligence System with three protective sub-systems that cover the full insurance lifecycle: before buying, after buying, and at the hospital. Sub-System 1 (Agent Mis-Selling Detector) detects 7 patterns of insurance mis-selling and alerts users before they view regular policy analysis. Sub-System 2 (Claim Guidance System) provides personalized hospitalization guidance, a 5-screen "I'm Going to Hospital" flow, a claim filing assistant for reimbursement claims, and a claim rejection fighter with escalation paths and template appeal letters. Sub-System 3 (Buying Guidance) offers a 4-step guided buying flow with needs assessment and recommendations, an agent accountability score tracked on-device, and a mis-selling education sub-tab in the Education Center. The system builds on top of the existing AI Insurance Policy Analyzer (ExtractedFields, PolicyScore, RiskAnalysis, pipeline orchestrator) and the Insurance Intelligence System (Indian_Insurer_Database, Trap_Detector, Predictive_Engine, Alternatives_Engine). The system must not break existing insurance functionality, must not change the database schema, must not install new npm packages, and must match the existing dark theme.

## Glossary

- **MisSell_Detector**: The engine (lib/insurance/misSellDetector.ts) that analyzes ExtractedFields and policy text to detect 7 patterns of insurance agent mis-selling, returning structured MisSellFlag results with confidence levels and actionable remediation steps
- **MisSellFlag**: The data structure representing a single detected mis-selling pattern, containing: pattern identifier, confidence level (confirmed, likely, possible), agent claim text, reality text, financial damage estimate, user rights description, and actionable steps array
- **MisSell_Alert**: The React component (components/insurance/MisSellAlert.tsx) that renders a red banner above regular policy analysis showing all detected mis-selling flags with agent claim vs reality comparison, financial damage, rights, and action steps
- **Claim_Guide**: The engine (lib/insurance/claimGuide.ts) that generates personalized hospitalization guidance based on policy terms, hospital type, admission type, and condition vs PED status
- **Hospital_Flow**: The 5-screen guided "I'm Going to Hospital" React component flow: Select Policy → Planned/Emergency → Hospital Name (network check) → Condition (PED check) → Personalized Checklist
- **Claim_Filing_Assistant**: The React component (components/insurance/ClaimFilingAssistant.tsx) that guides users through reimbursement claim filing: eligibility check → document checklist → claim amount calculator → submission guide → tracking reminder
- **Claim_Rejection_Fighter**: The engine (lib/insurance/claimRejectionFighter.ts) that analyzes claim rejection reasons, determines validity, provides grounds to fight, escalation paths, and generates template appeal letters via Claude API
- **Buying_Guide**: The React component (components/insurance/BuyingGuide.tsx) providing a 4-step guided buying flow: Needs Assessment → Recommended Profile → Top 3 Recommendations → Questions to Ask the Agent
- **Agent_Accountability_Score**: The on-device (localStorage) tracking system that records how policies were bought and whether agents explained key terms, displaying anonymized social proof statistics
- **MisSelling_Educator**: The Education Center sub-tab component providing mis-selling awareness content including common agent lies, illustrative claim rejection stories, IRDAI rights, and downloadable claim checklists
- **RECOMMENDED_SI**: The static lookup table of recommended minimum sum insured amounts indexed by city tier (Tier 1, Tier 2, Tier 3) and age bracket, used by the MisSell_Detector to flag insufficient coverage
- **INDIAN_HEALTH_INSURERS**: The existing Indian_Insurer_Database from the Insurance Intelligence System containing insurer profiles, CSR ratios, and product catalogs
- **Escalation_Path**: The structured sequence of complaint escalation steps: insurer internal grievance cell → IRDAI IGMS portal → Insurance Ombudsman → Consumer court
- **ExtractedFields**: The existing shared data structure from the insurance pipeline containing all extracted policy fields (defined in lib/insurance/types.ts)
- **PolicyScore**: The existing data structure containing total score (0-100), grade (A-F), and breakdown across seven scoring categories
- **LegalDisclaimer**: The existing React component that renders regulatory disclaimers with type variants (general, insurance, investment)
- **PostHog**: The existing analytics service used for tracking user interactions across the application
- **Claude_API**: The existing @anthropic-ai/sdk integration used for LLM-powered features in the application

## Requirements

### Requirement 1: Mis-Selling Detection — ULIP/Endowment Sold as Health+Investment

**User Story:** As a policyholder, I want the system to detect when a ULIP or endowment plan was sold to me as a combined health and investment product, so that I understand the lost opportunity cost compared to a separate mutual fund and health insurance combination.

#### Acceptance Criteria

1. WHEN ExtractedFields indicate the policy type is "ULIP" or "endowment" or the policy text contains ULIP/endowment keywords, THE MisSell_Detector SHALL flag a "ULIP/Endowment Mis-Sold as Health+Investment" MisSellFlag
2. WHEN the MisSell_Detector flags a ULIP/endowment mis-sell, THE MisSell_Detector SHALL calculate the lost opportunity cost by comparing the policy's projected returns against a benchmark mutual fund return rate (12% CAGR) over the same tenure, using the premium amount from ExtractedFields
3. WHEN the MisSell_Detector flags a ULIP/endowment mis-sell, THE MisSell_Detector SHALL set the agentClaim field to describe the typical sales pitch (e.g., "This plan covers health AND gives investment returns") and the reality field to describe the actual product limitations
4. WHEN the MisSell_Detector flags a ULIP/endowment mis-sell, THE MisSell_Detector SHALL include in the actionable steps: review the free-look period option, compare with term insurance plus mutual fund combination, and file IRDAI complaint if within free-look period

### Requirement 2: Mis-Selling Detection — Insufficient Sum Insured

**User Story:** As a policyholder, I want the system to detect when my sum insured is below the recommended amount for my city tier and age, so that I know if my agent sold me inadequate coverage.

#### Acceptance Criteria

1. WHEN ExtractedFields contain sumInsured and the policyholder city tier and age are available, THE MisSell_Detector SHALL compare the sumInsured against the RECOMMENDED_SI lookup table
2. WHEN the sumInsured is below the RECOMMENDED_SI value for the policyholder's city tier and age bracket, THE MisSell_Detector SHALL flag an "Insufficient Sum Insured" MisSellFlag with confidence "confirmed"
3. WHEN the MisSell_Detector flags an insufficient sum insured, THE MisSell_Detector SHALL include the financialDamage field showing the coverage gap amount (RECOMMENDED_SI minus current sumInsured) and the projected gap after 5 years at 14% medical inflation
4. THE RECOMMENDED_SI lookup table SHALL define minimum recommended amounts for three city tiers (Tier 1: metro cities, Tier 2: mid-size cities, Tier 3: smaller cities) and four age brackets (18-35, 36-45, 46-55, 56+)

### Requirement 3: Mis-Selling Detection — Group/Employer Insurance as Only Cover

**User Story:** As a policyholder, I want the system to detect when I rely solely on group or employer-provided insurance, so that I understand the 4 fatal flaws of group-only coverage.

#### Acceptance Criteria

1. WHEN ExtractedFields indicate the policy type is "group" or "employer" or the policy text contains group/employer insurance keywords AND no individual health policy is detected for the same user, THE MisSell_Detector SHALL flag a "Group/Employer Insurance as Only Cover" MisSellFlag with confidence "confirmed"
2. WHEN the MisSell_Detector flags group-only coverage, THE MisSell_Detector SHALL describe the 4 fatal flaws in the reality field: coverage ends on job change or termination, sum insured is typically inadequate for family, no portability to individual plan, and no cumulative bonus accrual
3. WHEN the MisSell_Detector flags group-only coverage, THE MisSell_Detector SHALL include in the actionable steps: buy individual health insurance immediately, treat group cover as supplementary only, and consider super top-up over group base

### Requirement 4: Mis-Selling Detection — Hidden Room Rent Capping

**User Story:** As a policyholder, I want the system to detect when room rent capping was hidden or not explained by the agent, so that I understand the proportionate deduction risk on my claims.

#### Acceptance Criteria

1. WHEN ExtractedFields contain a roomRentLimit with type "percentage" or "fixed" that restricts room selection, THE MisSell_Detector SHALL flag a "Room Rent Capping Hidden" MisSellFlag
2. WHEN the room rent limit is below 1% of sum insured per day, THE MisSell_Detector SHALL set the confidence to "confirmed"; otherwise THE MisSell_Detector SHALL set the confidence to "likely"
3. WHEN the MisSell_Detector flags room rent capping, THE MisSell_Detector SHALL include in the financialDamage field a proportionate deduction example showing how a ₹5,00,000 claim could be reduced by 30-50% due to room rent proportionate deduction
4. WHEN the MisSell_Detector flags room rent capping, THE MisSell_Detector SHALL include in the reality field an explanation that proportionate deduction applies to ALL claim components (surgeon fees, medicines, diagnostics) and not just the room charge

### Requirement 5: Mis-Selling Detection — Hidden Co-Payment for Non-Seniors

**User Story:** As a policyholder under age 60, I want the system to detect when a co-payment clause was hidden or not explained, so that I understand my out-of-pocket obligation on every claim.

#### Acceptance Criteria

1. WHEN ExtractedFields contain a coPaymentPercentage greater than 0 AND the policyholder age is below 60, THE MisSell_Detector SHALL flag a "Co-Payment Hidden/Not Explained" MisSellFlag
2. WHEN the coPaymentPercentage is 20 or higher for a non-senior policyholder, THE MisSell_Detector SHALL set the confidence to "confirmed"
3. WHEN the coPaymentPercentage is between 1 and 19 for a non-senior policyholder, THE MisSell_Detector SHALL set the confidence to "likely"
4. WHEN the policyholder age is 60 or above AND a co-payment exists, THE MisSell_Detector SHALL NOT flag a mis-sell but SHALL include a note that senior citizen co-payment is an IRDAI-allowed practice
5. WHEN the MisSell_Detector flags a co-payment mis-sell, THE MisSell_Detector SHALL include in the financialDamage field the out-of-pocket amount on a sample ₹5,00,000 claim

### Requirement 6: Mis-Selling Detection — Low CSR Insurer

**User Story:** As a policyholder, I want the system to detect when my policy is from an insurer with a low Claim Settlement Ratio, so that I understand the risk of claim rejection.

#### Acceptance Criteria

1. WHEN the insurer identified from ExtractedFields has a CSR ratio below 90% in the INDIAN_HEALTH_INSURERS database, THE MisSell_Detector SHALL flag a "Low CSR Insurer Pushed" MisSellFlag with confidence "likely"
2. WHEN the CSR ratio is below 80%, THE MisSell_Detector SHALL escalate the confidence to "confirmed"
3. WHEN the MisSell_Detector flags a low CSR insurer, THE MisSell_Detector SHALL include in the reality field the insurer's actual CSR ratio (labeled FY2023-24) and a comparison against the industry average
4. WHEN the MisSell_Detector flags a low CSR insurer, THE MisSell_Detector SHALL include in the actionable steps: consider portability to a higher-CSR insurer at renewal (with 45-day IRDAI portability rule)

### Requirement 7: Mis-Selling Detection — Critical Illness Mis-Sold as Health Insurance

**User Story:** As a policyholder, I want the system to detect when a critical illness plan was sold as a substitute for comprehensive health insurance, so that I understand that CI is a supplement and not a replacement.

#### Acceptance Criteria

1. WHEN ExtractedFields indicate the policy type is "critical_illness" or the policy text contains critical illness standalone plan keywords AND no comprehensive health policy is detected for the same user, THE MisSell_Detector SHALL flag a "Critical Illness Mis-Sold as Health Insurance" MisSellFlag with confidence "likely"
2. WHEN the MisSell_Detector flags a CI mis-sell, THE MisSell_Detector SHALL include in the reality field an explanation that CI plans pay a lump sum on diagnosis of listed conditions only and do not cover hospitalization expenses, OPD, or non-listed conditions
3. WHEN the MisSell_Detector flags a CI mis-sell, THE MisSell_Detector SHALL include in the actionable steps: buy comprehensive health insurance as primary cover, retain CI plan as supplement for income replacement during critical illness


### Requirement 8: Mis-Selling Detection Output Structure

**User Story:** As a developer, I want the mis-selling detection engine to produce a structured, typed output, so that UI components can render mis-sell flags consistently.

#### Acceptance Criteria

1. THE MisSell_Detector SHALL return a typed result containing: an array of MisSellFlag objects, a total flag count, and a mis-selling risk level (none, low, medium, high)
2. WHEN the MisSell_Detector returns a MisSellFlag, THE MisSell_Detector SHALL include for each flag: pattern identifier (one of 7 defined patterns), confidence level (confirmed, likely, possible), agentClaim text, reality text, financialDamage text, userRights text referencing applicable IRDAI regulations, and an actionable steps array with at least 2 steps
3. THE MisSell_Detector SHALL accept ExtractedFields, raw policy text, policyholder age, city tier, and an optional array of other policies held by the user as inputs
4. THE MisSell_Detector SHALL operate as a pure function with no external API calls or database queries
5. THE MisSell_Detector SHALL label all mis-selling flags as "potential concern" in the output, not as "confirmed fraud"

### Requirement 9: Mis-Sell Alert UI Component

**User Story:** As a user, I want to see a prominent red alert banner showing detected mis-selling concerns before I view the regular policy analysis, so that I am immediately aware of potential agent mis-selling.

#### Acceptance Criteria

1. WHEN the MisSell_Detector returns one or more MisSellFlag results, THE MisSell_Alert SHALL render a red (#E85D75) banner above the regular policy analysis content
2. WHEN the MisSell_Alert renders a MisSellFlag, THE MisSell_Alert SHALL display: the pattern name, confidence badge (color-coded: red for confirmed, orange #FF9933 for likely, muted for possible), agent claim vs reality comparison in a two-column layout, financial damage estimate, user rights text, and expandable action steps
3. WHEN the MisSell_Alert renders, THE MisSell_Alert SHALL include IRDAI complaint information: IRDAI IGMS portal URL, toll-free number 155255, and email igms@irdai.gov.in
4. THE MisSell_Alert SHALL include a LegalDisclaimer of type "insurance" stating that flagged items are potential concerns for user review and not confirmed fraud determinations
5. WHEN no MisSellFlag results are returned, THE MisSell_Alert SHALL not render any banner

### Requirement 10: Claim Guidance Engine

**User Story:** As a policyholder about to be hospitalized, I want personalized guidance based on my specific policy terms, hospital, and condition, so that I know exactly what to do to maximize my claim approval chances.

#### Acceptance Criteria

1. WHEN ExtractedFields, hospital type (network or non-network), admission type (planned or emergency), and condition description are provided, THE Claim_Guide SHALL generate a personalized hospitalization guidance object
2. WHEN the Claim_Guide generates guidance, THE Claim_Guide SHALL include: intimation deadline (hours from admission, extracted from policy terms or defaulting to 24 hours for planned and 48 hours for emergency), insurer toll-free number from INDIAN_HEALTH_INSURERS, and intimation method (app, email, phone)
3. WHEN the Claim_Guide generates guidance, THE Claim_Guide SHALL include a document checklist containing: policy copy, ID proof, hospital admission form, doctor referral letter (for planned), diagnostic reports, and any insurer-specific documents
4. WHEN the Claim_Guide generates guidance for a network hospital, THE Claim_Guide SHALL include the cashless claim process steps and estimated pre-authorization timeline
5. WHEN the Claim_Guide generates guidance for a non-network hospital, THE Claim_Guide SHALL include the reimbursement claim process steps and required original documents
6. WHEN the condition matches a pre-existing disease from the policy's PED list and the PED waiting period has not elapsed, THE Claim_Guide SHALL include a warning that the claim may be denied due to PED waiting period with the remaining waiting period in days
7. WHEN the Claim_Guide generates guidance, THE Claim_Guide SHALL include room entitlement based on the policy's room rent limit and the hospital's room categories
8. WHEN the Claim_Guide generates guidance, THE Claim_Guide SHALL include watch-out items specific to the policy (co-payment obligation, sub-limits applicable to the condition, non-payable items list)

### Requirement 11: "I'm Going to Hospital" Guided Flow

**User Story:** As a policyholder facing hospitalization, I want a step-by-step guided flow that walks me through everything I need to know and do, so that I am prepared and do not miss any critical steps.

#### Acceptance Criteria

1. THE Hospital_Flow SHALL present a 5-screen sequential flow: Screen 1 (Select Policy) → Screen 2 (Planned or Emergency) → Screen 3 (Hospital Name with network check) → Screen 4 (Condition with PED check) → Screen 5 (Personalized Checklist)
2. WHEN the user selects a policy on Screen 1, THE Hospital_Flow SHALL load the ExtractedFields for that policy and display the policy name and sum insured for confirmation
3. WHEN the user selects "Emergency" on Screen 2, THE Hospital_Flow SHALL display the insurer's emergency toll-free number prominently and skip non-essential screens where possible
4. WHEN the user enters a hospital name on Screen 3, THE Hospital_Flow SHALL check the hospital against the policy's network hospital list and display a network/non-network status indicator with color coding (#5BE6C4 green for network, #E85D75 red for non-network)
5. WHEN the user enters a condition on Screen 4, THE Hospital_Flow SHALL check the condition against the policy's PED list and waiting period status, displaying a PED coverage status indicator
6. WHEN the Hospital_Flow renders Screen 5 (Personalized Checklist), THE Hospital_Flow SHALL display the complete Claim_Guide output including: intimation deadline with countdown, document checklist with checkboxes, room entitlement, estimated approval information, watch-out items, and all relevant phone numbers
7. THE Hospital_Flow SHALL be accessible via a prominent "I'm Going to Hospital" button in the insurance section, styled with emergency UX (high contrast, large touch target, #E85D75 red background)
8. WHEN the user completes the Hospital_Flow, THE Hospital_Flow SHALL send a PostHog event with the flow completion status, hospital type (network/non-network), and admission type (planned/emergency)

### Requirement 12: Claim Filing Assistant

**User Story:** As a policyholder filing a reimbursement claim, I want step-by-step guidance through the claim filing process with document checklists and amount calculations, so that I submit a complete claim and understand expected reimbursement.

#### Acceptance Criteria

1. THE Claim_Filing_Assistant SHALL present a 5-step sequential flow: Step 1 (Eligibility Check) → Step 2 (Document Checklist Generator) → Step 3 (Claim Amount Calculator) → Step 4 (Submission Guide) → Step 5 (Claim Tracking Reminder)
2. WHEN the user enters claim details on Step 1, THE Claim_Filing_Assistant SHALL check eligibility against the policy's waiting periods (initial, PED, specific disease), coverage dates, and exclusions, displaying a clear eligible/not-eligible result with reason
3. WHEN the Claim_Filing_Assistant generates a document checklist on Step 2, THE Claim_Filing_Assistant SHALL produce an insurer-specific checklist based on the insurer profile from INDIAN_HEALTH_INSURERS, including: claim form, discharge summary, hospital bills (itemized), pharmacy bills, diagnostic reports, doctor prescription, policy copy, ID proof, cancelled cheque, and any insurer-specific additional documents
4. WHEN the user enters the total hospital bill amount on Step 3, THE Claim_Filing_Assistant SHALL calculate the estimated reimbursement by applying deductions for: co-payment percentage, room rent proportionate deduction (if applicable), sub-limit caps, non-payable items estimate, and deductible amount, displaying each deduction line item
5. THE Claim_Filing_Assistant SHALL label all calculated amounts as "estimates — actual settlement may vary based on insurer assessment"
6. WHEN the Claim_Filing_Assistant renders Step 4, THE Claim_Filing_Assistant SHALL display the submission method (online portal, email, physical), submission address, and required timelines for claim submission (typically 15-30 days from discharge)
7. WHEN the Claim_Filing_Assistant renders Step 5, THE Claim_Filing_Assistant SHALL display a reminder to follow up with the insurer if no response is received within 30 days, with the insurer's grievance cell contact information


### Requirement 13: Claim Rejection Fighter Engine

**User Story:** As a policyholder whose claim was rejected, I want the system to analyze the rejection reason, tell me if it is valid, provide grounds to fight it, and generate a template appeal letter, so that I can challenge unfair rejections effectively.

#### Acceptance Criteria

1. WHEN a claim rejection reason and the associated policy's ExtractedFields are provided, THE Claim_Rejection_Fighter SHALL analyze the rejection and return a structured result containing: rejection category, validity assessment (valid, questionable, likely_invalid), grounds to fight (if applicable), escalation path, and a template appeal letter
2. THE Claim_Rejection_Fighter SHALL handle the following common rejection categories: PED not covered (waiting period not elapsed), non-disclosure of medical history, treatment deemed not medically necessary, non-network hospital used, late claim filing, exclusion clause invoked, and sub-limit exceeded
3. WHEN the Claim_Rejection_Fighter determines a rejection is "questionable" or "likely_invalid", THE Claim_Rejection_Fighter SHALL provide specific grounds to fight referencing applicable IRDAI regulations and policyholder rights
4. WHEN the Claim_Rejection_Fighter generates an Escalation_Path, THE Claim_Rejection_Fighter SHALL include 4 sequential steps: Step 1 (insurer internal grievance cell with contact details and 15-day response timeline), Step 2 (IRDAI IGMS portal at igms.irda.gov.in with 30-day response timeline), Step 3 (Insurance Ombudsman with jurisdiction details and 90-day timeline), Step 4 (Consumer court as final recourse)
5. WHEN the Claim_Rejection_Fighter generates a template appeal letter, THE Claim_Rejection_Fighter SHALL use the Claude_API to generate a personalized letter incorporating the rejection reason, policy details, grounds to fight, and applicable IRDAI regulations
6. THE Claim_Rejection_Fighter SHALL include a disclaimer that template letters are starting points and users should consult a lawyer for complex cases
7. THE Claim_Rejection_Fighter SHALL label all outcome assessments with the disclaimer that the system cannot guarantee outcomes and the assessment is for informational purposes only

### Requirement 14: Claim Rejection Fighter UI

**User Story:** As a policyholder, I want a user-friendly interface to input my rejection details and receive analysis with appeal guidance, so that I can take action against unfair claim rejections.

#### Acceptance Criteria

1. THE Claim_Rejection_Fighter UI SHALL present a form accepting: policy selection (from user's analyzed policies), rejection reason (free text or selection from common reasons), rejection letter upload or text input, claim amount, and hospital name
2. WHEN the user submits rejection details, THE Claim_Rejection_Fighter UI SHALL display the analysis result with: rejection category, validity assessment with color coding (#5BE6C4 green for likely_invalid, #FF9933 orange for questionable, #E85D75 red for valid), grounds to fight (if applicable), and the Escalation_Path as a visual timeline
3. WHEN the analysis includes a template appeal letter, THE Claim_Rejection_Fighter UI SHALL display the letter in a copyable text area with a "Copy to Clipboard" button
4. THE Claim_Rejection_Fighter UI SHALL include a LegalDisclaimer of type "insurance" stating that the analysis is informational and does not constitute legal advice
5. WHEN the user interacts with the Claim_Rejection_Fighter UI, THE Claim_Rejection_Fighter UI SHALL send a PostHog event with the rejection category and validity assessment

### Requirement 15: Buying Guide — Needs Assessment

**User Story:** As a prospective insurance buyer, I want the system to assess my insurance needs through targeted questions, so that I receive a personalized coverage recommendation.

#### Acceptance Criteria

1. THE Buying_Guide SHALL present a 4-step sequential flow: Step 1 (Needs Assessment) → Step 2 (Recommended Profile) → Step 3 (Top 3 Recommendations) → Step 4 (Questions to Ask the Agent)
2. WHEN the Buying_Guide renders Step 1, THE Buying_Guide SHALL present 6 assessment questions covering: current coverage status (none, employer-only, individual), age of primary member, pre-existing diseases (list selection), city of residence (for tier classification), monthly budget for health insurance premium, and number of family members to cover
3. WHEN the user completes the 6 assessment questions, THE Buying_Guide SHALL calculate a needs profile containing: recommended minimum sum insured (from RECOMMENDED_SI by city tier and age), must-have features list (no room rent cap, no co-payment, restore benefit, low PED waiting), and red flags to avoid list (high co-payment, room rent sub-limits, low CSR insurer)

### Requirement 16: Buying Guide — Recommended Profile and Top 3 Recommendations

**User Story:** As a prospective insurance buyer, I want to see my recommended coverage profile and the top 3 matching plans from Indian insurers, so that I can make an informed purchasing decision.

#### Acceptance Criteria

1. WHEN the Buying_Guide renders Step 2 (Recommended Profile), THE Buying_Guide SHALL display: recommended minimum sum insured, must-have features with explanations, red flags to avoid with explanations, and estimated premium range for the recommended profile
2. WHEN the Buying_Guide renders Step 3 (Top 3 Recommendations), THE Buying_Guide SHALL select and display up to 3 plans from the INDIAN_HEALTH_INSURERS database that best match the user's needs profile, ranked by: CSR ratio, feature match score, and estimated premium fit
3. WHEN the Buying_Guide displays a recommended plan, THE Buying_Guide SHALL include: insurer name, plan name, sum insured options, key features, CSR ratio (FY2023-24), network hospital count, and indicative premium range
4. THE Buying_Guide SHALL label all premium figures as "indicative — get actual quotes from insurer, premiums vary by age, location, and medical history"
5. THE Buying_Guide SHALL include a LegalDisclaimer of type "insurance" alongside the recommendations

### Requirement 17: Buying Guide — Questions to Ask the Agent

**User Story:** As a prospective insurance buyer, I want a printable checklist of questions to ask the insurance agent, so that I can verify key policy terms before purchasing.

#### Acceptance Criteria

1. WHEN the Buying_Guide renders Step 4, THE Buying_Guide SHALL display a checklist of at least 10 questions covering: room rent limits, co-payment clauses, PED waiting period, specific disease waiting periods, sub-limits on diseases, restoration benefit details, cumulative bonus terms, claim settlement process, network hospital list, and policy exclusions
2. WHEN the Buying_Guide renders the checklist, THE Buying_Guide SHALL include for each question: the question text, why it matters (brief explanation), and the expected good answer
3. THE Buying_Guide SHALL provide a "Print Checklist" button that formats the questions for printing using the browser print API (window.print with print-specific CSS)
4. WHEN the user completes the Buying_Guide flow, THE Buying_Guide SHALL send a PostHog event with the needs assessment summary (city tier, age bracket, budget range) without any personally identifiable information

### Requirement 18: Agent Accountability Score

**User Story:** As a policyholder, I want to record how my policy was bought and whether the agent explained key terms, so that the system can track anonymized accountability data and show social proof statistics.

#### Acceptance Criteria

1. WHEN a user adds or views a policy analysis, THE Agent_Accountability_Score component SHALL present an optional survey asking: how the policy was purchased (agent, online, bank, employer), whether the agent explained room rent limits (yes/no/not applicable), whether the agent explained co-payment (yes/no/not applicable), whether the agent explained waiting periods (yes/no/not applicable), and whether the agent explained exclusions (yes/no/not applicable)
2. WHEN the user submits the accountability survey, THE Agent_Accountability_Score component SHALL store the responses in localStorage only, keyed by a hash of the policy identifier, with no personally identifiable information
3. WHEN the Agent_Accountability_Score component renders and localStorage contains survey data, THE Agent_Accountability_Score component SHALL display anonymized social proof statistics: percentage of policies where agents did not explain room rent limits, percentage where agents did not explain co-payment, and total surveys recorded on this device
4. THE Agent_Accountability_Score component SHALL NOT transmit survey data to any server, database, or external service
5. THE Agent_Accountability_Score component SHALL NOT name specific agents or companies in the social proof display

### Requirement 19: Mis-Selling Education Sub-Tab

**User Story:** As a user, I want to learn about common insurance mis-selling tactics, real claim rejection scenarios, and my IRDAI rights, so that I can protect myself from agent mis-selling.

#### Acceptance Criteria

1. THE MisSelling_Educator SHALL render as a new sub-tab titled "Mis-Selling Guide" within the existing Education Center component structure alongside existing education tabs
2. WHEN the MisSelling_Educator renders, THE MisSelling_Educator SHALL display a "7 Lies Insurance Agents Tell" section with each lie described as: the agent's claim, the reality, and how to verify
3. WHEN the MisSelling_Educator renders, THE MisSelling_Educator SHALL display a "Real Claim Rejection Stories" section with at least 5 illustrative scenarios (not real cases) showing: the situation, what went wrong, the outcome, and the lesson learned
4. WHEN the MisSelling_Educator renders, THE MisSelling_Educator SHALL display an "IRDAI Rights" section listing policyholder rights including: free-look period (15-30 days), portability right, grievance redressal mechanism, and claim settlement timelines mandated by IRDAI
5. WHEN the MisSelling_Educator renders, THE MisSelling_Educator SHALL display a "Downloadable Claim Checklist" section with a printable/downloadable checklist of documents needed for claim filing, formatted for browser print (window.print)
6. THE MisSelling_Educator SHALL reference IRDAI rights and regulations accurate as of FY2024-25
7. THE MisSelling_Educator SHALL use the existing dark theme colors and match the visual style of other education tabs


### Requirement 20: Analytics Tracking for Insurance Guardian Features

**User Story:** As a product owner, I want all key user interactions with the Insurance Guardian features tracked via PostHog, so that I can measure feature adoption and identify improvement areas.

#### Acceptance Criteria

1. WHEN a user views the MisSell_Alert banner, THE MisSell_Alert SHALL send a PostHog event with the number of flags detected and the highest confidence level
2. WHEN a user starts the Hospital_Flow, THE Hospital_Flow SHALL send a PostHog event at each screen transition with the screen number and selections made (without PII)
3. WHEN a user completes a step in the Claim_Filing_Assistant, THE Claim_Filing_Assistant SHALL send a PostHog event with the step number and completion status
4. WHEN a user submits a rejection for analysis in the Claim_Rejection_Fighter UI, THE Claim_Rejection_Fighter UI SHALL send a PostHog event with the rejection category and validity assessment
5. WHEN a user completes the Buying_Guide flow, THE Buying_Guide SHALL send a PostHog event with the city tier, age bracket, and budget range (no PII)
6. WHEN a user views the MisSelling_Educator tab, THE MisSelling_Educator SHALL send a PostHog event with the section viewed
7. WHEN a user submits the Agent_Accountability_Score survey, THE Agent_Accountability_Score component SHALL send a PostHog event with the purchase channel (agent, online, bank, employer) only, without individual survey responses

### Requirement 21: Non-Functional Constraints

**User Story:** As a developer, I want the Insurance Guardian System to respect existing system boundaries and legal requirements, so that the new features integrate cleanly without breaking existing functionality or creating legal liability.

#### Acceptance Criteria

1. THE Insurance Guardian System SHALL NOT modify the existing Supabase database schema
2. THE Insurance Guardian System SHALL NOT require installation of new npm packages beyond those already in the project
3. THE Insurance Guardian System SHALL NOT modify existing insurance pipeline files (lib/insurance/types.ts, lib/insurance/risk-detection-engine.ts, lib/insurance/scoring-engine.ts, lib/insurance/coverage-gap-analyzer.ts, lib/insurance/report-generator.ts) except to import from new modules
4. THE Insurance Guardian System SHALL consume ExtractedFields, PolicyScore, RiskAnalysis, and other existing types from the insurance pipeline without modifying those interfaces
5. WHEN the MisSell_Detector, Claim_Guide, Claim_Rejection_Fighter, or Buying_Guide encounters missing or null input fields, THE respective engine SHALL handle the missing data gracefully by skipping the affected analysis and noting the omission in the output rather than throwing an error
6. THE Insurance Guardian System SHALL render all UI components correctly on the existing dark theme (#0D1120 background, #FF9933 orange accent, #5BE6C4 green, #E85D75 red)
7. THE Insurance Guardian System SHALL NOT name specific insurance agents or companies negatively in any user-facing text; all references to agent behavior SHALL use generic phrasing such as "some agents"
8. THE MisSell_Detector SHALL label all detected patterns as "potential concern" and SHALL NOT use the term "fraud" or "confirmed fraud" in any output
9. THE Claim_Filing_Assistant SHALL label all calculated claim amounts as "estimates — actual settlement may vary"
10. THE Claim_Rejection_Fighter SHALL include a disclaimer that outcomes cannot be guaranteed and the analysis is for informational purposes only
11. THE Buying_Guide SHALL label all premium and coverage figures as "indicative — get actual quotes, premiums vary"
12. THE Agent_Accountability_Score SHALL store all data in localStorage only and SHALL NOT transmit data to any server
13. THE MisSelling_Educator SHALL reference IRDAI rights and regulations accurate as of FY2024-25
14. THE Hospital_Flow "I'm Going to Hospital" button SHALL be styled with emergency UX: high contrast, large touch target (minimum 48px height), and #E85D75 red background for immediate visibility
