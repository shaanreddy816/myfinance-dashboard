# Implementation Plan: Insurance Guardian System

## Overview

Implement the Insurance Guardian System as a set of pure-function engines in `src/lib/insurance/` and React components in `src/components/insurance/` and `src/components/education/`. The system covers three sub-systems: Agent Mis-Selling Detector, Claim Guidance System, and Buying Guidance. All work is within `famledgerai/famledgerai-v2/`. No existing files are modified except for wiring new components into the insurance and education page flows.

## Tasks

- [x] 0. Check for existing INSURER_DATABASE
  - [x] 0.1 Check if `INSURER_DATABASE` already exists from Insurance Intelligence System implementation. If yes: import from existing file. If no: create `src/lib/data/insurerDatabase.ts` with insurer profiles (name, CSR, network hospitals, features, premiums, contact info)
    - _Requirements: 6.1, 16.1_

- [x] 1. Create RECOMMENDED_SI lookup table and age bracket utility
  - [x] 1.1 Create `src/lib/insurance/RECOMMENDED_SI.ts` with `CityTier`, `AgeBracket` types, the `RECOMMENDED_SI` static lookup table (3 tiers × 4 brackets), `getAgeBracket(age)` function, and `getRecommendedSI(cityTier, age)` function
    - Export types: `CityTier = 'tier1' | 'tier2' | 'tier3'`, `AgeBracket = '18-35' | '36-45' | '46-55' | '56+'`
    - Tier 1: 18-35→10L, 36-45→25L, 46-55→50L, 56+→75L; Tier 2: 18-35→7.5L, 36-45→15L, 46-55→30L, 56+→50L; Tier 3: 18-35→5L, 36-45→10L, 46-55→20L, 56+→35L
    - `getAgeBracket`: 18-35 → '18-35', 36-45 → '36-45', 46-55 → '46-55', 56+ → '56+'
    - Handle edge cases: age < 18 defaults to '18-35', age > 120 defaults to '56+'
    - _Requirements: 2.4_

  - [ ]* 1.2 Write property test for age bracket mapping
    - **Property 32: Age bracket mapping correctness**
    - **Validates: Requirements 2.4**

  - [ ]* 1.3 Write unit tests for RECOMMENDED_SI
    - Test all 12 entries (3 tiers × 4 brackets)
    - Test age bracket boundaries (35→36, 45→46, 55→56)
    - Test edge cases (age < 18, age > 120)
    - _Requirements: 2.4_

  - [x] 1.4 Create shared PED list `src/lib/insurance/pedConditions.ts`
    - Export `PED_CONDITIONS` array with exact Amendment 5 list: Diabetes, Hypertension, Heart disease, Asthma, Thyroid disorder, Kidney disease, Cancer (history), Obesity, Mental health condition, None of the above
    - Import this in `claimGuide.ts`, `HospitalFlow.tsx`, `misSellDetector.ts` — single source of truth, no separate lists
    - _Requirements: 10.6, 11.4_

- [x] 2. Implement Mis-Selling Detector engine
  - [x] 2.1 Create `src/lib/insurance/misSellDetector.ts` with all types (`MisSellPattern`, `ConfidenceLevel`, `MisSellRiskLevel`, `MisSellFlag`, `MisSellResult`, `MisSellDetectorInput`, `MemberDetail`) and the `detectMisSelling` pure function implementing all 7 patterns
    - Pattern 1 (ULIP/Endowment): Check `policyType` or keyword scan in `policyText`. Calculate lost opportunity cost using 12% CAGR benchmark: `premium * ((1.12^tenure) - 1)`
    - Pattern 2 (Insufficient SI): Compare `sumInsured` against `RECOMMENDED_SI[cityTier][ageBracket]`. Project gap at 14% medical inflation over 5 years: `gap * (1.14^5)`
    - Pattern 3 (Group-only): Check `policyType === 'group'` and `otherPolicies` has no individual health policy
    - Pattern 4 (Room rent): Check `roomRentLimit.type !== 'unlimited'`. Confidence "confirmed" if limit < 1% of SI per day, else "likely"
    - Pattern 5 (Co-payment): Check `coPaymentPercentage > 0` AND NOT all members 60+. Confidence "confirmed" if ≥ 20%, "likely" if 1-19%. Skip flag if ALL members 60+
    - Pattern 6 (Low CSR): Lookup insurer in `INSURER_DATABASE`. Flag if CSR < 90% ("likely"), escalate to "confirmed" if < 80%. Skip if insurer not found (Amendment 8)
    - Pattern 7 (CI as health): Check `policyType === 'critical_illness'` or CI keywords, AND no comprehensive health policy in `otherPolicies`
    - Risk level: "none" if 0 flags, escalate through "low"/"medium"/"high" based on flag count and confidence
    - All flags labeled "potential concern", never "fraud" (Requirement 8.5)
    - Graceful null handling: skip affected patterns when fields are null, add note to result (Requirement 21.5)
    - Import `ExtractedFields` from `types.ts`, `INSURER_DATABASE` from `lib/data/insurerDatabase.ts`, `RECOMMENDED_SI` and helpers from `RECOMMENDED_SI.ts`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 8.5, 21.5, 21.7, 21.8_


  - [x] 2.2 Write property tests for Mis-Selling Detector (Properties 1-11)
    - **Property 1: ULIP/Endowment detection triggers on matching policy type or keywords**
    - **Property 2: Insufficient sum insured detection with correct confidence**
    - **Property 3: Insufficient SI financial damage includes inflation projection**
    - **Property 4: Group-only coverage detection**
    - **Property 5: Room rent capping detection with threshold-based confidence**
    - **Property 6: Co-payment detection respects all-members-60+ rule**
    - **Property 7: Low CSR detection with escalation threshold**
    - **Property 8: Critical illness as health insurance detection**
    - **Property 9: MisSellFlag structural completeness**
    - **Property 10: MisSellResult labeling constraint (no "fraud" text)**
    - **Property 11: MisSellResult risk level consistency**
    - **Validates: Requirements 1.1, 2.1, 2.2, 2.3, 3.1, 4.1, 4.2, 5.1-5.4, 6.1, 6.2, 7.1, 8.1, 8.2, 8.5**

  - [ ]* 2.3 Write unit tests for Mis-Selling Detector
    - Test each of the 7 patterns with specific ExtractedFields examples
    - Test the "no flags" case (clean policy)
    - Test with all-null optional fields (graceful handling)
    - Test unknown insurer skips CSR check (Amendment 8)
    - Test all-members-60+ skips co-payment flag (Amendment 1)
    - Test ULIP lost opportunity cost calculation (Property 33)
    - _Requirements: 1.1-1.4, 2.1-2.3, 3.1-3.3, 4.1-4.4, 5.1-5.5, 6.1-6.4, 7.1-7.3, 8.1-8.5, 21.5_

- [x] 3. Implement Claim Guide engine
  - [x] 3.1 Create `src/lib/insurance/claimGuide.ts` with all types (`ClaimGuideInput`, `ClaimGuidance`, `DocumentItem`, `PEDWarning`, `WatchOutItem`) and the `generateClaimGuidance` pure function
    - Intimation deadline: extract from policy terms or default 24h planned / 48h emergency
    - Insurer toll-free and intimation method from `InsurerProfile` (generic defaults if insurer not found)
    - Document checklist: policy copy, ID proof, admission form, doctor referral (planned), diagnostic reports, insurer-specific docs
    - Network path: cashless claim process steps, static pre-auth timeline text (Amendment 2: "Typically 2-4 hours for planned, 4-6 hours for emergency")
    - Non-network path: reimbursement process steps, original documents required
    - PED check against fixed list of 10 conditions (Amendment 5): Diabetes, Hypertension, Heart Disease, Asthma/COPD, Thyroid, Kidney, Liver/Hepatitis, Cancer, Stroke, HIV/AIDS
    - PED warning: match condition against PED list, calculate remaining waiting period from `policyStartDate`
    - Room entitlement based on `roomRentLimit`
    - Watch-out items: co-payment, sub-limits, non-payable items, room rent deduction
    - Graceful null handling for missing fields
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 21.5_

  - [ ]* 3.2 Write property tests for Claim Guide (Properties 13-15)
    - **Property 13: ClaimGuidance output completeness**
    - **Property 14: ClaimGuidance network vs non-network path**
    - **Property 15: PED warning when condition matches and waiting period not elapsed**
    - **Validates: Requirements 10.1-10.8**

  - [ ]* 3.3 Write unit tests for Claim Guide
    - Test network vs non-network paths with specific inputs
    - Test PED matching against exact 10 conditions
    - Test emergency vs planned defaults
    - Test unknown insurer uses generic defaults
    - Test null field handling
    - _Requirements: 10.1-10.8, 21.5_

- [x] 4. Checkpoint — Ensure all engine tests pass for RECOMMENDED_SI, misSellDetector, and claimGuide
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Claim Rejection Fighter engine
  - [x] 5.1 Create `src/lib/insurance/claimRejectionFighter.ts` with all types (`RejectionCategory`, `ValidityAssessment`, `RejectionAnalysis`, `EscalationStep`, `RejectionFighterInput`) and two functions: `analyzeRejection` (pure) and `generateAppealLetter` (async, Claude API)
    - `analyzeRejection`: pure function, no API calls
      - Handle all 8 rejection categories including `partial_settlement_sub_limit` (Amendment 4)
      - Late claim filing warning checked first (Amendment 9)
      - Validity assessment: valid / questionable / likely_invalid
      - Grounds to fight: reference IRDAI regulations and policyholder rights for questionable/likely_invalid
      - Escalation path: 4 steps — insurer grievance (15d), IRDAI IGMS (30d), Ombudsman (90d), Consumer court
      - Disclaimer: "informational purposes only", "cannot guarantee outcomes"
    - `generateAppealLetter`: calls Claude API via `@anthropic-ai/sdk`
      - Uses existing rate limiter from `lib/security/rateLimit.ts` or `lib/insurance/rate-limiter.ts`
      - Returns personalized template letter incorporating rejection reason, policy details, grounds, IRDAI regulations
      - Returns null on API failure (graceful degradation)
      - Letter includes note that it's a "starting point"
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 21.5, 21.10_

  - [ ]* 5.2 Write property tests for Rejection Fighter (Properties 19-22)
    - **Property 19: Rejection analysis handles all 8 categories**
    - **Property 20: Rejection analysis provides grounds for questionable/likely_invalid**
    - **Property 21: Escalation path structure (4 steps, correct order and timelines)**
    - **Property 22: Rejection fighter disclaimers**
    - **Validates: Requirements 13.1-13.7, 21.10**

  - [ ]* 5.3 Write unit tests for Rejection Fighter
    - Test each of the 8 rejection categories with specific inputs
    - Test escalation path structure (4 steps, correct contacts and timelines)
    - Test late filing warning appears first (Amendment 9)
    - Test `generateAppealLetter` with mocked Claude API
    - Test graceful API failure (returns null templateLetter)
    - _Requirements: 13.1-13.7_

  - [x] 5.4 Create API route `app/api/insurance/generate-appeal-letter/route.ts`
    - Authenticated route (check session)
    - Rate-limited via `checkRateLimit` from `lib/security/rateLimit.ts`
    - Calls `generateAppealLetter()` from `claimRejectionFighter.ts`
    - Returns generic template on Claude API failure (graceful degradation)
    - _Requirements: 13.6, 13.7, 21.10_

- [x] 6. Implement Buying Guide engine
  - [x] 6.1 Create `src/lib/insurance/buyingGuideEngine.ts` with all types (`NeedsAssessment`, `NeedsProfile`, `FeatureItem`, `PlanRecommendation`, `BuyingGuideResult`, `QuestionItem`) and three functions: `assessNeeds`, `getRecommendations`, `getQuestionsToAsk`
    - `assessNeeds`: calculate recommended SI from `RECOMMENDED_SI[cityTier][ageBracket]`, must-have features (no room rent cap, no co-payment, restore benefit, low PED waiting), red flags (high co-payment, room rent sub-limits, low CSR), estimated premium range
    - `getRecommendations`: rank insurers from `INSURER_DATABASE` using Amendment 6 formula
      - Feature match score (max 12): room rent at actuals (+3), restore/refill benefit (+3), zero co-payment (+2), PED waiting ≤2yr (+2), no sub-limits on common procedures (+1), air ambulance covered (+1)
      - Overall score: `(normalizedCSR * 0.4) + (featureMatchScore/12 * 0.4) + (premiumFit * 0.2)`
      - Return top 3 sorted by `overallScore` descending
      - Skip unknown insurers (Amendment 8)
    - `getQuestionsToAsk`: return 10+ questions with `question`, `whyItMatters`, `expectedGoodAnswer` covering room rent, co-payment, PED waiting, specific disease waiting, sub-limits, restoration, cumulative bonus, claim process, network hospitals, exclusions
    - Age brackets: 18-35, 36-45, 46-55, 56+ (Amendment 10)
    - _Requirements: 15.1, 15.2, 15.3, 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 21.11_

  - [ ]* 6.2 Write property tests for Buying Guide (Properties 23-27)
    - **Property 23: Needs assessment produces valid profile**
    - **Property 24: Recommendation ranking follows weighted formula**
    - **Property 25: Recommendation completeness**
    - **Property 26: Buying guide indicative labeling**
    - **Property 27: Questions to ask completeness (≥10 questions, all fields non-empty)**
    - **Validates: Requirements 15.3, 16.2, 16.3, 16.4, 17.1, 17.2, 21.11**

  - [ ]* 6.3 Write unit tests for Buying Guide
    - Test needs assessment with specific inputs and known expected SI
    - Test recommendation ranking with known insurer data and verify sort order
    - Test feature match scoring formula with known values
    - Test `getQuestionsToAsk` returns ≥10 questions with all fields populated
    - _Requirements: 15.1-15.3, 16.1-16.4, 17.1-17.2_

- [x] 7. Checkpoint — Ensure all engine tests pass for all 5 engine modules
  - Ensure all tests pass, ask the user if questions arise.


- [x] 8. Implement MisSellAlert UI component
  - [x] 8.1 Create `src/components/insurance/MisSellAlert.tsx`
    - Props: `{ result: MisSellResult }`
    - Render nothing if `result.flagCount === 0`
    - Red `#E85D75` banner background with dark theme styling
    - Each flag: pattern name, confidence badge (red=confirmed, orange `#FF9933`=likely, muted=possible), agent claim vs reality two-column layout, financial damage, user rights, expandable action steps
    - IRDAI complaint info: IGMS portal URL, toll-free 155255, email igms@irdai.gov.in
    - Include `<LegalDisclaimer type="insurance" />`
    - PostHog event: `missell_detected` with `{ flagCount, highestConfidence }` — no PII
    - Dark theme: `#0D1120` bg, Playfair Display headings, DM Sans body
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 20.1_

  - [ ]* 8.2 Write property test for MisSellAlert conditional rendering
    - **Property 12: MisSellAlert conditional rendering (renders when flagCount > 0, null when 0)**
    - **Validates: Requirements 9.1, 9.5**

- [x] 9. Implement HospitalFlow UI component
  - [x] 9.1 Create `src/components/insurance/HospitalFlow.tsx` — 5-screen guided flow
    - Props: `{ policies?: ExtractedFields[], onComplete?: () => void }`
    - Screen 1: Select Policy — show policy selector or manual entry form if no policies (Amendment 7)
    - Screen 2: Planned or Emergency — emergency shows toll-free prominently
    - Screen 3: Hospital Name — show insurer's network hospital URL, user confirms network/non-network. Green `#5BE6C4` for network, red `#E85D75` for non-network. No API check (Amendment 3)
    - Screen 4: Condition — check against PED list (10 conditions, Amendment 5). Show PED coverage status
    - Screen 5: Personalized Checklist — full `ClaimGuidance` output: intimation deadline, document checklist with checkboxes, room entitlement, static pre-auth timeline (Amendment 2), watch-out items, phone numbers
    - "I'm Going to Hospital" button: `#E85D75` red bg, min 48px height, high contrast, large touch target (Requirement 21.14)
    - PostHog event at each screen: `hospital_flow_screen` with `{ screen, hospitalType, admissionType }` — hospital name NEVER included (Amendment 11)
    - Call `generateClaimGuidance` from `claimGuide.ts` on Screen 5
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 20.2, 21.14_

  - [x] 9.2 Write property test for PostHog events never containing hospital name
    - **Property 31: PostHog events never contain hospital name**
    - **Validates: Requirements 11.8, 20.2**

- [x] 10. Implement ClaimFilingAssistant UI component
  - [x] 10.1 Create `src/components/insurance/ClaimFilingAssistant.tsx` — 5-step reimbursement flow
    - Props: `{ extractedFields: ExtractedFields, insurerProfile?: InsurerProfile }`
    - Step 1: Eligibility Check — late claim filing warning first (Amendment 9), then check waiting periods, coverage dates, exclusions. Clear eligible/not-eligible result with reason
    - Step 2: Document Checklist Generator — insurer-specific checklist from `InsurerProfile`
    - Step 3: Claim Amount Calculator — apply deductions: co-payment %, room rent proportionate deduction, sub-limit caps, non-payable items estimate, deductible. Show each line item. All amounts labeled "estimates — actual settlement may vary"
    - Step 4: Submission Guide — method (online/email/physical), address, timelines (15-30 days from discharge)
    - Step 5: Claim Tracking Reminder — follow up after 30 days, grievance cell contact
    - PostHog event per step: `claim_filing_step` with `{ step, completionStatus }`
    - Dark theme styling, Playfair Display headings, DM Sans body
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 20.3, 21.9_

  - [x] 10.2 Write property tests for Claim Filing (Properties 16-18)
    - **Property 16: Claim eligibility check correctness**
    - **Property 17: Claim amount calculator deduction correctness**
    - **Property 18: Claim amount estimates labeling**
    - **Validates: Requirements 12.2, 12.4, 12.5, 21.9**

- [x] 11. Checkpoint — Ensure all tests pass for MisSellAlert, HospitalFlow, and ClaimFilingAssistant
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement ClaimRejectionFighter UI component
  - [x] 12.1 Create `src/components/insurance/ClaimRejectionFighter.tsx`
    - Props: `{ policies?: ExtractedFields[] }`
    - Form: policy selection, rejection reason (free text or dropdown of 8 categories including `partial_settlement_sub_limit`), rejection letter text, claim amount, hospital name
    - Results: rejection category, validity badge (green `#5BE6C4` = likely_invalid, orange `#FF9933` = questionable, red `#E85D75` = valid), grounds to fight, escalation path as visual timeline (4 steps), template letter in copyable textarea with "Copy to Clipboard" button
    - Call `analyzeRejection` (client-side) then `generateAppealLetter` (server-side via API route) with loading state
    - Include `<LegalDisclaimer type="insurance" />`
    - PostHog event: `rejection_fighter_submitted` with `{ rejectionCategory, validity }` — hospital name NEVER included (Amendment 11)
    - Handle Claude API failure gracefully: show analysis without letter, display retry message
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 20.4, 21.10_

- [x] 13. Implement BuyingGuide UI component
  - [x] 13.1 Create `src/components/insurance/BuyingGuide.tsx` — 4-step guided buying flow
    - Props: `{ insurerDatabase: InsurerProfile[] }`
    - Step 1: Needs Assessment — 6 questions: coverage status (none/employer-only/individual), age of primary member, PEDs (list selection), city of residence (tier classification), monthly budget, family member count. Age brackets: 18-35, 36-45, 46-55, 56+ (Amendment 10)
    - Step 2: Recommended Profile — recommended SI, must-have features, red flags, estimated premium range
    - Step 3: Top 3 Recommendations — ranked by Amendment 6 formula (CSR 40% + Feature 40% + Premium 20%). Each: insurer name, plan, SI options, features, CSR, network hospitals, indicative premium. All premiums labeled "indicative — get actual quotes"
    - Step 4: Questions to Ask Agent — 10+ questions with why-it-matters and expected good answer. "Print Checklist" button using `window.print()` with print CSS (`@media print` rules: white bg, hide nav/buttons, show only checklist content)
    - Include `<LegalDisclaimer type="insurance" />`
    - PostHog event: `buying_guide_completed` with `{ cityTier, ageBracket, budgetRange }` — no PII
    - Call `assessNeeds`, `getRecommendations`, `getQuestionsToAsk` from `buyingGuideEngine.ts`
    - _Requirements: 15.1, 15.2, 15.3, 16.1, 16.2, 16.3, 16.4, 16.5, 17.1, 17.2, 17.3, 17.4, 20.5, 21.11_

- [x] 14. Implement AgentAccountabilityScore UI component
  - [x] 14.1 Create `src/components/insurance/AgentAccountabilityScore.tsx`
    - Props: `{ policyId: string }`
    - Survey: purchase channel (agent/online/bank/employer), agent explained room rent (yes/no/na), co-payment (yes/no/na), waiting periods (yes/no/na), exclusions (yes/no/na)
    - Storage: localStorage keyed by SHA-256 hash of policyId (via `crypto.subtle.digest` with simple string hash fallback if SubtleCrypto unavailable). No PII stored. No server transmission
    - Social proof display: % where agents didn't explain room rent, % didn't explain co-payment, total surveys on device
    - Never names specific agents or companies
    - Wrap localStorage operations in try/catch (handle full/unavailable localStorage gracefully)
    - PostHog event: `accountability_survey_submitted` with `{ purchaseChannel }` only — no individual responses
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 20.7, 21.12_

  - [ ]* 14.2 Write property tests for Agent Accountability Score (Properties 28-29)
    - **Property 28: Accountability survey localStorage round-trip**
    - **Property 29: Social proof statistics correctness**
    - **Validates: Requirements 18.2, 18.3, 21.12**

- [x] 15. Implement MisSellingEducationTab component
  - [x] 15.1 Create `src/components/education/MisSellingEducationTab.tsx`
    - Props: `{ activeTab: string }`
    - Section 1: "7 Lies Insurance Agents Tell" — each lie: agent's claim, reality, how to verify
    - Section 2: "Real Claim Rejection Stories" — 5 illustrative scenarios: situation, what went wrong, outcome, lesson learned
    - Section 3: "IRDAI Rights" — free-look period (15-30 days), portability, grievance redressal, claim settlement timelines (FY2024-25)
    - Section 4: "Downloadable Claim Checklist" — printable via `window.print()` with print-specific CSS (`@media print` rules: white bg, hide nav/buttons, show only checklist content)
    - Match existing education tab visual style (dark theme, same Section/Callout patterns as `TaxSavingEducationTab.tsx`)
    - PostHog event: `misselling_education_viewed` with `{ section }`
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 20.6_

- [x] 16. Checkpoint — Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Integration and wiring
  - [x] 17.1 Wire MisSellAlert into the insurance analysis flow
    - Import `MisSellAlert` and `detectMisSelling` into the insurance analysis page/modal
    - Call `detectMisSelling` with `ExtractedFields`, policy text, policyholder age, city tier, and other policies
    - Derive `cityTier` from user profile city (map known metros to tier1, known cities to tier2, default `'tier2'` if unknown)
    - Render `MisSellAlert` above regular policy analysis content
    - _Requirements: 9.1, 9.5_

  - [x] 17.2 Add "I'm Going to Hospital" button in 3 places (Amendment 7)
    - Add the red emergency button to: insurance page header, policy card actions, and a floating emergency button
    - Button: `#E85D75` red bg, min 48px height, high contrast, large touch target
    - Each button opens the `HospitalFlow` component, passing available policies
    - _Requirements: 11.7, 21.14_

  - [x] 17.3 Add "Mis-Selling Guide" sub-tab to the Education Center
    - Wire `MisSellingEducationTab` into the existing education page tab navigation alongside existing tabs (TaxSaving, Investments, Budgeting, etc.)
    - _Requirements: 19.1_

  - [x] 17.4 Add "Help Me Buy New Insurance" option to the insurance module
    - Wire `BuyingGuide` component into the insurance section, passing `INSURER_DATABASE` as `insurerDatabase` prop
    - _Requirements: 15.1_

  - [x] 17.5 Wire Rejection Fighter into the insurance/claims section
    - Add `ClaimRejectionFighter` component to the insurance claims area, passing available policies
    - Add `ClaimFilingAssistant` component accessible from the claims section
    - Wire `AgentAccountabilityScore` into policy analysis view with the policy ID
    - _Requirements: 14.1, 12.1, 18.1_

  - [ ]* 17.6 Write property test for graceful null handling across all engines
    - **Property 30: Graceful handling of missing/null input fields**
    - **Validates: Requirements 21.5**

- [x] 18. Final checkpoint — Ensure all tests pass and all components render correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major phase
- Property tests validate universal correctness properties from the design document
- All engine modules are pure functions (except `generateAppealLetter` which calls Claude API)
- No existing files are modified except for wiring in Task 17
- All UI components use the dark theme: `#0D1120` bg, `#FF9933` orange, `#5BE6C4` green, `#E85D75` red
- All premiums/amounts labeled as "indicative" or "estimates" per requirements
- Hospital name is NEVER sent in PostHog events (Amendment 11)
