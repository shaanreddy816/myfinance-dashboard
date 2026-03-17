# Requirements Document

## Introduction

This document specifies requirements for upgrading the Insurance AI system to support comprehensive analysis of all major Indian insurers with claim probability prediction and intelligent policy suggestions. The system will expand from 3 agents to 5 agents, add 3 new analysis tabs to the modal interface, and provide actionable insights for policy improvement.

The upgrade transforms the existing policy analysis system into a comprehensive insurance advisor that can predict claim success probability, identify rejection risks, compare insurers, and suggest better policies when needed.

## Glossary

- **Insurance_AI_System**: The complete multi-agent system that analyzes insurance policies
- **Insurer_Database**: Structured data store containing profiles of 14+ major Indian insurance companies
- **Claim_Probability_Agent**: AI agent that calculates likelihood of successful claim settlement
- **Policy_Suggestion_Agent**: AI agent that recommends better policies when current policy scores below 75
- **Analysis_Modal**: React component displaying policy analysis results in tabbed interface
- **CSR**: Claim Settlement Ratio - percentage of claims settled by an insurer
- **PED**: Pre-Existing Disease
- **Cashless_Claim**: Hospital claim settled directly by insurer without patient payment
- **Reimbursement_Claim**: Patient pays hospital and insurer reimburses later
- **Proportionate_Deduction**: Penalty applied when room rent exceeds policy limit
- **Sub_Limit**: Maximum amount payable for specific treatment categories
- **Portability**: Transferring policy to new insurer while maintaining PED waiting period continuity
- **IRDAI**: Insurance Regulatory and Development Authority of India
- **Network_Hospital**: Hospital with cashless claim agreement with insurer
- **Hidden_Clause**: Policy terms that significantly impact claims but are not prominently disclosed

## Requirements

### Requirement 1: Insurer Database Creation

**User Story:** As a system, I want a comprehensive database of Indian insurers, so that I can provide accurate insurer-specific analysis and comparisons.

#### Acceptance Criteria

1. THE Insurer_Database SHALL contain profiles for at least 14 major Indian health insurance companies
2. WHEN an insurer profile is stored, THE Insurer_Database SHALL include CSR percentage, network hospital count, average processing days, tier classification, strengths list, weaknesses list, popular plans list, and common rejection reasons
3. THE Insurer_Database SHALL provide an insurer matching function that accepts policy provider names and returns the matching insurer profile
4. THE Insurer_Database SHALL support insurer name aliases to handle variations in company names
5. THE Insurer_Database SHALL define ideal policy benchmarks for the Indian health insurance market
6. THE Insurer_Database SHALL contain plan suggestion templates categorized by policy weakness types
7. THE Insurer_Database SHALL be implemented as a TypeScript module at lib/data/insurerDatabase.ts

### Requirement 2: Claim Probability Calculation

**User Story:** As a policy holder, I want to know my probability of successful claim settlement, so that I can understand my real coverage and take preventive actions.

#### Acceptance Criteria

1. THE Claim_Probability_Agent SHALL calculate an overall claim probability score from 0 to 100
2. THE Claim_Probability_Agent SHALL calculate separate probabilities for cashless claims and reimbursement claims
3. WHEN calculating claim probability, THE Claim_Probability_Agent SHALL consider insurer CSR, policy terms quality, room rent risk, waiting period status, and network hospital access
4. THE Claim_Probability_Agent SHALL identify the top 3 rejection risks with likelihood percentage and estimated financial impact
5. THE Claim_Probability_Agent SHALL detect hidden clauses including proportionate deduction risk, sub-limits, co-payment triggers, and disease-specific exclusions
6. THE Claim_Probability_Agent SHALL provide 3-5 actionable claim tips to maximize settlement success
7. THE Claim_Probability_Agent SHALL assign a letter grade (A/B/C/D/F) based on claim probability thresholds
8. WHEN claim probability is below 60%, THE Claim_Probability_Agent SHALL flag the policy as high rejection risk

### Requirement 3: Policy Suggestion Engine

**User Story:** As a policy holder with a suboptimal policy, I want specific recommendations for better policies, so that I can make informed decisions about switching or porting.

#### Acceptance Criteria

1. WHEN policy overall score is less than 75, THE Policy_Suggestion_Agent SHALL generate policy improvement suggestions
2. WHEN policy overall score is 75 or greater, THE Policy_Suggestion_Agent SHALL not execute
3. THE Policy_Suggestion_Agent SHALL suggest exactly 3 alternative policies from the Indian market
4. WHEN suggesting a policy, THE Policy_Suggestion_Agent SHALL provide specific plan name, estimated premium range, key improvements over current policy, and insurer reliability metrics
5. THE Policy_Suggestion_Agent SHALL provide portability guidance explaining PED waiting period continuity rules
6. THE Policy_Suggestion_Agent SHALL classify switch urgency as immediate, at-renewal, or optional based on policy weaknesses
7. WHEN switch urgency is immediate, THE Policy_Suggestion_Agent SHALL explain the critical risks requiring urgent action
8. THE Policy_Suggestion_Agent SHALL include step-by-step instructions for policy switching or porting

### Requirement 4: Agent Pipeline Integration

**User Story:** As the system, I want to integrate new agents into the existing pipeline, so that analysis includes claim probability and policy suggestions.

#### Acceptance Criteria

1. THE Insurance_AI_System SHALL execute agents in this sequence: DocumentReaderAgent, InsuranceAnalysisAgent, Claim_Probability_Agent, Policy_Suggestion_Agent, DashboardUpdateAgent
2. WHEN Claim_Probability_Agent executes, THE Insurance_AI_System SHALL provide it with policy data and insurer profile
3. WHEN Policy_Suggestion_Agent executes, THE Insurance_AI_System SHALL provide it with policy data, analysis results, and claim probability results
4. THE Insurance_AI_System SHALL include Claim_Probability_Agent output in the final analysis response
5. WHEN policy score is less than 75, THE Insurance_AI_System SHALL include Policy_Suggestion_Agent output in the final analysis response
6. WHEN policy score is 75 or greater, THE Insurance_AI_System SHALL omit Policy_Suggestion_Agent output from the response
7. THE Insurance_AI_System SHALL update the agentsRun array to reflect all 5 agents

### Requirement 5: Claim Analysis Tab

**User Story:** As a policy holder, I want to see detailed claim probability analysis, so that I understand my real coverage and risks.

#### Acceptance Criteria

1. THE Analysis_Modal SHALL display a "Claim Analysis" tab as the 6th tab
2. WHEN the Claim Analysis tab is active, THE Analysis_Modal SHALL display overall claim probability as a large percentage with color coding (green ≥80%, yellow 60-79%, red <60%)
3. THE Analysis_Modal SHALL display probability breakdown bars for cashless probability and reimbursement probability
4. THE Analysis_Modal SHALL display top rejection risks as red warning cards with likelihood percentage and financial impact
5. THE Analysis_Modal SHALL display detected hidden clauses with warning icons and explanations
6. WHEN proportionate deduction risk exists, THE Analysis_Modal SHALL display a dedicated warning card explaining the financial impact
7. THE Analysis_Modal SHALL display 3-5 claim tips as actionable cards with checkmark icons
8. THE Analysis_Modal SHALL display the claim probability letter grade prominently

### Requirement 6: Insurer Report Card Tab

**User Story:** As a policy holder, I want to see how my insurer compares to the market, so that I can assess insurer reliability.

#### Acceptance Criteria

1. THE Analysis_Modal SHALL display an "Insurer Report Card" tab as the 7th tab
2. WHEN the Insurer Report Card tab is active, THE Analysis_Modal SHALL display insurer CSR, network hospital count, average processing days, and service rating
3. THE Analysis_Modal SHALL display insurer strengths as green cards with checkmark icons
4. THE Analysis_Modal SHALL display insurer weaknesses as yellow warning cards
5. THE Analysis_Modal SHALL compare the current insurer to the top 3 insurers in the market
6. THE Analysis_Modal SHALL display industry context explaining what constitutes good vs poor metrics
7. THE Analysis_Modal SHALL display insurer tier classification (Tier 1 or Tier 2)

### Requirement 7: Better Plans Tab

**User Story:** As a policy holder with a low-scoring policy, I want to see specific better policy options, so that I can consider switching or porting.

#### Acceptance Criteria

1. WHEN policy overall score is less than 75, THE Analysis_Modal SHALL display a "Better Plans" tab as the 8th tab
2. WHEN policy overall score is 75 or greater, THE Analysis_Modal SHALL not display the Better Plans tab
3. WHEN the Better Plans tab is active, THE Analysis_Modal SHALL display a switch urgency banner with color coding (red for immediate, yellow for at-renewal, green for optional)
4. THE Analysis_Modal SHALL display portability guidance explaining PED waiting period continuity
5. THE Analysis_Modal SHALL display exactly 3 policy suggestions ranked by suitability
6. WHEN displaying a policy suggestion, THE Analysis_Modal SHALL show plan name, insurer name, estimated premium, key improvements, and CSR
7. THE Analysis_Modal SHALL display step-by-step instructions for switching or porting
8. THE Analysis_Modal SHALL display an IRDAI compliance disclaimer about policy suggestions

### Requirement 8: Loading UI Enhancement

**User Story:** As a policy holder, I want to see which agents are analyzing my policy, so that I understand the analysis process and expected wait time.

#### Acceptance Criteria

1. WHEN policy analysis starts, THE Insurance_AI_System SHALL display 5 animated agent pills showing DocumentReaderAgent, InsuranceAnalysisAgent, Claim_Probability_Agent, Policy_Suggestion_Agent, and DashboardUpdateAgent
2. THE Insurance_AI_System SHALL update agent pill status to show in-progress state with animation
3. THE Insurance_AI_System SHALL update agent pill status to show completed state with checkmark
4. THE Insurance_AI_System SHALL display estimated time as "15-25 seconds"
5. WHEN an agent is executing, THE Insurance_AI_System SHALL highlight that agent's pill with accent color

### Requirement 9: Insurer Profile Matching

**User Story:** As the system, I want to match policy provider names to insurer profiles, so that I can provide accurate insurer-specific analysis.

#### Acceptance Criteria

1. WHEN a policy provider name is extracted, THE Insurer_Database SHALL attempt to match it to an insurer profile
2. THE Insurer_Database SHALL perform case-insensitive matching
3. THE Insurer_Database SHALL match common aliases (e.g., "Star Health" matches "Star Health and Allied Insurance")
4. WHEN no exact match is found, THE Insurer_Database SHALL return a default profile with conservative estimates
5. THE Insurer_Database SHALL log unmatched insurer names for future database expansion

### Requirement 10: Risk Identification and Prevention

**User Story:** As a policy holder, I want to know specific risks that could cause claim rejection, so that I can take preventive actions.

#### Acceptance Criteria

1. THE Claim_Probability_Agent SHALL identify room rent limit violations and calculate proportionate deduction risk
2. THE Claim_Probability_Agent SHALL identify sub-limits on specific treatments
3. THE Claim_Probability_Agent SHALL identify waiting periods that are still active
4. THE Claim_Probability_Agent SHALL identify network hospital availability in the policy holder's city
5. THE Claim_Probability_Agent SHALL identify co-payment triggers and conditions
6. WHEN a risk is identified, THE Claim_Probability_Agent SHALL provide specific prevention tips
7. THE Claim_Probability_Agent SHALL estimate financial impact for each identified risk

### Requirement 11: Portability Guidance

**User Story:** As a policy holder considering switching insurers, I want to understand portability rules, so that I don't lose PED waiting period benefits.

#### Acceptance Criteria

1. THE Policy_Suggestion_Agent SHALL explain that PED waiting period credit transfers when porting
2. THE Policy_Suggestion_Agent SHALL explain the 45-day window before renewal for initiating portability
3. THE Policy_Suggestion_Agent SHALL explain that sum insured can be increased during portability
4. THE Policy_Suggestion_Agent SHALL explain that new insurer may require medical tests for sum insured increase
5. THE Policy_Suggestion_Agent SHALL provide a step-by-step portability process checklist

### Requirement 12: Responsive Design for New Components

**User Story:** As a policy holder on mobile, I want all new analysis tabs to be readable and usable, so that I can review my policy on any device.

#### Acceptance Criteria

1. WHEN viewport width is less than 768px, THE Analysis_Modal SHALL stack claim probability breakdown bars vertically
2. WHEN viewport width is less than 768px, THE Analysis_Modal SHALL display policy suggestions as single column cards
3. WHEN viewport width is less than 768px, THE Analysis_Modal SHALL adjust font sizes for readability
4. THE Analysis_Modal SHALL maintain touch-friendly tap targets of at least 44x44 pixels on mobile
5. THE Analysis_Modal SHALL support horizontal scrolling for comparison tables on mobile

### Requirement 13: Error Handling for New Agents

**User Story:** As the system, I want to handle agent failures gracefully, so that partial analysis results are still useful to users.

#### Acceptance Criteria

1. WHEN Claim_Probability_Agent fails, THE Insurance_AI_System SHALL return analysis results without claim probability data
2. WHEN Policy_Suggestion_Agent fails, THE Insurance_AI_System SHALL return analysis results without policy suggestions
3. WHEN an agent fails, THE Insurance_AI_System SHALL log the error with agent name and error details
4. WHEN an agent fails, THE Insurance_AI_System SHALL display a user-friendly error message in the corresponding tab
5. THE Insurance_AI_System SHALL not fail the entire analysis pipeline if a single agent fails

### Requirement 14: Performance Optimization

**User Story:** As a policy holder, I want policy analysis to complete in reasonable time, so that I don't abandon the process.

#### Acceptance Criteria

1. THE Insurance_AI_System SHALL complete full 5-agent analysis within 25 seconds for 95% of requests
2. THE Insurance_AI_System SHALL execute DocumentReaderAgent and InsuranceAnalysisAgent sequentially
3. THE Insurance_AI_System SHALL execute Claim_Probability_Agent and Policy_Suggestion_Agent in parallel after InsuranceAnalysisAgent completes
4. THE Insurance_AI_System SHALL cache insurer profiles to avoid repeated database lookups
5. THE Insurance_AI_System SHALL use Claude Sonnet for faster agents and Claude Opus only for complex analysis

### Requirement 15: IRDAI Compliance Disclaimers

**User Story:** As the system, I want to display regulatory disclaimers, so that users understand policy suggestions are informational only.

#### Acceptance Criteria

1. WHEN displaying policy suggestions, THE Analysis_Modal SHALL display an IRDAI compliance disclaimer
2. THE Analysis_Modal SHALL state that suggestions are for informational purposes only
3. THE Analysis_Modal SHALL state that users should verify all details with insurers before purchasing
4. THE Analysis_Modal SHALL state that the system is not a licensed insurance broker
5. THE Analysis_Modal SHALL display the disclaimer prominently at the top of the Better Plans tab

### Requirement 16: Insurer Database Content Requirements

**User Story:** As the system, I want comprehensive insurer data, so that analysis is accurate and actionable.

#### Acceptance Criteria

1. THE Insurer_Database SHALL include these insurers: Star Health, HDFC Ergo, ICICI Lombard, Care Health, Niva Bupa, Aditya Birla, Bajaj Allianz, Digit Insurance, Manipal Cigna, Max Bupa, Reliance Health, SBI General, New India Assurance, and Oriental Insurance
2. FOR EACH insurer, THE Insurer_Database SHALL store CSR as a percentage between 0 and 100
3. FOR EACH insurer, THE Insurer_Database SHALL store network hospital count as an integer
4. FOR EACH insurer, THE Insurer_Database SHALL store average claim processing days as an integer
5. FOR EACH insurer, THE Insurer_Database SHALL store tier as "Tier 1" or "Tier 2"
6. FOR EACH insurer, THE Insurer_Database SHALL store at least 3 strengths and 3 weaknesses
7. FOR EACH insurer, THE Insurer_Database SHALL store at least 3 popular plan names

### Requirement 17: Claim Probability Calculation Formula

**User Story:** As the system, I want a consistent claim probability calculation, so that scores are reliable and comparable.

#### Acceptance Criteria

1. THE Claim_Probability_Agent SHALL calculate base probability from insurer CSR (CSR percentage = base probability)
2. THE Claim_Probability_Agent SHALL reduce probability by 15 points if room rent has strict limits
3. THE Claim_Probability_Agent SHALL reduce probability by 10 points if co-payment exceeds 10%
4. THE Claim_Probability_Agent SHALL reduce probability by 20 points if PED waiting period is still active
5. THE Claim_Probability_Agent SHALL reduce probability by 10 points if network hospital access is limited
6. THE Claim_Probability_Agent SHALL reduce probability by 5 points for each detected hidden clause
7. THE Claim_Probability_Agent SHALL ensure final probability is between 0 and 100

### Requirement 18: Policy Suggestion Ranking

**User Story:** As a policy holder, I want policy suggestions ranked by suitability, so that I can prioritize which policies to research.

#### Acceptance Criteria

1. THE Policy_Suggestion_Agent SHALL rank suggestions by a composite score
2. THE Policy_Suggestion_Agent SHALL weight insurer CSR as 30% of ranking score
3. THE Policy_Suggestion_Agent SHALL weight policy features improvement as 40% of ranking score
4. THE Policy_Suggestion_Agent SHALL weight premium affordability as 30% of ranking score
5. THE Policy_Suggestion_Agent SHALL display the highest-ranked suggestion first

### Requirement 19: Hidden Clause Detection

**User Story:** As a policy holder, I want to know about hidden clauses that could impact my claims, so that I'm not surprised during claim settlement.

#### Acceptance Criteria

1. THE Claim_Probability_Agent SHALL detect proportionate deduction clauses in room rent terms
2. THE Claim_Probability_Agent SHALL detect sub-limits on specific treatment categories
3. THE Claim_Probability_Agent SHALL detect co-payment triggers based on hospital type or treatment
4. THE Claim_Probability_Agent SHALL detect disease-specific exclusions beyond standard exclusions
5. THE Claim_Probability_Agent SHALL detect mandatory deductibles or aggregate deductibles
6. WHEN a hidden clause is detected, THE Claim_Probability_Agent SHALL explain its impact in simple language

### Requirement 20: Data Validation and Quality

**User Story:** As the system, I want to validate agent outputs, so that displayed data is accurate and complete.

#### Acceptance Criteria

1. THE Insurance_AI_System SHALL validate that claim probability is a number between 0 and 100
2. THE Insurance_AI_System SHALL validate that policy suggestions contain required fields: plan name, insurer, premium estimate, and improvements
3. THE Insurance_AI_System SHALL validate that insurer profiles contain all required fields before use
4. WHEN validation fails, THE Insurance_AI_System SHALL log the validation error and use fallback values
5. THE Insurance_AI_System SHALL validate that letter grades are one of: A, B, C, D, or F

