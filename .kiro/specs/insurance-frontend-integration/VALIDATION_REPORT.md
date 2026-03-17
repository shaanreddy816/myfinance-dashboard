# Requirements Validation Report

## Executive Summary

**Status**: ✅ Requirements validated with 1 CRITICAL issue identified and corrected

**Date**: 2024-03-15

**Validator**: Design Phase Pre-work

## Critical Findings

### 1. Database Schema Mismatch (CRITICAL)

**Issue**: Requirements document references OLD database schema that doesn't match the actual implementation.

**Requirements Referenced**:
- `insurance_policies` table
- `insurance_analysis` table  
- `insurance_recommendations` table

**Actual Schema** (from `20250313_insurance_intelligence_mvp.sql`):
- ✅ `user_policies` table (NOT `insurance_policies`)
- ✅ `policy_analysis` table (NOT `insurance_analysis`)
- ✅ `recommendations` table (NOT `insurance_recommendations`)

**Impact**: HIGH - Frontend queries would fail if using incorrect table names

**Resolution**: Design document will use correct schema names throughout

---

## Pipeline Progress Display

**Finding**: Requirements specify "real-time stage-by-stage progress" but API doesn't support streaming

**Requirements**:
- Requirement 2.1: "display a progress indicator showing all 7 Pipeline_Stages"
- Requirement 2.2: "highlight the current stage with an 'in progress' visual state"

**API Reality** (from API.md):
- Pipeline executes synchronously (2-3 seconds total)
- No streaming or progress events
- Returns complete result with stage durations after completion

**Resolution**: 
- Show indeterminate spinner during execution
- Display stage breakdown AFTER completion using `stages` array in response
- Update requirements interpretation in design

---

## API Response Format Validation

**Status**: ✅ VALIDATED - API response format is correct and comprehensive

**Confirmed Fields**:
```typescript
{
  success: boolean,
  status: 'success' | 'partial_success',
  policyId: string,
  analysisId: string,
  data: {
    report: { ... },
    extractedFields: { ... },
    riskAnalysis: { ... },
    policyScore: { totalScore, grade, ... },
    claimProbability: { ... },
    coverageGapAnalysis: { ... }
  },
  stages: StageStatus[],
  metadata: { totalDuration, startTime, endTime, ... }
}
```

**No Issues Found**

---

## Real-Time Subscriptions Approach

**Status**: ✅ SOUND APPROACH

**Requirements**:
- Requirement 5: Subscribe to `insurance_analysis` table for real-time updates

**Validation**:
- ✅ Correct table: `policy_analysis` (not `insurance_analysis`)
- ✅ Supabase real-time subscriptions supported
- ✅ Filter by `user_id` for security
- ✅ Cleanup on unmount specified

**Resolution**: Design will use correct table name `policy_analysis`

---

## Database Schema Details

### Correct Table Structures

#### user_policies
```sql
CREATE TABLE public.user_policies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  insurer_id UUID REFERENCES public.insurers(id),
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  policy_number TEXT,
  policy_type TEXT,
  processing_status TEXT DEFAULT 'pending',
  detected_insurer_name TEXT,
  -- ... additional fields
)
```

#### policy_analysis
```sql
CREATE TABLE public.policy_analysis (
  id UUID PRIMARY KEY,
  policy_id UUID REFERENCES public.user_policies(id),
  user_id UUID REFERENCES auth.users(id),
  overall_risk_score INTEGER,
  coverage_adequacy_score INTEGER,
  claim_friendliness_score INTEGER,
  critical_risks_count INTEGER,
  has_coverage_gaps BOOLEAN,
  coverage_gap_amount NUMERIC,
  recommended_coverage NUMERIC,
  -- ... additional fields
)
```

#### recommendations
```sql
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY,
  analysis_id UUID REFERENCES public.policy_analysis(id),
  recommendation_type TEXT,
  priority TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  -- ... additional fields
)
```

---

## Corrected Requirements Mapping

### Requirement 4: Overview Page Integration

**Original**: Read from `insurance_policies`, `insurance_analysis`, `insurance_recommendations`

**Corrected**: Read from `user_policies`, `policy_analysis`, `recommendations`

**Query Pattern**:
```typescript
// Get latest analysis with policy details
const { data } = await supabase
  .from('policy_analysis')
  .select(`
    *,
    user_policies (
      id,
      policy_number,
      detected_insurer_name,
      policy_type
    ),
    recommendations (
      id,
      title,
      priority,
      status
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

### Requirement 5: Real-Time Subscriptions

**Original**: Subscribe to `insurance_analysis`

**Corrected**: Subscribe to `policy_analysis`

**Implementation**:
```typescript
const subscription = supabase
  .channel('policy-analysis-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'policy_analysis',
      filter: `user_id=eq.${userId}`
    },
    handleAnalysisComplete
  )
  .subscribe();
```

---

## Additional Validation Notes

### Error Codes
✅ All error codes in requirements match API implementation:
- AUTHENTICATION_REQUIRED
- INVALID_TOKEN
- RATE_LIMIT_EXCEEDED
- NO_FILE_PROVIDED
- FILE_TOO_LARGE
- INVALID_FILE_TYPE
- PIPELINE_FAILED
- INTERNAL_ERROR

### Performance Targets
✅ Requirements align with API capabilities:
- Average duration: 2-3 seconds ✅
- Stage transition: 500ms ✅
- Cache duration: 5 minutes ✅

### Accessibility Requirements
✅ All WCAG AA requirements are testable and achievable

---

## Recommendations for Design Phase

1. **Use Correct Schema**: All database queries must use `user_policies`, `policy_analysis`, `recommendations`

2. **Progress Indicator Strategy**: 
   - Indeterminate spinner during execution
   - Stage breakdown display after completion
   - No real-time stage updates

3. **Data Flow Validation**:
   - Verify foreign key relationships in queries
   - Use proper joins for related data
   - Handle null values for optional relationships

4. **Real-Time Updates**:
   - Subscribe to `policy_analysis` table
   - Filter by `user_id` for security
   - Handle connection failures gracefully

---

## Conclusion

Requirements are fundamentally sound with one critical schema correction needed. The design phase can proceed with confidence using the corrected table names and realistic progress indicator approach.

**Next Steps**: Create comprehensive design document incorporating all validation findings.
