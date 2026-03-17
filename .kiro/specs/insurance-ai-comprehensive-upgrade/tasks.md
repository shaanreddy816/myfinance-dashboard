# Implementation Plan: Insurance AI Comprehensive Upgrade

## Overview

This implementation upgrades the Insurance AI system from 3 agents to 5 agents, adds 3 new modal tabs, creates an insurer database with 14+ insurers, and implements claim probability prediction with policy suggestions. The system will analyze policies comprehensively and provide actionable recommendations when scores fall below 75/100.

## Tasks

- [x] 1. Create insurer database module
  - [x] 1.1 Create insurerDatabase.ts with TypeScript interfaces
    - Define InsurerProfile, PolicyBenchmark, and PlanSuggestionTemplate interfaces
    - Create INSURERS array with 14 insurer profiles (Star Health, HDFC Ergo, ICICI Lombard, Care Health, Niva Bupa, Aditya Birla, Bajaj Allianz, Digit, Manipal Cigna, Max Bupa, Reliance, SBI General, New India, Oriental)
    - Each profile must include: id, name, aliases, tier, CSR, networkHospitals, avgProcessingDays, serviceRating, strengths (≥3), weaknesses (≥3), popularPlans (≥3), commonRejectionReasons, website
    - _Requirements: 1.1, 1.2, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_
  
  - [x] 1.2 Implement insurer matching and lookup functions
    - Implement matchInsurer() with case-insensitive matching and alias support
    - Implement getDefaultProfile() for unknown insurers
    - Implement getBenchmarks() for policy standards
    - Implement getSuggestionTemplates() for plan recommendations
    - Implement getTopInsurersByCSR() for comparisons
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 1.3 Write property tests for insurer database
    - **Property 1: Insurer Profile Completeness** - Validate all profiles have required fields
    - **Property 2: Insurer Matching Consistency** - Verify alias matching returns same profile
    - **Property 3: Case-Insensitive Matching** - Test matching with different casing
    - **Property 4: Fallback Profile for Unknown Insurers** - Verify default profile returned
    - **Validates: Requirements 1.2, 1.3, 1.4, 9.2, 9.3, 9.4**
  
  - [ ]* 1.4 Write unit tests for insurer database
    - Test database contains exactly 14 insurers
    - Test specific insurer matching (e.g., "Star Health" → Star Health and Allied Insurance)
    - Test unknown insurer returns default profile
    - Test CSR values are between 0-100
    - _Requirements: 16.1, 16.2, 20.3_

- [x] 2. Create Claim Probability Agent
  - [x] 2.1 Create ClaimProbabilityAgent.ts with core calculation logic
    - Define ClaimProbabilityInput and ClaimProbabilityOutput interfaces
    - Implement execute() method with main calculation flow
    - Implement calculateBaseProbability() using insurer CSR
    - Implement penalty calculation methods: assessRoomRentRisk(), assessCopaymentRisk(), assessPEDWaitingRisk(), assessNetworkAccessRisk()
    - Apply penalties: room rent strict limits (-15), copayment >10% (-10), active PED (-20), limited network (-10), each hidden clause (-5)
    - Ensure final probability is clamped to 0-100 range
    - _Requirements: 2.1, 2.3, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_
  
  - [x] 2.2 Implement risk identification and hidden clause detection
    - Implement detectHiddenClauses() to find proportionate deduction, sub-limits, copayment triggers, disease exclusions, aggregate deductibles
    - Implement risk assessment for top 3 rejection risks with likelihood and financial impact
    - Implement generateClaimTips() for 3-5 actionable tips
    - _Requirements: 2.4, 2.5, 2.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
  
  - [x] 2.3 Implement letter grade assignment and probability breakdown
    - Implement assignLetterGrade() with thresholds: A (85-100), B (70-84), C (60-69), D (50-59), F (0-49)
    - Calculate separate cashlessProbability and reimbursementProbability
    - Flag high risk when probability < 60%
    - Return complete ClaimProbabilityOutput with all fields
    - _Requirements: 2.2, 2.7, 2.8_
  
  - [ ]* 2.4 Write property tests for Claim Probability Agent
    - **Property 5: Claim Probability Range Validation** - Verify output is 0-100
    - **Property 6: Claim Probability Calculation Formula** - Verify penalty formula
    - **Property 7: Claim Probability Output Structure** - Validate all required fields present
    - **Property 8: Letter Grade Assignment** - Verify grade thresholds
    - **Property 9: High Risk Flagging** - Verify flagging when < 60%
    - **Property 10: Hidden Clause Detection** - Verify detection of all clause types
    - **Property 11: Risk Prevention Tips** - Verify tips provided for each risk
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 17.1-17.7, 19.1-19.6**
  
  - [ ]* 2.5 Write unit tests for Claim Probability Agent
    - Test specific CSR values produce correct base probability
    - Test each penalty type reduces probability correctly
    - Test letter grade assignment for boundary values (49, 50, 59, 60, 69, 70, 84, 85)
    - Test hidden clause detection for specific policy terms
    - Test high risk flagging at probability 55 and 65
    - _Requirements: 2.7, 2.8, 17.1-17.7_

- [-] 3. Create Policy Suggestion Agent
  - [x] 3.1 Create PolicySuggestionAgent.ts with conditional execution logic
    - Define PolicySuggestionInput and PolicySuggestionOutput interfaces
    - Implement execute() method that returns null if score >= 75
    - Implement determineUrgency() to classify as immediate/at_renewal/optional
    - When urgency is immediate, provide critical risk explanation
    - _Requirements: 3.1, 3.2, 3.6, 3.7_
  
  - [x] 3.2 Implement policy suggestion generation and ranking
    - Implement generateSuggestions() to create exactly 3 alternative policies
    - Each suggestion must include: rank (1/2/3), planName, insurer, insurerCSR, estimatedPremium, keyImprovements array, compositeScore
    - Implement calculateCompositeScore() with formula: (CSR × 0.30) + (Feature Improvement × 0.40) + (Premium Affordability × 0.30)
    - Implement rankSuggestions() to sort by composite score descending
    - _Requirements: 3.3, 3.4, 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [x] 3.3 Implement portability guidance and compliance
    - Implement generatePortabilityGuidance() with PED continuity explanation, 45-day timing window, sum insured increase rules, medical test requirements, step-by-step process
    - Add IRDAI disclaimer text for informational purposes
    - _Requirements: 3.5, 3.8, 11.1, 11.2, 11.3, 11.4, 11.5, 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ]* 3.4 Write property tests for Policy Suggestion Agent
    - **Property 12: Conditional Policy Suggestion Execution** - Verify execution only when score < 75
    - **Property 13: Policy Suggestion Count** - Verify exactly 3 suggestions returned
    - **Property 14: Policy Suggestion Structure** - Validate all required fields
    - **Property 15: Composite Score Calculation** - Verify ranking formula
    - **Property 16: Urgency Classification** - Verify urgency values and reasons
    - **Property 17: Portability Guidance Completeness** - Validate all guidance fields
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 18.1-18.5**
  
  - [ ]* 3.5 Write unit tests for Policy Suggestion Agent
    - Test agent returns null for score 80
    - Test agent returns 3 suggestions for score 65
    - Test suggestions are ranked by composite score
    - Test urgency classification for different score ranges
    - Test portability guidance contains all required fields
    - _Requirements: 3.1, 3.2, 3.3, 18.5_

- [x] 4. Upgrade API route to integrate new agents
  - [x] 4.1 Update analyze-insurance-policy route.ts with new agent imports and initialization
    - Import ClaimProbabilityAgent and PolicySuggestionAgent
    - Import matchInsurer from insurerDatabase
    - Initialize both new agents
    - _Requirements: 4.1, 4.2_
  
  - [x] 4.2 Implement sequential and parallel agent execution
    - After InsuranceAnalysisAgent completes, extract overallScore
    - Execute ClaimProbabilityAgent with policyData, insurerProfile, and analysisResult
    - Conditionally execute PolicySuggestionAgent only if overallScore < 75
    - Execute both agents in parallel using Promise.all when applicable
    - Execute DashboardUpdateAgent after parallel agents complete
    - _Requirements: 4.1, 4.2, 4.3, 14.2, 14.3_
  
  - [x] 4.3 Update API response structure with new agent outputs
    - Add claimProbability field to response
    - Add policySuggestions field (null if score >= 75)
    - Add insurerProfile field
    - Update agentsRun array to include all 5 agents
    - Add errors object for agent-specific failures
    - _Requirements: 4.4, 4.5, 4.6, 4.7_
  
  - [x] 4.4 Implement error handling for new agents
    - Wrap ClaimProbabilityAgent execution in try-catch
    - Wrap PolicySuggestionAgent execution in try-catch
    - On agent failure, log error and continue with partial results
    - Add error messages to errors object in response
    - Ensure pipeline doesn't fail if single agent fails
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 4.5 Write property tests for agent pipeline
    - **Property 18: Agent Pipeline Execution Order** - Verify sequential and parallel execution
    - **Property 19: Conditional Response Structure** - Verify response fields based on score
    - **Property 20: Partial Failure Resilience** - Verify graceful degradation
    - **Validates: Requirements 4.1, 4.4, 4.5, 4.6, 4.7, 13.1-13.5**
  
  - [ ]* 4.6 Write integration tests for API route
    - Test complete 5-agent pipeline execution
    - Test PolicySuggestionAgent skipped when score >= 75
    - Test partial results returned when ClaimProbabilityAgent fails
    - Test agentsRun array reflects executed agents
    - Test response structure for both score < 75 and score >= 75 cases
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Checkpoint - Verify backend agents working
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create Claim Analysis tab component
  - [x] 6.1 Add "Claim Analysis" tab to PolicyAnalysisModal.tsx
    - Update tabs array to include "Claim Analysis" as 6th tab
    - Create ClaimAnalysisTab component function
    - _Requirements: 5.1_
  
  - [x] 6.2 Implement overall probability display with color coding
    - Display overallProbability as large percentage
    - Apply color coding: green (#5BE6C4) for ≥80%, yellow (#FFD93D) for 60-79%, red (#FF6B6B) for <60%
    - Display letter grade prominently
    - _Requirements: 5.2, 5.8, 2.7_
  
  - [x] 6.3 Implement probability breakdown and risk displays
    - Create horizontal bars for cashlessProbability and reimbursementProbability
    - Display top rejection risks as red warning cards with likelihood percentage and financial impact
    - Display detected hidden clauses with warning icons and explanations
    - Display proportionate deduction warning card if detected
    - Display 3-5 claim tips as actionable cards with checkmark icons
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 6.4 Write unit tests for Claim Analysis tab
    - Test green color applied for probability 85
    - Test yellow color applied for probability 70
    - Test red color applied for probability 55
    - Test rejection risks displayed correctly
    - Test hidden clauses displayed with warnings
    - _Requirements: 5.2, 5.4, 5.5_

- [x] 7. Create Insurer Report Card tab component
  - [x] 7.1 Add "Insurer Report Card" tab to PolicyAnalysisModal.tsx
    - Update tabs array to include "Insurer Report Card" as 7th tab
    - Create InsurerReportCardTab component function
    - _Requirements: 6.1_
  
  - [x] 7.2 Implement insurer metrics and comparison display
    - Display insurer CSR, network hospital count, average processing days, service rating
    - Display insurer tier classification badge (Tier 1 or Tier 2)
    - Display strengths as green cards with checkmark icons
    - Display weaknesses as yellow warning cards
    - Compare current insurer to top 3 insurers by CSR
    - Display industry context explaining good vs poor metrics
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 7.3 Write unit tests for Insurer Report Card tab
    - Test insurer metrics displayed correctly
    - Test strengths displayed as green cards
    - Test weaknesses displayed as yellow cards
    - Test tier badge displayed
    - _Requirements: 6.2, 6.3, 6.4, 6.7_

- [x] 8. Create Better Plans tab component (conditional)
  - [x] 8.1 Add conditional "Better Plans" tab to PolicyAnalysisModal.tsx
    - Update tabs array to conditionally include "Better Plans" as 8th tab only if score < 75
    - Create BetterPlansTab component function
    - _Requirements: 7.1, 7.2_
  
  - [x] 8.2 Implement IRDAI disclaimer and urgency banner
    - Display IRDAI compliance disclaimer at top of tab
    - Disclaimer must state: informational purposes only, verify with insurers, not a licensed broker
    - Display switch urgency banner with color coding: red for immediate, yellow for at_renewal, green for optional
    - Display urgency reason when urgency is immediate
    - _Requirements: 7.3, 7.8, 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [x] 8.3 Implement policy suggestions and portability guidance
    - Display exactly 3 policy suggestions ranked 1-3
    - Each suggestion shows: plan name, insurer name, insurer CSR, estimated premium, key improvements list
    - Display portability guidance card with PED continuity, timing window, sum insured rules, medical tests, process steps
    - Display step-by-step switching instructions
    - _Requirements: 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 8.4 Write property tests for Better Plans tab
    - **Property 25: Conditional Better Plans Tab** - Verify tab shown only when score < 75
    - **Validates: Requirements 7.1, 7.2**
  
  - [ ]* 8.5 Write unit tests for Better Plans tab
    - Test tab displayed for score 65
    - Test tab not displayed for score 80
    - Test urgency banner color for immediate/at_renewal/optional
    - Test 3 suggestions displayed with all fields
    - Test IRDAI disclaimer displayed
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.8_

- [x] 9. Create enhanced loading UI component
  - [x] 9.1 Create AnalysisLoadingUI.tsx component
    - Define AnalysisLoadingUIProps interface with currentAgent and completedAgents
    - Create agents array with 5 agents: DocumentReaderAgent, InsuranceAnalysisAgent, ClaimProbabilityAgent, PolicySuggestionAgent, DashboardUpdateAgent
    - Each agent has name, label, and icon
    - _Requirements: 8.1_
  
  - [x] 9.2 Implement agent pill status indicators
    - Display 5 agent pills in horizontal layout
    - Show in-progress state with animation for currentAgent
    - Show completed state with checkmark for completedAgents
    - Highlight current agent pill with accent color
    - Display estimated time "15-25 seconds"
    - _Requirements: 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 9.3 Write unit tests for loading UI
    - Test 5 agent pills displayed
    - Test current agent highlighted
    - Test completed agents show checkmark
    - Test estimated time displayed
    - _Requirements: 8.1, 8.4_

- [ ] 10. Update insurance page to use new loading UI
  - [ ] 10.1 Import and integrate AnalysisLoadingUI in insurance page
    - Import AnalysisLoadingUI component
    - Add state for currentAgent and completedAgents
    - Replace existing loading indicator with AnalysisLoadingUI
    - Update state as agents complete during analysis
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 11. Implement responsive design for new tabs
  - [x] 11.1 Add mobile-responsive styles to Claim Analysis tab
    - Stack probability breakdown bars vertically on mobile (<768px)
    - Adjust font sizes for readability on mobile
    - Ensure touch targets are at least 44x44 pixels
    - _Requirements: 12.1, 12.3, 12.4_
  
  - [x] 11.2 Add mobile-responsive styles to Better Plans tab
    - Display policy suggestions as single column cards on mobile (<768px)
    - Support horizontal scrolling for comparison tables on mobile
    - Adjust font sizes for readability on mobile
    - _Requirements: 12.2, 12.3, 12.5_
  
  - [ ]* 11.3 Write property tests for responsive design
    - **Property 22: Responsive Layout Adaptation** - Verify mobile layout changes
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [ ] 12. Implement data validation and quality checks
  - [ ] 12.1 Add validation functions for agent outputs
    - Implement validateClaimProbability() to ensure 0-100 range
    - Implement validateLetterGrade() to ensure A/B/C/D/F
    - Implement validatePolicySuggestion() to check required fields
    - Implement validateInsurerProfile() to check required fields
    - On validation failure, log error and use fallback values
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [ ]* 12.2 Write property tests for data validation
    - **Property 26: Data Validation with Fallbacks** - Verify fallback values used on validation failure
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5**
  
  - [ ]* 12.3 Write unit tests for validation functions
    - Test validateClaimProbability with invalid values (NaN, -10, 150)
    - Test validateLetterGrade with invalid values ("X", "a", null)
    - Test validatePolicySuggestion with missing fields
    - Test validateInsurerProfile with missing fields
    - _Requirements: 20.1, 20.2, 20.3, 20.5_

- [ ] 13. Implement performance optimizations
  - [ ] 13.1 Add insurer profile caching
    - Implement in-memory cache for insurer profiles during analysis session
    - Cache profiles after first lookup
    - Return cached profile for subsequent lookups
    - _Requirements: 14.4_
  
  - [ ] 13.2 Configure Claude model selection for agents
    - Use Claude Sonnet for ClaimProbabilityAgent (fast calculations)
    - Use Claude Sonnet for PolicySuggestionAgent (fast suggestions)
    - Use Claude Opus for InsuranceAnalysisAgent (complex analysis)
    - _Requirements: 14.5_
  
  - [ ]* 13.3 Write property tests for performance
    - **Property 21: Insurer Profile Caching** - Verify caching behavior
    - **Validates: Requirements 14.4**
  
  - [ ]* 13.4 Write performance tests
    - Test complete analysis completes within 25 seconds
    - Test parallel execution of ClaimProbabilityAgent and PolicySuggestionAgent
    - _Requirements: 14.1, 14.3_

- [x] 14. Add color-coded UI elements
  - [x] 14.1 Implement color coding for probability displays
    - Apply green (#5BE6C4) for probability ≥80%
    - Apply yellow (#FFD93D) for probability 60-79%
    - Apply red (#FF6B6B) for probability <60%
    - _Requirements: 5.2_
  
  - [x] 14.2 Implement color coding for urgency banners
    - Apply red background for immediate urgency
    - Apply yellow background for at_renewal urgency
    - Apply green background for optional urgency
    - _Requirements: 7.3_
  
  - [ ]* 14.3 Write property tests for color coding
    - **Property 23: Color-Coded Probability Display** - Verify color thresholds
    - **Property 24: Urgency Banner Color Coding** - Verify urgency colors
    - **Validates: Requirements 5.2, 7.3**

- [ ] 15. Final checkpoint - Run build and verify
  - Run TypeScript build to ensure 0 errors
  - Verify all 26 property tests pass (100 iterations each)
  - Verify all unit tests pass
  - Verify all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The system maintains backward compatibility with existing 3-agent functionality
- New agents execute conditionally based on policy score
- Error handling ensures partial results are always useful
- Responsive design ensures mobile usability for all new components
- Performance optimizations target sub-25-second analysis time
