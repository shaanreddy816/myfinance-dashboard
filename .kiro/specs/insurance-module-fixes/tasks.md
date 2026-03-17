# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Insurance Module Triple Bug (Premium Pipeline, Grade Color, Benefit Extraction)
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate all three bugs exist
  - **Scoped PBT Approach**: Scope properties to concrete failing cases for reproducibility
  - **Bug 1 — Premium Pipeline**: Call `extractByRules` with PDF text containing "received an amount of ₹ 69,354" and dates spanning 3 years (2022–2025). Assert `annual_premium_equivalent === 23118` (69354 / 3). From `isBugCondition`: `pdfText MATCHES /received an amount of\s*(?:₹|Rs\.?)\s*([\d,]+)/i AND policyDurationYears > 1`
  - **Bug 2 — Grade Color A+**: Call `getGradeColor('A+')` and assert it returns `#22c55e` (green). From `isBugCondition`: `grade IN ['A+', 'B+'] AND getGradeColor(grade) == '#FF6B6B'`
  - **Bug 2 — Grade Color B+**: Call `getGradeColor('B+')` and assert it returns `#14b8a6` (teal)
  - **Bug 3 — Benefit Extraction**: Call `extractByRules` with PDF text containing "Home Healthcare: Covered", "Organ Donor: Covered". Assert `home_healthcare === true` and `organ_donor === true`. From `isBugCondition`: `benefitFields INTERSECT new fields IS NOT EMPTY AND extractedBenefitFields DOES NOT CONTAIN those fields`
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found:
    - `getGradeColor('A+')` returns `#FF6B6B` instead of `#22c55e`
    - `getGradeColor('B+')` returns `#FF6B6B` instead of `#14b8a6`
    - `extractByRules` result has no `home_healthcare` field
    - `annual_premium_equivalent` is incorrect for multi-year policies
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 2.1, 2.4, 2.5, 2.15_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Premium, Grade, and Benefits Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - **Step 1 — Observe on UNFIXED code**:
    - Observe: `getGradeColor('A')` returns green on unfixed code (in `AIAnalysisTab.tsx`)
    - Observe: `getGradeColor('B')` returns a non-red color on unfixed code
    - Observe: Direct premium extraction ("Premium Amount: Rs. 15,000") stores `premium_amount = 15000`
    - Observe: Single-year policy uses `total_premium_paid` as `annual_premium_equivalent`
    - Observe: Existing benefit fields (AYUSH, ambulance, NCB, restoration) render correctly in BenefitsTab
    - Observe: BenefitsTab with no Schedule of Benefits data renders Room & ICU, Core Benefits, Additional Benefits sections without errors
  - **Step 2 — Write property-based tests capturing observed behavior**:
    - Property: For all grade strings in `['A', 'B', 'C', 'D', 'F']` (non-plus grades), `getGradeColor` returns a valid hex color from the defined set (not `#FF6B6B` for A/B)
    - Property: For all PDFs with `basicFields.premiumAmount > 1`, `safeInsert` uses that direct value
    - Property: For all single-year policies, `annual_premium_equivalent === total_premium_paid`
    - Property: For all analysis data without new benefit fields, BenefitsTab renders existing sections unchanged
    - Property: Existing benefit fields (AYUSH, ambulance, NCB, restoration) continue to display correctly
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix Bug 2 — Unify getGradeColor across 3 files

  - [x] 3.1 Fix `getGradeColor` in `src/components/insurance/PolicyAnalysisModal.tsx`
    - Replace exact-match checks with unified mapping:
      - `'A+' || 'A'` → `#22c55e` (green)
      - `'B+' || 'B'` → `#14b8a6` (teal)
      - `'C'` → `#eab308` (yellow)
      - `'D'` → `#f97316` (orange)
      - default → `#ef4444` (red)
    - _Bug_Condition: grade IN ['A+', 'B+'] AND getGradeColor(grade) == '#FF6B6B'_
    - _Expected_Behavior: getGradeColor('A+') == '#22c55e', getGradeColor('B+') == '#14b8a6'_
    - _Preservation: Grade 'A' still returns green, Grade 'B' still returns non-red_
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8, 3.3_

  - [x] 3.2 Unify `getGradeColor` in `src/components/insurance/tabs/AIAnalysisTab.tsx`
    - Replace existing implementation with the same unified mapping as 3.1
    - _Bug_Condition: inconsistent color mapping across files_
    - _Expected_Behavior: identical mapping to PolicyAnalysisModal.tsx_
    - _Preservation: existing grade display behavior preserved_
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.3 Unify `getGradeColor` in `src/components/insurance/tabs/InsurerReportCardTab.tsx`
    - Replace existing implementation with the same unified mapping as 3.1
    - _Bug_Condition: inconsistent color mapping across files_
    - _Expected_Behavior: identical mapping to PolicyAnalysisModal.tsx_
    - _Preservation: existing grade display behavior preserved_
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.4 Verify bug condition exploration test for grade color now passes
    - **Property 1: Expected Behavior** - Grade Color Mapping
    - **IMPORTANT**: Re-run the SAME grade color tests from task 1 — do NOT write new tests
    - `getGradeColor('A+')` should now return `#22c55e`
    - `getGradeColor('B+')` should now return `#14b8a6`
    - **EXPECTED OUTCOME**: Grade color tests PASS (confirms bug is fixed)
    - _Requirements: 2.4, 2.5_

  - [x] 3.5 Verify preservation tests for grade colors still pass
    - **Property 2: Preservation** - Grade Color Preservation
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 — do NOT write new tests
    - `getGradeColor('A')` still returns green, `getGradeColor('B')` still returns teal
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.3_

- [x] 4. Fix Bug 1 — Premium Pipeline with Trace Logging

  - [x] 4.1 Add trace logging in `src/lib/insurance/rulesExtractor.ts`
    - After Type C regex match: log matched text, parsed amount, confidence
    - After `annual_premium_equivalent` calculation: log total, duration, annual result
    - After `buildAnnualPremium`: log input total, years, and computed annual value
    - _Bug_Condition: pdfText MATCHES premium pattern AND duration > 1 AND premium == 0 or 1_
    - _Expected_Behavior: trace logs visible at extraction point_
    - _Requirements: 2.2_

  - [x] 4.2 Add trace logging in `src/lib/insurance/extractionOrchestrator.ts`
    - After building `formData`: log `formData.premium_amount`, `rulesResult.annual_premium_equivalent`, `rulesResult.total_premium_paid`
    - Verify the `premium_amount: rulesResult.annual_premium_equivalent || rulesResult.total_premium_paid || 0` assignment
    - _Bug_Condition: premium data lost between extractor and orchestrator_
    - _Expected_Behavior: trace logs visible at orchestrator formData build_
    - _Requirements: 2.2_

  - [x] 4.3 Add trace logging in `src/app/api/insurance/analyze/route.ts`
    - Immediately after `orchResult` is received: log `orchResult.formData.premium_amount`, `orchResult.analysisData.total_premium_paid`, `orchResult.analysisData.annual_premium_equivalent`
    - Log each decision branch in the safeInsert IIFE: raw `basicFields.premiumAmount` before the `> 1` check
    - _Bug_Condition: premium data lost between orchestrator and safeInsert_
    - _Expected_Behavior: trace logs visible at route.ts before safeInsert_
    - _Requirements: 2.2, 2.3_

  - [x] 4.4 Fix premium data flow so `formData.premium_amount` receives correct annual value
    - Ensure `rulesExtractor.ts` correctly computes `annual_premium_equivalent = total_premium_paid / policy_duration_years` for multi-year policies
    - Ensure `extractionOrchestrator.ts` passes `annual_premium_equivalent` through to `formData.premium_amount`
    - Ensure `route.ts` safeInsert IIFE correctly uses the value
    - _Bug_Condition: isBugCondition(input) where pdfText has Type C premium AND duration > 1_
    - _Expected_Behavior: premium_amount = total_premium_paid / policy_duration_years (e.g., 69354 / 3 = 23118)_
    - _Preservation: Direct premium extraction (premiumAmount > 1) unchanged, single-year policies unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.5, 3.6_

  - [x] 4.5 Verify bug condition exploration test for premium pipeline now passes
    - **Property 1: Expected Behavior** - Premium Pipeline
    - **IMPORTANT**: Re-run the SAME premium pipeline test from task 1 — do NOT write new tests
    - `annual_premium_equivalent` should now be `23118` for the 3-year HDFC ERGO policy
    - **EXPECTED OUTCOME**: Premium pipeline test PASSES (confirms bug is fixed)
    - _Requirements: 2.1_

  - [x] 4.6 Verify preservation tests for premium extraction still pass
    - **Property 2: Preservation** - Premium Extraction Preservation
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 — do NOT write new tests
    - Direct premium extraction and single-year policies still work correctly
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

- [x] 5. Fix Bug 3 — Benefit Extraction and Schedule of Benefits Display

  - [x] 5.1 Add 7 benefit field types and regex patterns in `src/lib/insurance/rulesExtractor.ts`
    - Add to `RulesExtractionResult` type: `home_healthcare`, `domiciliary`, `organ_donor`, `dental`, `daily_cash`, `plus_benefit`, `secure_benefit` as `boolean | null`
    - Initialize new fields to `null` in the result object
    - Add regex patterns after existing AYUSH/ambulance extraction block:
      - `/Home\s*(?:Health\s*)?Care\s*[:\-]?\s*(Covered|Not Covered)/i`
      - `/Domiciliary\s*(?:Hosp(?:itali[sz]ation)?)?\s*[:\-]?\s*(Covered|Not Covered)/i`
      - `/Organ\s*Donor\s*[:\-]?\s*(Covered|Not Covered)/i`
      - `/Dental\s*(?:Treatment)?\s*[:\-]?\s*(Covered|Not Covered)/i`
      - `/Daily\s*(?:Cash|Allowance)\s*[:\-]?\s*(Covered|Not Covered)/i`
      - `/Plus\s*Benefit\s*[:\-]?\s*(Covered|Not Covered)/i`
      - `/Secure\s*Benefit\s*[:\-]?\s*(Covered|Not Covered)/i`
    - _Bug_Condition: benefitFields INTERSECT new fields IS NOT EMPTY AND extractedBenefitFields DOES NOT CONTAIN those fields_
    - _Expected_Behavior: extractByRules returns boolean values for each new benefit field_
    - _Preservation: Existing AYUSH, ambulance, NCB, restoration extraction unchanged_
    - _Requirements: 2.15, 3.7_

  - [x] 5.2 Add Schedule of Benefits section in `src/components/insurance/tabs/BenefitsTab.tsx`
    - Add Room Rent status indicator: green "✅ No Room Rent Limit" for `at_actuals`, yellow "⚠️ Single Private Room Only" for `single_private`, red "🚨 Shared/General Ward Only" for other values
    - Add ICU status indicator: green "✅ No ICU Limit" for `at_actuals`, yellow "⚠️ ICU has a daily limit" for `capped`
    - Add Additional Benefits grid displaying: Home Healthcare, Domiciliary Hosp, AYUSH Treatment, Organ Donor, Dental Treatment, Day Care, Road Ambulance, Air Ambulance, Daily Cash, E-Opinion, Plus Benefit, Secure Benefit, Automatic Restore, Cumulative Bonus — each with Covered/Not Covered status
    - Ensure `analysisData` flows through `PolicyAnalysisModal.tsx` → `BenefitsTab` props with new benefit fields
    - _Bug_Condition: analysis data contains room_rent_type, icu_type, or additional benefit fields but no UI section renders them_
    - _Expected_Behavior: Schedule of Benefits section renders with correct status indicators and Additional Benefits grid_
    - _Preservation: Existing Room & ICU Coverage, Core Benefits, Additional Benefits sections render unchanged when no Schedule of Benefits data present_
    - _Requirements: 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 3.4, 3.7_

  - [x] 5.3 Verify bug condition exploration test for benefit extraction now passes
    - **Property 1: Expected Behavior** - Benefit Extraction
    - **IMPORTANT**: Re-run the SAME benefit extraction test from task 1 — do NOT write new tests
    - `extractByRules` should now return `home_healthcare === true` and `organ_donor === true` for matching PDF text
    - **EXPECTED OUTCOME**: Benefit extraction test PASSES (confirms bug is fixed)
    - _Requirements: 2.15_

  - [x] 5.4 Verify preservation tests for benefits display still pass
    - **Property 2: Preservation** - Benefits Display Preservation
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 — do NOT write new tests
    - Existing benefit fields (AYUSH, ambulance, NCB, restoration) still display correctly
    - BenefitsTab with no Schedule of Benefits data still renders existing sections
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.4, 3.7_

- [x] 6. Run TypeScript check
  - Run `npx tsc --noEmit` to verify no type errors across the codebase
  - Fix any type errors introduced by the changes
  - _Requirements: all_

- [-] 7. Git commit and deploy
  - Stage all changed files
  - Commit with message: "fix: insurance module — premium pipeline, grade colors, schedule of benefits"
  - Deploy to Vercel (or user's deployment target)
  - _Requirements: all_

- [~] 8. Checkpoint — Ensure all tests pass
  - Ensure all exploration tests (task 1) now pass after fixes
  - Ensure all preservation tests (task 2) still pass after fixes
  - Ensure TypeScript check passes (task 6)
  - Ensure deployment succeeds (task 7)
  - Ask the user if questions arise
