# Insurance Module Fixes — Bugfix Design

## Overview

Three bugs in the FamLedgerAI insurance module degrade the user experience: (1) premium shows ₹0 because the extraction pipeline doesn't flow `annual_premium_equivalent` from `rulesExtractor` through `extractionOrchestrator` to `safeInsert` in `route.ts`, (2) Grade A+ renders in red instead of green because `getGradeColor` in `PolicyAnalysisModal.tsx` only checks exact `'A'` and `'A+'` falls through to the default red, and (3) Schedule of Benefits is not displayed because `BenefitsTab.tsx` lacks the section and `rulesExtractor.ts` lacks extraction patterns for additional benefit fields.

The fix strategy is:
- Add trace logging at 3 pipeline points, then fix the premium data flow so `formData.premium_amount` receives the correct annual value
- Unify `getGradeColor` across 3 files (`PolicyAnalysisModal.tsx`, `AIAnalysisTab.tsx`, `InsurerReportCardTab.tsx`) with consistent color mapping using `startsWith` checks
- Add regex patterns for 7 additional benefit fields in `rulesExtractor.ts`, pass them through the orchestrator, and add a Schedule of Benefits section in `BenefitsTab.tsx`

## Glossary

- **Bug_Condition (C)**: The set of conditions that trigger each of the three bugs — premium extraction yielding 0, grade string not matching exact check, or benefit fields not being extracted/displayed
- **Property (P)**: The desired correct behavior — premium stored as correct annual amount, grade colors matching the defined mapping, benefits displayed in the UI
- **Preservation**: Existing behaviors that must remain unchanged — direct premium extraction, single-year policies, mouse clicks, existing benefit fields (AYUSH, ambulance, NCB, restoration)
- **`rulesExtractor.ts`**: Rules-based regex extractor in `src/lib/insurance/rulesExtractor.ts` that extracts structured fields from PDF text, including `total_premium_paid` and `annual_premium_equivalent`
- **`extractionOrchestrator.ts`**: Orchestrator in `src/lib/insurance/extractionOrchestrator.ts` that coordinates extraction pipeline and builds `formData` including `premium_amount`
- **`route.ts`**: API route at `src/app/api/insurance/analyze/route.ts` that receives orchestrator output, builds `safeInsert` object, and stores policy in Supabase
- **`getGradeColor`**: Function duplicated in 3 files (`PolicyAnalysisModal.tsx`, `AIAnalysisTab.tsx`, `InsurerReportCardTab.tsx`) that maps grade strings to hex colors
- **`BenefitsTab.tsx`**: Component in `src/components/insurance/tabs/BenefitsTab.tsx` that renders benefit information in the policy analysis modal
- **`safeInsert`**: The object built in `route.ts` that is inserted into the `insurance_policies` Supabase table; has DB constraints `premium_amount > 0` and `sum_insured > 0`

## Bug Details

### Bug Condition

The bugs manifest across three independent conditions in the insurance module. Bug 1 triggers when a PDF contains a multi-year premium amount that must be divided by policy duration to get the annual equivalent. Bug 2 triggers when the AI analysis returns a grade with a `+` suffix (e.g., `A+`, `B+`). Bug 3 triggers when a PDF contains Schedule of Benefits data that has no corresponding extraction patterns or UI section.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { pdfText: string, grade: string, benefitFields: string[] }
  OUTPUT: boolean

  // Bug 1: Premium pipeline
  premiumBug := input.pdfText MATCHES /received an amount of\s*(?:₹|Rs\.?)\s*([\d,]+)/i
                AND policyDurationYears(input.pdfText) > 1
                AND extractedPremiumAmount(input.pdfText) == 0 OR == 1

  // Bug 2: Grade color
  gradeBug := input.grade IN ['A+', 'B+']
              AND getGradeColor(input.grade) == '#FF6B6B'  // red

  // Bug 3: Schedule of Benefits
  benefitsBug := input.benefitFields INTERSECT ['home_healthcare', 'domiciliary', 'organ_donor', 
                 'dental', 'daily_cash', 'plus_benefit', 'secure_benefit'] IS NOT EMPTY
                 AND extractedBenefitFields(input.pdfText) DOES NOT CONTAIN those fields

  RETURN premiumBug OR gradeBug OR benefitsBug
END FUNCTION
```

### Examples

- **Bug 1 — HDFC ERGO 3-year policy**: PDF contains "received an amount of ₹ 69,354", policy spans 2022–2025 (3 years). Expected: `premium_amount = 23118` (69354 / 3). Actual: `premium_amount = 1` (fallback) because the value doesn't flow through the pipeline correctly.
- **Bug 1 — Single-year policy**: PDF contains "received an amount of ₹ 15,000", policy spans 1 year. Expected: `premium_amount = 15000`. Actual: works correctly (no division needed, but trace logging is missing).
- **Bug 2 — Grade A+**: AI analysis returns score 93/100, grade "A+". Expected: green (`#22c55e`). Actual: red (`#FF6B6B`) in `PolicyAnalysisModal.tsx` because `grade === 'A'` doesn't match `'A+'`.
- **Bug 2 — Grade B+**: AI analysis returns score 75/100, grade "B+". Expected: teal (`#14b8a6`). Actual: red (`#FF6B6B`) because no check for `'B+'` exists.
- **Bug 3 — HDFC ERGO PDF with benefits**: PDF contains "Home Healthcare: Covered", "Organ Donor: Covered", etc. Expected: Benefits tab shows Schedule of Benefits section with these fields. Actual: fields not extracted and section not rendered.
- **Edge case — Grade exactly "A"**: Should display green. Currently works in `AIAnalysisTab.tsx` (checks `'A+' || 'A'`) but returns `#5BE6C4` in `PolicyAnalysisModal.tsx` — color should be unified to `#22c55e`.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Direct premium extraction (e.g., "Premium Amount: Rs. 15,000") must continue to use the direct path and store the correct amount
- Single-year policies must continue to use `total_premium_paid` as `annual_premium_equivalent` without division
- Grade exactly "A" (not "A+") must continue to display in green
- Benefits tab with no Schedule of Benefits data must continue to display existing Room & ICU, Core Benefits, and Additional Benefits sections without errors
- Existing premium patterns (Type A: HDFC ERGO multi-column, Type B: Star Health single total, Type D: generic) must continue to extract correctly
- When `basicFields.premiumAmount > 1`, `safeInsert` must continue to use that direct value
- Existing benefit fields (AYUSH, ambulance, NCB, restoration) must continue to display correctly

**Scope:**
All inputs that do NOT involve: (a) multi-year premium calculation, (b) grade strings with `+` suffix, or (c) the 7 new benefit fields should be completely unaffected by this fix. This includes:
- Mouse clicks and UI interactions unrelated to grade display
- PDF extraction for non-premium fields (insurer name, policy number, dates, etc.)
- The async Phase 2 AI analysis pipeline
- All other tabs in the PolicyAnalysisModal (Details, Exclusions, Claim Analysis, etc.)

## Hypothesized Root Cause

Based on code analysis, the root causes are:

1. **Bug 1 — Premium Pipeline Break**: The `extractionOrchestrator.ts` line `premium_amount: rulesResult.annual_premium_equivalent || rulesResult.total_premium_paid || 0` should work correctly IF `rulesExtractor.ts` computes `annual_premium_equivalent`. The `rulesExtractor` does compute it via `buildAnnualPremium(total_premium_paid, years)` when both `start_date` and `end_date` are present. The likely failure point is:
   - The date extraction regex fails for this specific PDF format, so `policy_duration_years` is `null`
   - Without duration, `annual_premium_equivalent` is set to `total_premium_paid` (the full 69,354 for 3 years) via the fallback `if (result.total_premium_paid && !result.annual_premium_equivalent)` block
   - But then in `route.ts`, `basicFields.premiumAmount` receives this value and the IIFE's `directPremium > 1` check passes with the wrong value (total instead of annual)
   - The lack of trace logging makes it impossible to confirm which branch is taken

2. **Bug 2 — Exact String Match**: In `PolicyAnalysisModal.tsx` (line ~1200), `getGradeColor` checks `grade === 'A'` (exact match), so `'A+'` falls through to the default `return '#FF6B6B'`. The function also lacks checks for `'B+'`, `'C'`, `'D'`. Additionally, the 3 files have inconsistent implementations:
   - `PolicyAnalysisModal.tsx`: checks `'A'` and `'B'` only → misses `A+`, `B+`, `C`, `D`
   - `AIAnalysisTab.tsx`: checks `'A+' || 'A'` and `'B'` and `'C' || 'D'` → better but inconsistent colors
   - `InsurerReportCardTab.tsx`: uses `startsWith('A')` → handles `A+` correctly but different colors

3. **Bug 3 — Missing Extraction + Missing UI**: `rulesExtractor.ts` has no regex patterns for `home_healthcare`, `domiciliary`, `organ_donor`, `dental`, `daily_cash`, `plus_benefit`, `secure_benefit`. The `RulesExtractionResult` type doesn't include these fields. `BenefitsTab.tsx` has no Schedule of Benefits section to display room_rent_type/icu_type status indicators or the additional benefits grid.

## Correctness Properties

Property 1: Bug Condition — Premium Pipeline Produces Correct Annual Amount

_For any_ PDF text containing a premium pattern (Type C: "received an amount of ₹ X") and a policy duration > 1 year, the fixed extraction pipeline SHALL compute `annual_premium_equivalent = total_premium_paid / policy_duration_years`, flow this through `formData.premium_amount`, and store it as `premium_amount` in `safeInsert` (not 0, not 1, not the undivided total).

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition — Grade Color Mapping Returns Correct Colors

_For any_ grade string, the fixed `getGradeColor` function SHALL return: `#22c55e` for `A+` or `A`, `#14b8a6` for `B+` or `B`, `#eab308` for `C`, `#f97316` for `D`, and `#ef4444` for any other value. This mapping SHALL be consistent across all 3 files.

**Validates: Requirements 2.4, 2.5, 2.6, 2.7, 2.8**

Property 3: Bug Condition — Additional Benefit Fields Extracted From PDF

_For any_ PDF text containing benefit patterns (e.g., "Home Healthcare: Covered", "Organ Donor: Covered"), the fixed `extractByRules` function SHALL extract these fields into the `RulesExtractionResult` with correct boolean values.

**Validates: Requirements 2.15**

Property 4: Bug Condition — Schedule of Benefits Displayed in UI

_For any_ analysis data containing `room_rent_type`, `icu_type`, or additional benefit fields, the fixed `BenefitsTab` component SHALL render a Schedule of Benefits section with correct status indicators (green/yellow/red) and an Additional Benefits grid.

**Validates: Requirements 2.9, 2.10, 2.11, 2.12, 2.13, 2.14**

Property 5: Preservation — Existing Premium Extraction Unchanged

_For any_ PDF text where the premium is directly extractable (single-year policy, or `basicFields.premiumAmount > 1`), the fixed pipeline SHALL produce the same `premium_amount` as the original pipeline, preserving all existing extraction patterns.

**Validates: Requirements 3.1, 3.2, 3.5, 3.6**

Property 6: Preservation — Existing Benefits Display Unchanged

_For any_ analysis data that does NOT contain the new benefit fields, the fixed `BenefitsTab` SHALL render identically to the original, preserving Room & ICU Coverage, Core Benefits, and Additional Benefits sections.

**Validates: Requirements 3.4, 3.7**

Property 7: Preservation — Grade "A" Still Green

_For any_ grade string that is exactly "A" (not "A+"), the fixed `getGradeColor` SHALL return green (`#22c55e`), preserving correct behavior for non-plus grades.

**Validates: Requirements 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `src/lib/insurance/rulesExtractor.ts`

**Function**: `extractByRules`

**Specific Changes**:
1. **Add trace logging for premium extraction**: After the Type C regex match, log the matched text, parsed amount, and confidence. After `annual_premium_equivalent` calculation, log the total, duration, and annual result.
2. **Add `RulesExtractionResult` fields**: Add `home_healthcare`, `domiciliary`, `organ_donor`, `dental`, `daily_cash`, `plus_benefit`, `secure_benefit` as `boolean | null` fields to the type.
3. **Add regex patterns for 7 benefit fields**: After the existing AYUSH/ambulance extraction block, add patterns like `/Home\s*(?:Health\s*)?Care\s*[:\-]?\s*(Covered|Not Covered)/i` for each field.
4. **Initialize new fields to `null`** in the result object.

**File 2**: `src/lib/insurance/extractionOrchestrator.ts`

**Function**: `extractInsurancePDF`

**Specific Changes**:
1. **Add trace logging for formData build**: After building `formData`, log `formData.premium_amount`, `rulesResult.annual_premium_equivalent`, and `rulesResult.total_premium_paid` so the data flow is visible.
2. **Verify premium_amount assignment**: The line `premium_amount: rulesResult.annual_premium_equivalent || rulesResult.total_premium_paid || 0` should work, but add explicit logging to confirm the values at this point.

**File 3**: `src/app/api/insurance/analyze/route.ts`

**Function**: `POST` handler (safeInsert IIFE)

**Specific Changes**:
1. **Add trace logging before safeInsert**: Immediately after `orchResult` is received, log `orchResult.formData.premium_amount`, `orchResult.analysisData.total_premium_paid`, `orchResult.analysisData.annual_premium_equivalent` to trace the raw values entering route.ts.
2. **Log each decision branch in the IIFE**: The existing `console.log('[Premium]...')` statements are good but add one at the top logging the raw `basicFields.premiumAmount` value before the `> 1` check.

**File 4**: `src/components/insurance/PolicyAnalysisModal.tsx`

**Function**: `getGradeColor` (in the `HealthOverviewTab` inner component, around line 1200)

**Specific Changes**:
1. **Fix grade color mapping**: Replace the exact-match checks with `startsWith` or inclusive checks:
   ```typescript
   const getGradeColor = (grade: string) => {
     if (grade === 'A+' || grade === 'A') return '#22c55e';
     if (grade === 'B+' || grade === 'B') return '#14b8a6';
     if (grade === 'C') return '#eab308';
     if (grade === 'D') return '#f97316';
     return '#ef4444';
   };
   ```

**File 5**: `src/components/insurance/tabs/AIAnalysisTab.tsx`

**Function**: `getGradeColor`

**Specific Changes**:
1. **Unify color mapping**: Replace existing implementation with the same mapping as File 4.

**File 6**: `src/components/insurance/tabs/InsurerReportCardTab.tsx`

**Function**: `getGradeColor`

**Specific Changes**:
1. **Unify color mapping**: Replace existing implementation with the same mapping as File 4.

**File 7**: `src/components/insurance/tabs/BenefitsTab.tsx`

**Function**: `BenefitsTab`

**Specific Changes**:
1. **Add Schedule of Benefits section**: After the Room & ICU Coverage section, add a new section that displays:
   - Room Rent status indicator: green "✅ No Room Rent Limit" for `at_actuals`, yellow "⚠️ Single Private Room Only" for `single_private`, red "🚨 Shared/General Ward Only" for other values
   - ICU status indicator: green "✅ No ICU Limit" for `at_actuals`, yellow "⚠️ ICU has a daily limit" for `capped`
2. **Add Additional Benefits grid**: Display a grid of benefit fields (Home Healthcare, Domiciliary Hosp, AYUSH Treatment, Organ Donor, Dental Treatment, Day Care, Road Ambulance, Air Ambulance, Daily Cash, E-Opinion, Plus Benefit, Secure Benefit, Automatic Restore, Cumulative Bonus) with Covered/Not Covered status.
3. **Pass new fields through**: The `analysisData` from the orchestrator needs to flow through `PolicyAnalysisModal.tsx` → `BenefitsTab` props. The `analysis.extractedFields` or `analysis.analysisData` should carry the new benefit fields.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write unit tests that exercise each bug condition on the UNFIXED code to observe failures and pinpoint the exact failure point.

**Test Cases**:
1. **Premium Pipeline Test**: Call `extractByRules` with PDF text containing "received an amount of ₹ 69,354" and dates spanning 3 years, then call `extractInsurancePDF` and verify `formData.premium_amount`. (will fail on unfixed code if dates aren't extracted)
2. **Grade Color Test — A+**: Call `getGradeColor('A+')` in `PolicyAnalysisModal.tsx` context and assert it returns green. (will fail on unfixed code — returns red)
3. **Grade Color Test — B+**: Call `getGradeColor('B+')` and assert it returns teal. (will fail on unfixed code — returns red)
4. **Benefit Extraction Test**: Call `extractByRules` with PDF text containing "Home Healthcare: Covered" and assert `home_healthcare === true`. (will fail on unfixed code — field doesn't exist)

**Expected Counterexamples**:
- `getGradeColor('A+')` returns `#FF6B6B` instead of `#22c55e`
- `formData.premium_amount` is 0 or equals the undivided total instead of the annual equivalent
- `extractByRules` result has no `home_healthcare` field

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  // Bug 1
  IF input.pdfText MATCHES premiumPattern AND duration > 1 THEN
    result := extractInsurancePDF_fixed(input.pdfText)
    ASSERT result.formData.premium_amount == total / duration
  END IF

  // Bug 2
  IF input.grade IN ['A+', 'B+'] THEN
    ASSERT getGradeColor_fixed(input.grade) != '#FF6B6B'
    ASSERT getGradeColor_fixed('A+') == '#22c55e'
    ASSERT getGradeColor_fixed('B+') == '#14b8a6'
  END IF

  // Bug 3
  IF input.benefitFields IS NOT EMPTY THEN
    result := extractByRules_fixed(input.pdfText)
    ASSERT result.home_healthcare IS NOT NULL
  END IF
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  // Premium preservation
  IF input.pdfText HAS directPremium > 1 THEN
    ASSERT extractInsurancePDF_original(input).formData.premium_amount
        == extractInsurancePDF_fixed(input).formData.premium_amount
  END IF

  // Grade preservation
  IF input.grade IN ['A', 'B', 'C', 'D', 'F'] THEN
    // Colors change (unified) but grade-to-quality mapping preserved
    ASSERT getGradeColor_fixed(input.grade) IS correct per new mapping
  END IF

  // Benefits preservation
  IF input HAS NO new benefit fields THEN
    ASSERT BenefitsTab_fixed(input) renders same sections as BenefitsTab_original(input)
  END IF
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for direct premium extraction, single-year policies, and existing benefit display, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Direct Premium Preservation**: Verify that PDFs with "Premium Amount: Rs. 15,000" continue to extract correctly after fix
2. **Single-Year Policy Preservation**: Verify that single-year policies use `total_premium_paid` as annual equivalent
3. **Existing Benefits Preservation**: Verify that AYUSH, ambulance, NCB, restoration fields continue to display correctly
4. **Grade A Preservation**: Verify that grade "A" (without +) still maps to green

### Unit Tests

- Test `getGradeColor` with all grade values: A+, A, B+, B, C, D, F, N/A, empty string
- Test `extractByRules` premium extraction with Type C pattern and multi-year duration
- Test `extractByRules` with each new benefit field pattern
- Test `safeInsert` IIFE logic with various `basicFields.premiumAmount` and `analysisData` combinations
- Test BenefitsTab rendering with room_rent_type values: at_actuals, single_private, shared
- Test BenefitsTab rendering with icu_type values: at_actuals, capped

### Property-Based Tests

- Generate random grade strings and verify `getGradeColor` returns a valid hex color from the defined set
- Generate random premium amounts and policy durations, verify `annual_premium_equivalent` is correctly computed
- Generate random combinations of benefit field presence/absence, verify BenefitsTab renders correctly
- Generate random PDF text snippets with known premium patterns, verify extraction pipeline produces correct values

### Integration Tests

- Upload an HDFC ERGO 3-year PDF and verify the stored `premium_amount` is the correct annual equivalent (₹23,118)
- Trigger AI analysis that returns grade "A+" and verify the modal displays green
- Upload a PDF with Schedule of Benefits data and verify the Benefits tab shows all extracted fields
- Verify trace logging appears at all 3 pipeline points in server console output
