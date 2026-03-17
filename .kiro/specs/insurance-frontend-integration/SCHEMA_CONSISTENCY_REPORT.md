# Final Schema Consistency Check

## Executive Summary

✅ **SCHEMA CONFIRMED** - Production uses OLD schema consistently
❌ **DESIGN DOCUMENT INCORRECT** - Must be corrected before task generation

---

## Confirmed Production Schema

### Table Names (OLD Schema - CORRECT)

| Component | Table Name | Status |
|-----------|------------|--------|
| **Policies** | `insurance_policies` | ✅ Used in production |
| **Analysis** | `insurance_analysis` | ✅ Used in production |
| **Recommendations** | `insurance_recommendations` | ✅ Used in production |

### Evidence from Codebase

**1. API Route (`/api/insurance/analyze`)** - Lines 195-275:
```typescript
// Insert policy record
.from('insurance_policies')

// Insert analysis record  
.from('insurance_analysis')

// Insert recommendations
.from('insurance_recommendations')
```

**2. Frontend Hook (`useInsurance.ts`)** - Lines 71, 115, 141, 163, 240, 255:
```typescript
.from('insurance_policies')  // All CRUD operations
.from('insurance_analysis')  // Analysis operations
```

**3. Other API Routes**:
- `/api/insurance/analyze-policy` → `insurance_policies`, `insurance_analysis`
- `/api/insurance/analysis/[policyId]` → `insurance_policies`, `insurance_analysis`
- `/api/save-insurance` → `insurance_policies`

**4. System Components**:
- `useNriReturn.ts` → `insurance_policies`
- `AlertGenerationEngine.ts` → `insurance_policies`
- `SupabaseDataLayer.ts` → `insurance_policies`
- `briefing/engine.ts` → `insurance_policies`

---

## Key Field Names (Confirmed)

### insurance_policies Table

**Core Fields**:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `household_id` (uuid, nullable)
- `policy_type` (text: health, term_life, life, etc.)
- `insurer_name` (text)
- `plan_name` (text)
- `policy_number` (text, nullable)
- `sum_insured` (numeric)
- `premium_amount` (numeric)
- `premium_frequency` (text)

**Date Fields**:
- `policy_start_date` (date) - Note: NOT `start_date`
- `policy_end_date` (date) - Note: NOT `end_date`
- `renewal_date` (date) - Note: Separate field

**Health Insurance Fields**:
- `room_rent_limit` (text/jsonb)
- `co_payment_percentage` (numeric)
- `initial_waiting_period` (integer, days)
- `specific_disease_waiting_period` (integer, days)
- `pre_existing_disease_waiting_period` (integer, days)
- `network_hospital_count` (integer)
- `restoration_benefit` (boolean/jsonb)
- `zone_classification` (text)
- `sub_limits` (jsonb)
- `exclusions` (jsonb array)

**Document Fields**:
- `file_path` (text) - Supabase storage path
- `original_filename` (text)

**Metadata**:
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### insurance_analysis Table

**Core Fields**:
- `id` (uuid, primary key)
- `policy_id` (uuid, foreign key to insurance_policies)
- `user_id` (uuid, foreign key to auth.users)

**Analysis Data** (JSONB columns):
- `risk_analysis` (jsonb) - Contains risks array with severity, type, title, description
- `policy_score` (jsonb) - Contains totalScore, grade, categoryScores
- `claim_probability` (jsonb) - Contains probability, confidence, factors
- `coverage_gap_analysis` (jsonb) - Contains currentCoverage, recommendedCoverage, gap
- `network_validation` (jsonb)
- `machine_readable_report` (jsonb) - Full PolicyReport object
- `human_readable_report` (jsonb) - Simplified report for display

**Metadata**:
- `processing_time_ms` (integer)
- `extraction_confidence` (numeric, 0-100)
- `ai_cost_usd` (numeric)
- `generated_at` (timestamptz, default now())

### insurance_recommendations Table

**Core Fields**:
- `id` (uuid, primary key)
- `policy_id` (uuid, foreign key to insurance_policies)
- `user_id` (uuid, foreign key to auth.users)
- `recommendation_text` (text)
- `priority` (text: 'high' | 'medium' | 'low')
- `category` (text: 'coverage', etc.)
- `created_at` (timestamptz)

---

## Schema Mismatch Analysis

### ❌ Design Document Uses WRONG Schema

The design document (`.kiro/specs/insurance-frontend-integration/design.md`) incorrectly references:
- `user_policies` (should be `insurance_policies`)
- `policy_analysis` (should be `insurance_analysis`)
- `recommendations` (should be `insurance_recommendations`)

### Why the Confusion?

There ARE two schemas in the migrations:

1. **OLD Schema** (migration `007_create_insurance_tables.sql`):
   - `insurance_policies`, `insurance_analysis`, `insurance_recommendations`
   - ✅ **THIS IS WHAT'S ACTUALLY USED IN PRODUCTION**

2. **NEW Schema** (migration `20250313_insurance_intelligence_mvp.sql`):
   - `user_policies`, `policy_analysis`, `recommendations`
   - ❌ **THIS WAS NEVER ADOPTED** - appears to be a proposed redesign

The API route and all frontend code use the OLD schema, confirming it's the production schema.

---

## Corrections Required

### Design Document Must Be Updated

**Section 4.2: Database Queries** - Change all references:

```diff
- FROM user_policies
+ FROM insurance_policies

- FROM policy_analysis  
+ FROM insurance_analysis

- FROM recommendations
+ FROM insurance_recommendations
```

**Section 4.3: Real-Time Subscription** - Change table name:

```diff
- table: 'policy_analysis'
+ table: 'insurance_analysis'
```

**Section 5.1: Data Models** - Update interface names:

```diff
- interface UserPolicy
+ interface InsurancePolicy

- interface PolicyAnalysis
+ interface InsuranceAnalysis
```

### Validation Report Must Be Updated

The validation report incorrectly stated the NEW schema was correct. This must be reversed.

---

## Final Confirmed Schema

### ✅ Production Tables

1. **insurance_policies**
   - Stores policy documents and extracted fields
   - Primary key: `id`
   - Foreign keys: `user_id`, `household_id`

2. **insurance_analysis**
   - Stores analysis results (risks, scores, gaps)
   - Primary key: `id`
   - Foreign keys: `policy_id`, `user_id`
   - Unique constraint: `policy_id` (one analysis per policy)

3. **insurance_recommendations**
   - Stores actionable recommendations
   - Primary key: `id`
   - Foreign keys: `policy_id`, `user_id`
   - Multiple recommendations per policy allowed

### ✅ Key Relationships

```
insurance_policies (1) ←→ (1) insurance_analysis
insurance_policies (1) ←→ (N) insurance_recommendations
```

### ✅ Query Patterns

**Fetch policy with analysis**:
```typescript
supabase
  .from('insurance_policies')
  .select(`
    *,
    insurance_analysis!inner(
      risk_analysis,
      policy_score,
      claim_probability,
      coverage_gap_analysis
    )
  `)
  .eq('user_id', userId)
```

**Fetch policy with recommendations**:
```typescript
supabase
  .from('insurance_policies')
  .select(`
    *,
    insurance_recommendations(*)
  `)
  .eq('user_id', userId)
```

**Subscribe to analysis changes**:
```typescript
supabase
  .channel('insurance_analysis_changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'insurance_analysis',
    filter: `user_id=eq.${userId}`
  }, callback)
  .subscribe()
```

---

## Action Items Before Task Generation

1. ✅ **Confirmed**: Use OLD schema (`insurance_policies`, `insurance_analysis`, `insurance_recommendations`)
2. ❌ **Must Fix**: Update design document to use correct table names
3. ❌ **Must Fix**: Update validation report to reflect correct schema
4. ✅ **Verified**: API route uses correct schema
5. ✅ **Verified**: Frontend hooks use correct schema
6. ✅ **Verified**: All system components use correct schema

---

## Conclusion

**SCHEMA CONFIRMED**: Production uses `insurance_policies`, `insurance_analysis`, `insurance_recommendations`

**DESIGN DOCUMENT STATUS**: ❌ Incorrect - must be corrected before task generation

**NEXT STEP**: Update design document, then proceed with task generation

---

**Report Date**: March 13, 2026
**Verified By**: Kiro AI Assistant
**Status**: ✅ SCHEMA CONFIRMED, ❌ DESIGN NEEDS CORRECTION
