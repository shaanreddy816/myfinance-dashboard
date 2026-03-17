# Bugfix Requirements Document

## Introduction

Three bugs in the FamLedgerAI insurance module are causing incorrect premium storage, wrong grade colors in the AI Analysis view, and missing Schedule of Benefits display. These bugs degrade the user experience: premiums show ₹0 despite correct PDF data, Grade A+ renders in red instead of green, and extracted benefit details are not surfaced to users.

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 — Premium shows ₹0**

1.1 WHEN a PDF contains the text "received an amount of ₹ 69,354" and the policy spans 3 years THEN the system stores `premium_amount = 1` (fallback) in the database because the extracted premium data does not flow from the orchestrator through `basicFields.premiumAmount` to the `safeInsert` object correctly

1.2 WHEN the `extractionOrchestrator.ts` builds `formData.premium_amount` from `rulesResult.annual_premium_equivalent` THEN the system does not log the intermediate values (regex match, parsed amount, annual calculation) making it impossible to trace where the data is lost

1.3 WHEN `safeInsert` in `route.ts` evaluates `basicFields.premiumAmount` and it is 0 or NaN THEN the system falls back to `analysisData` fields but those fields also fail silently without diagnostic logging

**Bug 2 — Grade A+ shows red**

1.4 WHEN the AI analysis returns grade "A+" with score 93/100 THEN the `getGradeColor` function in `PolicyAnalysisModal.tsx` returns `#FF6B6B` (red) because it only checks for exact match `'A'` and `'A+'` falls through to the default red return

1.5 WHEN grade is "B+" THEN the system also falls through to red because `getGradeColor` only checks exact `'B'`

**Bug 3 — Schedule of Benefits not displayed**

1.6 WHEN a PDF contains Schedule of Benefits data (room rent type, ICU type, home healthcare, domiciliary, organ donor, dental, daily cash, plus benefit, secure benefit) THEN the system does not display this information in the Benefits tab because `BenefitsTab.tsx` lacks a Schedule of Benefits section

1.7 WHEN `rulesExtractor.ts` processes a PDF THEN the system does not extract additional benefit fields (home_healthcare, domiciliary, organ_donor, dental, daily_cash, plus_benefit, secure_benefit) because no regex patterns exist for them

### Expected Behavior (Correct)

**Bug 1 — Premium extraction with full trace logging**

2.1 WHEN a PDF contains "received an amount of ₹ 69,354" and the policy spans 3 years THEN the system SHALL extract `total_premium_paid = 69354` via the regex `/received an amount of\s*(?:₹|Rs\.?)\s*([\d,]+)/i`, compute `annual_premium_equivalent = 23118` (69354 / 3), flow this through `formData.premium_amount = 23118`, and store `premium_amount = 23118` in the database

2.2 WHEN the extraction pipeline runs THEN the system SHALL log at three trace points: (a) in `rulesExtractor.ts` — the regex match result and parsed premium values, (b) in `extractionOrchestrator.ts` — the `formData` being built including `premium_amount`, (c) in `route.ts` — the raw orchestrator result premium fields (`total_premium_paid`, `annual_premium_equivalent`, `formData.premium_amount`) immediately after the orchestrator returns

2.3 WHEN `safeInsert` evaluates premium THEN the system SHALL log each decision branch (direct extraction value, analysisData values, calculated value, or fallback) so the exact path taken is visible in server logs

**Bug 2 — Grade color mapping**

2.4 WHEN grade is "A+" or "A" THEN the system SHALL display the grade text, circular gauge stroke, and grade badge in green (`#22c55e`)

2.5 WHEN grade is "B+" or "B" THEN the system SHALL display in teal (`#14b8a6`)

2.6 WHEN grade is "C" THEN the system SHALL display in yellow (`#eab308`)

2.7 WHEN grade is "D" THEN the system SHALL display in orange (`#f97316`)

2.8 WHEN grade is any other value (F, N/A, etc.) THEN the system SHALL display in red (`#ef4444`)

**Bug 3 — Schedule of Benefits display**

2.9 WHEN `room_rent_type` is "at_actuals" THEN the Benefits tab SHALL display "✅ No Room Rent Limit" styled in green

2.10 WHEN `room_rent_type` is "single_private" THEN the Benefits tab SHALL display "⚠️ Single Private Room Only" styled in yellow

2.11 WHEN `room_rent_type` is "shared" or any other capped value THEN the Benefits tab SHALL display "🚨 Shared/General Ward Only" styled in red

2.12 WHEN `icu_type` is "at_actuals" THEN the Benefits tab SHALL display "✅ No ICU Limit" styled in green

2.13 WHEN `icu_type` is "capped" THEN the Benefits tab SHALL display "⚠️ ICU has a daily limit" styled in yellow

2.14 WHEN additional benefit fields are present in the extracted data THEN the Benefits tab SHALL display an "Additional Benefits" grid showing: Home Healthcare, Domiciliary Hosp, AYUSH Treatment, Organ Donor, Dental Treatment, Day Care, Road Ambulance, Air Ambulance, Daily Cash, E-Opinion, Plus Benefit, Secure Benefit, Automatic Restore, Cumulative Bonus — each with Covered/Not Covered status

2.15 WHEN `rulesExtractor.ts` processes a PDF THEN the system SHALL extract additional benefit fields (home_healthcare, domiciliary, organ_donor, dental, daily_cash_shared_room, plus_benefit, secure_benefit) using appropriate regex patterns

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a PDF has a directly extractable premium (e.g., "Premium Amount: Rs. 15,000") THEN the system SHALL CONTINUE TO use the direct extraction path and store the correct premium amount

3.2 WHEN a PDF has a single-year policy period THEN the system SHALL CONTINUE TO use `total_premium_paid` as the `annual_premium_equivalent` without division

3.3 WHEN grade is exactly "A" (not "A+") THEN the system SHALL CONTINUE TO display in green (now `#22c55e` instead of `#5BE6C4`, but still green)

3.4 WHEN the Benefits tab receives a policy with no Schedule of Benefits data THEN the system SHALL CONTINUE TO display the existing Room & ICU Coverage, Core Benefits, and Additional Benefits sections without errors

3.5 WHEN `rulesExtractor.ts` processes existing premium patterns (Type A: HDFC ERGO multi-column, Type B: Star Health single total, Type D: generic) THEN the system SHALL CONTINUE TO extract premiums correctly via those patterns

3.6 WHEN `safeInsert` receives a valid `basicFields.premiumAmount > 1` THEN the system SHALL CONTINUE TO use that direct value without consulting `analysisData` fallbacks

3.7 WHEN the existing benefit fields (AYUSH, ambulance, NCB, restoration) are extracted THEN the system SHALL CONTINUE TO display them correctly in the Benefits tab
