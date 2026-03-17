# Design Document: Insurance Frontend Integration

## Overview

This design document specifies the technical architecture and implementation details for integrating the insurance pipeline backend with the frontend application. The backend pipeline successfully processes insurance policy documents through 7 stages and exposes a unified API endpoint `/api/insurance/analyze`. This integration will update the frontend upload flow, display comprehensive analysis results, and ensure the Overview page automatically reflects insurance analysis data using Supabase real-time subscriptions.

### Goals

1. Replace the existing `/api/insurance/analyze-policy` endpoint with the new `/api/insurance/analyze` endpoint
2. Display stage-by-stage pipeline progress during document processing
3. Map the new API response structure to the existing PolicyAnalysisModal component
4. Integrate insurance data into the Overview page with real-time updates
5. Handle partial success and error scenarios gracefully
6. Optimize performance and ensure accessibility compliance

### Non-Goals

1. Modifying the backend pipeline implementation
2. Creating new database tables (using existing schema: `insurance_policies`, `insurance_analysis`, `insurance_recommendations`)
3. Implementing custom PDF parsing (handled by backend)
4. Building a new modal component (reusing PolicyAnalysisModal)

### Technology Stack

- **Frontend Framework**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, inline styles
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase subscriptions
- **State Management**: React hooks (useState, useEffect, useCallback, useMemo)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Insurance Page  │         │  Overview Page   │             │
│  │                  │         │                  │             │
│  │  - Upload Flow   │         │  - Protection    │             │
│  │  - Progress UI   │         │    Score         │             │
│  │  - Analysis      │         │  - Alerts        │             │
│  │    Modal         │         │  - Real-time     │             │
│  └────────┬─────────┘         │    Updates       │             │
│           │                   └────────┬─────────┘             │
│           │                            │                        │
│           │                            │                        │
│  ┌────────▼────────────────────────────▼─────────┐             │
│  │         useInsurance Hook                      │             │
│  │  - Fetch policies                              │             │
│  │  - Fetch analysis                              │             │
│  │  - Calculate scores                            │             │
│  │  - Supabase subscriptions                      │             │
│  └────────┬───────────────────────────────────────┘             │
│           │                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                         API Layer                                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  POST /api/insurance/analyze                         │       │
│  │                                                       │       │
│  │  - Receives PDF file + policyType                    │       │
│  │  - Orchestrates 7-stage pipeline                     │       │
│  │  - Returns analysis results                          │       │
│  └────────┬─────────────────────────────────────────────┘       │
│           │                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                      Backend Pipeline                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Upload → Process → Classify → Extract → Analyze → Gap → Recommend│
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Pipeline Orchestrator Service                       │       │
│  │  - Coordinates all stages                            │       │
│  │  - Handles errors and partial success                │       │
│  │  - Saves to database                                 │       │
│  └────────┬─────────────────────────────────────────────┘       │
│           │                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                      Database Layer                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ insurance_       │  │ insurance_       │  │ insurance_   │  │
│  │ policies         │  │ analysis         │  │ recommenda-  │  │
│  │                  │  │                  │  │ tions        │  │
│  │ - Policy data    │  │ - Risk analysis  │  │ - Suggested  │  │
│  │ - Extracted      │  │ - Policy score   │  │   improve-   │  │
│  │   fields         │  │ - Coverage gaps  │  │   ments      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
Insurance Page Component Tree:
├── InsurancePage (page.tsx)
│   ├── ErrorToast
│   ├── ProtectionScore
│   ├── PolicyAnalysisModal
│   │   ├── HealthOverviewTab
│   │   ├── TermOverviewTab
│   │   ├── DetailsTab
│   │   ├── BenefitsTab
│   │   ├── ExclusionsTab
│   │   ├── AIAnalysisTab
│   │   ├── ClaimAnalysisTab
│   │   ├── InsurerReportCardTab
│   │   └── BetterPlansTab
│   ├── PipelineProgressIndicator (NEW)
│   ├── InsurancePolicyCard
│   ├── CoverageMap
│   ├── MultiStepModal
│   └── LegalDisclaimer

Overview Page Component Tree:
├── OverviewPage (page.tsx)
│   ├── ProtectionScoreCard (UPDATED)
│   ├── AIFinancialAlerts (UPDATED)
│   ├── FinancialHealthScore (UPDATED)
│   └── InsurancePromptCard (NEW - when no policies)
```

### Data Flow

#### Upload Flow

```
1. User selects PDF file
   ↓
2. Client-side validation (file type, size)
   ↓
3. Display PipelineProgressIndicator (indeterminate spinner)
   ↓
4. POST /api/insurance/analyze with FormData
   ↓
5. Backend processes through 7 stages
   ↓
6. API returns response (success/partial_success/failed)
   ↓
7. Hide progress indicator
   ↓
8. Handle response:
   - success: Show PolicyAnalysisModal + auto-fill form
   - partial_success: Show modal with warnings
   - failed: Show error toast with guidance
   ↓
9. User saves policy → Database insert
   ↓
10. Supabase triggers real-time event
   ↓
11. Overview page receives update
   ↓
12. Overview page refreshes insurance data
```

#### Real-Time Update Flow

```
1. User uploads policy on Insurance page
   ↓
2. Pipeline completes analysis
   ↓
3. Backend saves to insurance_analysis table
   ↓
4. Supabase broadcasts INSERT event
   ↓
5. Overview page subscription receives event
   ↓
6. Overview page fetches latest data
   ↓
7. UI updates:
   - Protection Score
   - Financial Health Score
   - Insurance Alerts
   ↓
8. Toast notification: "Insurance analysis complete"
```

## Components and Interfaces

### New Component: PipelineProgressIndicator

**Purpose**: Display an indeterminate progress indicator during pipeline execution.

**Location**: `src/components/insurance/PipelineProgressIndicator.tsx`

**Props**:
```typescript
interface PipelineProgressIndicatorProps {
  isVisible: boolean;
  message?: string;
}
```

**Behavior**:
- Shows indeterminate spinner (no stage-by-stage progress since pipeline doesn't support streaming)
- Displays message: "AI analyzing your policy document..."
- Estimated time: "Usually takes 2-3 seconds"
- Styled consistently with existing design system

**Implementation Notes**:
- Use CSS animations for smooth spinner
- Position as overlay or inline based on context
- Auto-hide when `isVisible` becomes false

### Updated Component: Insurance Page

**File**: `src/app/(dashboard)/insurance/page.tsx`

**Changes**:
1. Replace API endpoint from `/api/insurance/analyze-policy` to `/api/insurance/analyze`
2. Update request format to match new API
3. Replace `AnalysisProgress` with `PipelineProgressIndicator`
4. Update response handling for new structure
5. Map `extractedFields` to form auto-fill
6. Handle `status` field (success/partial_success/failed)
7. Display appropriate error messages based on error codes

**Key Functions**:

```typescript
const handlePolicyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  // 1. Validate file (client-side)
  // 2. Show PipelineProgressIndicator
  // 3. POST to /api/insurance/analyze
  // 4. Handle response based on status
  // 5. Auto-fill form with extractedFields
  // 6. Show PolicyAnalysisModal
}
```

### Updated Component: PolicyAnalysisModal

**File**: `src/components/insurance/PolicyAnalysisModal.tsx`

**Changes**:
1. Update data mapping to handle new API response structure
2. Map `policyScore.totalScore` → `analysis.overallScore`
3. Map `policyScore.grade` → `analysis.grade`
4. Map `riskAnalysis.risks` → `analysis.risks`
5. Map `coverageGapAnalysis` → `policySuggestions`
6. Map `report.humanReadableReport` → AI analysis summary
7. Map `report.suggestedImprovements` → recommendations list
8. Handle missing optional fields with safe fallbacks

**Data Mapping**:

```typescript
const mappedAnalysis = {
  policyData: {
    provider: analysis.extractedFields?.insurerName,
    productName: analysis.extractedFields?.planName,
    policyNumber: analysis.extractedFields?.policyNumber,
    coverageAmount: analysis.extractedFields?.sumInsured,
    premiumAmount: analysis.extractedFields?.premiumAmount,
    // ... more fields
  },
  analysis: {
    overallScore: analysis.policyScore?.totalScore || 0,
    grade: analysis.policyScore?.grade || 'N/A',
    risks: analysis.riskAnalysis?.risks || [],
    // ... more fields
  },
  claimAnalysis: {
    overallProbability: analysis.claimProbability?.probability,
    topRejectionRisks: analysis.riskAnalysis?.risks
      ?.filter(r => r.severity === 'High' || r.severity === 'Critical')
      .map(r => ({
        reason: r.title,
        likelihood: r.severity,
        explanation: r.description,
        financialImpact: r.impact,
      })),
    // ... more fields
  },
  policySuggestions: analysis.coverageGapAnalysis,
};
```

### Updated Hook: useInsurance

**File**: `src/hooks/useInsurance.ts`

**New Methods**:

```typescript
// Fetch analysis for a specific policy
const fetchAnalysis = async (policyId: string): Promise<InsuranceAnalysis | null> => {
  const { data } = await supabase
    .from('insurance_analysis')
    .select('*')
    .eq('policy_id', policyId)
    .single();
  return data;
};

// Fetch all analyses for user's policies
const fetchAllAnalyses = async (): Promise<InsuranceAnalysis[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('insurance_analysis')
    .select('*, insurance_policies!inner(user_id)')
    .eq('insurance_policies.user_id', user.id);
  return data || [];
};

// Subscribe to analysis updates
const subscribeToAnalysisUpdates = (callback: (payload: any) => void) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const subscription = supabase
    .channel('insurance_analysis_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'insurance_analysis',
        filter: `user_id=eq.${user.id}`,
      },
      callback
    )
    .subscribe();
    
  return subscription;
};
```

### Updated Page: Overview

**File**: `src/app/(dashboard)/overview/page.tsx`

**Changes**:
1. Add Supabase subscription to `insurance_analysis` table
2. Fetch insurance data on mount and when subscription fires
3. Calculate Protection Score from `insurance_analysis.policy_score`
4. Display insurance alerts from `insurance_analysis.risk_analysis`
5. Include insurance data in Financial Health Score calculation
6. Show "No Health Insurance Detected" alert only when no active policies exist
7. Display coverage gap from `insurance_analysis.coverage_gap_analysis`
8. Clean up subscription on unmount

**Key Functions**:

```typescript
useEffect(() => {
  // Fetch initial insurance data
  fetchInsuranceData();
  
  // Subscribe to real-time updates
  const subscription = supabase
    .channel('insurance_updates')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'insurance_analysis',
    }, (payload) => {
      // Refresh insurance data
      fetchInsuranceData();
      // Show toast notification
      toast.success('Insurance analysis complete');
    })
    .subscribe();
    
  return () => {
    subscription.unsubscribe();
  };
}, []);

const fetchInsuranceData = async () => {
  // Query insurance_policies joined with insurance_analysis
  const { data } = await supabase
    .from('insurance_policies')
    .select(`
      *,
      insurance_analysis (
        policy_score,
        risk_analysis,
        coverage_gap_analysis
      )
    `)
    .eq('policy_status', 'active')
    .order('created_at', { ascending: false });
    
  // Update state with fetched data
  setInsuranceData(data);
};
```

## Data Models

### API Request Format

```typescript
// POST /api/insurance/analyze
interface AnalyzeRequest {
  file: File;              // PDF file (multipart/form-data)
  policyType: 'health' | 'term' | 'auto-detect';
}
```

### API Response Format

```typescript
interface AnalyzeResponse {
  success: boolean;
  status: 'success' | 'partial_success' | 'failed';
  policyId?: string;       // UUID of created policy record
  analysisId?: string;     // UUID of created analysis record
  data?: {
    extractedFields: {
      insurerName: string;
      planName: string;
      policyNumber: string;
      sumInsured: number;
      premiumAmount: number;
      premiumFrequency: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
      policyStartDate: string;  // ISO date
      policyEndDate: string;    // ISO date
      policyholderName?: string;
      roomRentLimit?: {
        type: 'unlimited' | 'percentage' | 'fixed';
        value?: number;
      };
      coPaymentPercentage?: number;
      initialWaitingPeriod?: number;  // days
      preExistingDiseaseWaitingPeriod?: number;  // days
      specificDiseaseWaitingPeriod?: number;  // days
      restorationBenefit?: boolean;
      networkHospitalCount?: number;
      exclusions?: string[];
    };
    riskAnalysis: {
      risks: Array<{
        type: string;
        title: string;
        description: string;
        severity: 'Low' | 'Medium' | 'High' | 'Critical';
        impact: string;
      }>;
    };
    policyScore: {
      totalScore: number;      // 0-100
      grade: string;           // A+, A, B+, B, C, D, F
      breakdown?: {
        coverage: number;
        terms: number;
        benefits: number;
        exclusions: number;
      };
    };
    claimProbability?: {
      probability: number;     // 0-100
      factors: string[];
    };
    coverageGapAnalysis: {
      currentCoverage: number;
      recommendedCoverage: number;
      gap: number;
      recommendations: string[];
    };
    report: {
      humanReadableReport: string;
      suggestedImprovements: string[];
    };
  };
  stages?: Array<{
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: number;        // milliseconds
    error?: string;
  }>;
  error?: string;
  errorCode?: string;
  metadata?: {
    processingTime: number;
    pipelineVersion: string;
  };
}
```

### Database Schema (Existing - Production)

```typescript
// Table: insurance_policies
interface InsurancePolicy {
  id: string;                    // UUID
  user_id: string;               // UUID (foreign key)
  policy_type: 'health' | 'term_life' | 'life' | 'motor' | 'home' | 'travel' | 'other';
  insurer_name: string;
  plan_name: string;
  policy_number: string | null;
  sum_insured: number;
  premium_amount: number;
  premium_frequency: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  policy_start_date: string;     // ISO date (CRITICAL: use this field)
  policy_end_date: string;       // ISO date (CRITICAL: use this field)
  renewal_date: string;          // ISO date
  policy_status: 'active' | 'expired' | 'cancelled';
  covered_members: string[];     // Array of family member IDs
  file_path: string | null;      // Supabase storage path
  original_filename: string | null;
  created_at: string;
  updated_at: string;
  // ... additional health/term specific fields
}

// Table: insurance_analysis
interface InsuranceAnalysis {
  id: string;                    // UUID
  policy_id: string;             // UUID (foreign key)
  user_id: string;               // UUID (foreign key)
  risk_analysis: {               // JSONB column
    risks: Array<{
      type: string;
      title: string;
      description: string;
      severity: string;
      impact: string;
    }>;
  };
  policy_score: {                // JSONB column
    totalScore: number;
    grade: string;
    breakdown?: object;
  };
  claim_probability: {           // JSONB column
    probability: number;
    factors: string[];
  };
  coverage_gap_analysis: {       // JSONB column
    currentCoverage: number;
    recommendedCoverage: number;
    gap: number;
    recommendations: string[];
  };
  generated_at: string;          // ISO timestamp
}

// Table: insurance_recommendations
interface InsuranceRecommendation {
  id: string;                    // UUID
  policy_id: string;             // UUID (foreign key)
  user_id: string;               // UUID (foreign key)
  recommendation_type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_impact: string;
  created_at: string;
}
```

### Error Codes

```typescript
type ErrorCode =
  | 'AUTHENTICATION_REQUIRED'
  | 'INVALID_TOKEN'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NO_FILE_PROVIDED'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'SCANNED_PDF_DETECTED'
  | 'EXTRACTION_FAILED'
  | 'PIPELINE_FAILED'
  | 'INTERNAL_ERROR';

const ERROR_MESSAGES: Record<ErrorCode, { message: string; suggestion: string }> = {
  SCANNED_PDF_DETECTED: {
    message: 'This appears to be a scanned PDF',
    suggestion: 'Please upload a text-based PDF for best results',
  },
  EXTRACTION_FAILED: {
    message: 'Could not extract policy details',
    suggestion: 'Please ensure the PDF is clear and text-based',
  },
  RATE_LIMIT_EXCEEDED: {
    message: 'Daily analysis limit reached',
    suggestion: 'You can analyze 10 policies per day. Try again tomorrow.',
  },
  FILE_TOO_LARGE: {
    message: 'File size exceeds limit',
    suggestion: 'Maximum file size is 50MB. Please compress your PDF.',
  },
  // ... more error codes
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*



### Property Reflection

After analyzing all acceptance criteria, I've identified the following properties. Many UI-specific tests are examples rather than properties since they test specific scenarios. The properties below represent universal rules that should hold across all valid inputs.

**Redundancy Analysis:**
- Properties 3.1-3.9 (data mapping) can be combined into comprehensive mapping properties
- Properties 4.2-4.7 (Overview page display) can be consolidated into data display properties
- Properties 6.3-6.6 (error messages) can be combined into error handling property
- Properties 8.1-8.8 (loading states) represent UI state management that can be consolidated
- Properties 9.1-9.8 (performance) are optimization requirements, some can be combined
- Properties 10.1-10.8 (accessibility) can be grouped into accessibility compliance properties

### Property 1: API Response Data Mapping Completeness

*For any* valid API response from `/api/insurance/analyze`, the PolicyAnalysisModal SHALL correctly map all present fields from the response structure (`extractedFields`, `policyScore`, `riskAnalysis`, `coverageGapAnalysis`, `report`) to their corresponding display sections, and for any missing optional fields, SHALL display safe fallback values (e.g., "Not specified", "Check policy document").

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9**

### Property 2: Database Persistence Round-Trip

*For any* successfully uploaded policy PDF, if the system saves the policy record to `insurance_policies` and the analysis record to `insurance_analysis`, then querying the database SHALL return the same policy data and analysis data that was saved, preserving all extracted fields and analysis results.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 3: Error Code to Message Mapping

*For any* error code returned by the `/api/insurance/analyze` endpoint (SCANNED_PDF_DETECTED, EXTRACTION_FAILED, RATE_LIMIT_EXCEEDED, FILE_TOO_LARGE, etc.), the Frontend_Upload_Flow SHALL display the corresponding error message and suggestion as defined in the ERROR_MESSAGES mapping.

**Validates: Requirements 6.3, 6.4, 6.5, 6.6, 6.8**

### Property 4: Real-Time Subscription Filtering

*For any* INSERT event on the `insurance_analysis` table, the Overview_Page subscription SHALL only receive and process events where the `user_id` matches the current authenticated user's ID, ensuring users only see their own insurance updates.

**Validates: Requirements 5.5**

### Property 5: Protection Score Calculation Consistency

*For any* set of active insurance policies with associated analysis records, the Overview_Page SHALL calculate the Protection_Score using the most recent `policyScore.totalScore` from `insurance_analysis`, and this score SHALL be consistently displayed in both the Protection Score card and included in the Financial_Health_Score calculation.

**Validates: Requirements 4.2, 4.4, 4.6**

### Property 6: High-Severity Risk Alert Filtering

*For any* insurance analysis with a `riskAnalysis.risks` array, the Overview_Page SHALL display only those risks where `severity` is "High" or "Critical" in the AI Financial Alerts section, filtering out risks with "Low" or "Medium" severity.

**Validates: Requirements 4.3**

### Property 7: File Validation Before API Call

*For any* file selected for upload, if the file type is not PDF or the file size exceeds 10MB, the Frontend_Upload_Flow SHALL display a validation error immediately and SHALL NOT make an API call to `/api/insurance/analyze`.

**Validates: Requirements 9.1, 9.2**



### Property 8: UI State Transition Timing

*For any* pipeline execution that completes (success, partial_success, or failed), the Frontend_Upload_Flow SHALL hide the loading state and display the results (modal or error toast) within 500ms of receiving the API response.

**Validates: Requirements 2.6, 8.3**

### Property 9: Partial Success Data Display

*For any* API response with `status: "partial_success"`, the Frontend_Upload_Flow SHALL display all available data fields in the Analysis_Report_Modal and SHALL display warning indicators for any failed stages listed in the `stages` array.

**Validates: Requirements 6.1, 6.2**

### Property 10: Subscription Cleanup on Unmount

*For any* Overview_Page component instance, when the component unmounts, the Real_Time_Subscription to the `insurance_analysis` table SHALL be unsubscribed to prevent memory leaks.

**Validates: Requirements 5.6**

### Property 11: Toast Auto-Dismiss Timing

*For any* error toast displayed by the Frontend_Upload_Flow, if the user does not manually dismiss it, the toast SHALL automatically dismiss after exactly 8 seconds.

**Validates: Requirements 8.5**

### Property 12: Keyboard Navigation Accessibility

*For any* interactive element in the Frontend_Upload_Flow and Analysis_Report_Modal (buttons, tabs, form inputs), the element SHALL be accessible via keyboard navigation (Tab, Enter, Arrow keys) without requiring mouse interaction.

**Validates: Requirements 10.1**

### Property 13: ARIA Attribute Presence

*For any* modal, progress indicator, or alert component, the component SHALL include appropriate ARIA attributes (aria-label, aria-role, aria-live) to support screen reader accessibility.

**Validates: Requirements 10.2, 10.3**

### Property 14: Color Contrast Compliance

*For any* error message, warning indicator, or alert displayed in the UI, the text color and background color SHALL have a contrast ratio of at least 4.5:1 to meet WCAG AA standards.

**Validates: Requirements 10.4**

### Property 15: Mobile Responsive Layout

*For any* viewport width greater than or equal to 320px, the Analysis_Report_Modal SHALL be fully usable with all content visible and interactive, and tabs SHALL be horizontally scrollable if they exceed the viewport width.

**Validates: Requirements 10.5, 10.8**

### Property 16: Conditional Alert Display

*For any* Overview_Page state, if there exists at least one active health insurance policy in the `insurance_policies` table with `policy_type = 'health'` and `policy_status = 'active'`, then the "No Health Insurance Detected" alert SHALL NOT be displayed.

**Validates: Requirements 4.5**

### Property 17: Real-Time Update Responsiveness

*For any* INSERT event received by the Overview_Page subscription on the `insurance_analysis` table, the page SHALL refresh its insurance data and update the Protection_Score, Financial_Health_Score, and insurance alerts within 2 seconds of receiving the event.

**Validates: Requirements 5.4**

### Property 18: Data Caching Behavior

*For any* insurance data fetch on the Overview_Page, if a subsequent fetch request occurs within 5 minutes of the previous fetch, the system SHALL return the cached data without making a new database query.

**Validates: Requirements 9.4**



## Error Handling

### Client-Side Validation Errors

**File Type Validation**:
- Error: User selects non-PDF file
- Handling: Display toast immediately: "Invalid file type. Please upload a PDF file."
- No API call made

**File Size Validation**:
- Error: User selects file > 10MB
- Handling: Display toast immediately: "File too large. Please upload a file smaller than 10MB."
- No API call made

### API Error Responses

**Authentication Errors**:
- Error Code: `AUTHENTICATION_REQUIRED`, `INVALID_TOKEN`
- Handling: Redirect to login page with message: "Please log in to continue"
- Log error to console for debugging

**Rate Limiting**:
- Error Code: `RATE_LIMIT_EXCEEDED`
- Handling: Display toast: "Daily analysis limit reached. You can analyze 10 policies per day. Try again tomorrow."
- Disable upload button for 24 hours (store in localStorage)

**File Processing Errors**:
- Error Code: `SCANNED_PDF_DETECTED`
- Handling: Display toast: "This appears to be a scanned PDF. Please upload a text-based PDF for best results."
- Allow retry with different file

- Error Code: `EXTRACTION_FAILED`
- Handling: Display toast: "Could not extract policy details. Please ensure the PDF is clear and text-based."
- Show partial results if available
- Allow manual entry of policy details

**Pipeline Errors**:
- Error Code: `PIPELINE_FAILED`
- Handling: Display toast: "Analysis failed. Please try again or contact support."
- Log full error details to console
- Allow retry

**Server Errors**:
- Error Code: `INTERNAL_ERROR`
- Handling: Display toast: "Something went wrong. Please try again later."
- Log error to console and error tracking service (e.g., Sentry)
- Allow retry after 5 seconds

### Partial Success Handling

When API returns `status: "partial_success"`:
1. Display warning banner: "⚠️ Analysis partially complete. Some stages failed."
2. Show available data in PolicyAnalysisModal
3. Mark failed stages with warning icons
4. Display specific error messages for failed stages
5. Allow user to save partial results or retry

### Network Errors

**Connection Timeout**:
- Error: Request takes > 30 seconds
- Handling: Display toast: "Request timed out. Please check your connection and try again."
- Allow retry

**Network Offline**:
- Error: No internet connection
- Handling: Display toast: "No internet connection. Please check your network."
- Disable upload button until connection restored

### Database Errors

**Save Policy Error**:
- Error: Failed to insert into `insurance_policies`
- Handling: Display toast: "Failed to save policy. Please try again."
- Log error details
- Rollback optimistic update
- Allow retry

**Fetch Error**:
- Error: Failed to query database
- Handling: Display error state component with retry button
- Log error details
- Maintain previous data if available

### Subscription Errors

**Subscription Connection Failed**:
- Error: Supabase subscription fails to connect
- Handling: Log error to console
- Continue functioning with manual refresh
- Display subtle warning: "Real-time updates unavailable. Refresh to see latest data."

**Subscription Disconnected**:
- Error: Subscription loses connection
- Handling: Attempt automatic reconnection (3 retries with exponential backoff)
- If reconnection fails, fall back to manual refresh
- Display warning to user

### Error Logging Strategy

All errors should be logged with structured data:

```typescript
console.error('[Insurance Upload] Error:', {
  errorCode: error.code,
  message: error.message,
  timestamp: new Date().toISOString(),
  userId: user?.id,
  fileName: file?.name,
  fileSize: file?.size,
  stage: currentStage,
  stackTrace: error.stack,
});
```

For production, integrate with error tracking service (Sentry, LogRocket, etc.) to capture:
- Error frequency and patterns
- User impact metrics
- Stack traces and context
- Performance metrics



## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
**Property Tests**: Verify universal properties across all inputs using randomized test data

Both approaches are complementary and necessary for comprehensive correctness validation.

### Unit Testing

**Test Framework**: Jest + React Testing Library
**Coverage Target**: 80% code coverage minimum

#### Component Tests

**Insurance Page Upload Flow**:
- Test file selection and validation
- Test API call with correct endpoint and parameters
- Test progress indicator display
- Test success response handling
- Test partial success response handling
- Test error response handling
- Test form auto-fill with extracted fields
- Test modal display after analysis

**PolicyAnalysisModal**:
- Test data mapping from API response to display
- Test fallback values for missing fields
- Test tab navigation
- Test all tab content rendering
- Test modal close behavior
- Test responsive layout on different screen sizes

**Overview Page**:
- Test initial data fetch
- Test subscription setup
- Test subscription event handling
- Test data refresh on subscription event
- Test toast notification display
- Test Protection Score calculation
- Test insurance alerts filtering
- Test conditional alert display
- Test subscription cleanup on unmount

**PipelineProgressIndicator**:
- Test visibility toggle
- Test message display
- Test spinner animation
- Test styling consistency

#### Hook Tests

**useInsurance**:
- Test fetchPolicies
- Test fetchAnalysis
- Test fetchAllAnalyses
- Test subscribeToAnalysisUpdates
- Test subscription filtering
- Test error handling
- Test optimistic updates
- Test cache behavior

#### Integration Tests

**End-to-End Upload Flow**:
1. Mock file upload
2. Mock API response
3. Verify database insert
4. Verify modal display
5. Verify form auto-fill
6. Verify policy save

**Real-Time Update Flow**:
1. Mock subscription event
2. Verify data refresh
3. Verify UI updates
4. Verify toast notification

### Property-Based Testing

**Test Framework**: fast-check (JavaScript property-based testing library)
**Configuration**: Minimum 100 iterations per property test

#### Property Test Implementation

Each correctness property from the design document must be implemented as a property-based test:

**Property 1: API Response Data Mapping Completeness**
```typescript
// Tag: Feature: insurance-frontend-integration, Property 1: API Response Data Mapping Completeness
fc.assert(
  fc.property(
    fc.record({
      extractedFields: fc.record({ /* ... */ }),
      policyScore: fc.record({ /* ... */ }),
      riskAnalysis: fc.record({ /* ... */ }),
      // ... generate random API response
    }),
    (apiResponse) => {
      const mapped = mapAnalysisData(apiResponse);
      // Verify all present fields are mapped
      // Verify missing fields have fallbacks
      return verifyMappingCompleteness(mapped, apiResponse);
    }
  ),
  { numRuns: 100 }
);
```

**Property 2: Database Persistence Round-Trip**
```typescript
// Tag: Feature: insurance-frontend-integration, Property 2: Database Persistence Round-Trip
fc.assert(
  fc.property(
    fc.record({
      insurerName: fc.string(),
      sumInsured: fc.integer({ min: 100000, max: 10000000 }),
      // ... generate random policy data
    }),
    async (policyData) => {
      const saved = await savePolicy(policyData);
      const retrieved = await fetchPolicy(saved.id);
      return deepEqual(saved, retrieved);
    }
  ),
  { numRuns: 100 }
);
```

**Property 3: Error Code to Message Mapping**
```typescript
// Tag: Feature: insurance-frontend-integration, Property 3: Error Code to Message Mapping
fc.assert(
  fc.property(
    fc.constantFrom(
      'SCANNED_PDF_DETECTED',
      'EXTRACTION_FAILED',
      'RATE_LIMIT_EXCEEDED',
      'FILE_TOO_LARGE'
    ),
    (errorCode) => {
      const message = getErrorMessage(errorCode);
      return message.includes(ERROR_MESSAGES[errorCode].message);
    }
  ),
  { numRuns: 100 }
);
```

**Property 4: Real-Time Subscription Filtering**
```typescript
// Tag: Feature: insurance-frontend-integration, Property 4: Real-Time Subscription Filtering
fc.assert(
  fc.property(
    fc.record({
      user_id: fc.uuid(),
      policy_id: fc.uuid(),
      // ... generate random analysis event
    }),
    (event) => {
      const currentUserId = getCurrentUserId();
      const shouldReceive = event.user_id === currentUserId;
      const didReceive = subscriptionReceived(event);
      return shouldReceive === didReceive;
    }
  ),
  { numRuns: 100 }
);
```

**Property 7: File Validation Before API Call**
```typescript
// Tag: Feature: insurance-frontend-integration, Property 7: File Validation Before API Call
fc.assert(
  fc.property(
    fc.record({
      type: fc.constantFrom('application/pdf', 'image/jpeg', 'text/plain'),
      size: fc.integer({ min: 0, max: 20000000 }),
    }),
    (file) => {
      const isValid = file.type === 'application/pdf' && file.size <= 10485760;
      const apiCalled = validateAndUpload(file);
      return isValid === apiCalled;
    }
  ),
  { numRuns: 100 }
);
```



**Property 8: UI State Transition Timing**
```typescript
// Tag: Feature: insurance-frontend-integration, Property 8: UI State Transition Timing
fc.assert(
  fc.property(
    fc.record({
      status: fc.constantFrom('success', 'partial_success', 'failed'),
      data: fc.anything(),
    }),
    async (response) => {
      const startTime = Date.now();
      await handleApiResponse(response);
      const endTime = Date.now();
      const transitionTime = endTime - startTime;
      return transitionTime <= 500;
    }
  ),
  { numRuns: 100 }
);
```

**Property 16: Conditional Alert Display**
```typescript
// Tag: Feature: insurance-frontend-integration, Property 16: Conditional Alert Display
fc.assert(
  fc.property(
    fc.array(
      fc.record({
        policy_type: fc.constantFrom('health', 'term_life', 'motor'),
        policy_status: fc.constantFrom('active', 'expired', 'cancelled'),
      })
    ),
    (policies) => {
      const hasActiveHealth = policies.some(
        p => p.policy_type === 'health' && p.policy_status === 'active'
      );
      const alertShown = shouldShowNoHealthInsuranceAlert(policies);
      return hasActiveHealth === !alertShown;
    }
  ),
  { numRuns: 100 }
);
```

### Accessibility Testing

**Tools**: 
- axe-core (automated accessibility testing)
- jest-axe (Jest integration)
- Manual testing with screen readers (NVDA, JAWS, VoiceOver)

**Tests**:
- Keyboard navigation through all interactive elements
- Screen reader announcements for progress and errors
- Color contrast validation for all text
- Focus management in modals
- ARIA attribute presence and correctness

**Example Test**:
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

test('PolicyAnalysisModal has no accessibility violations', async () => {
  const { container } = render(<PolicyAnalysisModal analysis={mockData} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Performance Testing

**Metrics to Track**:
- Initial page load time
- Time to interactive
- API response time
- Database query time
- Real-time update latency
- Modal render time
- Tab switch time

**Performance Budgets**:
- API response: < 3 seconds (95th percentile)
- UI state transition: < 500ms
- Real-time update: < 2 seconds
- Modal render: < 200ms
- Tab switch: < 100ms

**Tools**:
- Lighthouse (performance audits)
- React DevTools Profiler
- Chrome DevTools Performance tab

### Test Coverage Requirements

**Minimum Coverage**:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Critical Paths** (must have 100% coverage):
- File upload and validation
- API request/response handling
- Error handling
- Database operations
- Real-time subscription logic

### Continuous Integration

**CI Pipeline**:
1. Run unit tests
2. Run property-based tests
3. Run accessibility tests
4. Generate coverage report
5. Fail build if coverage < 80%
6. Run E2E tests (Playwright/Cypress)

**Pre-commit Hooks**:
- Run linter (ESLint)
- Run type checker (TypeScript)
- Run unit tests for changed files
- Format code (Prettier)

### Manual Testing Checklist

Before deployment, manually verify:
- [ ] Upload PDF and verify analysis modal displays correctly
- [ ] Test with scanned PDF and verify error message
- [ ] Test with large file (>10MB) and verify client-side validation
- [ ] Test partial success scenario
- [ ] Test complete failure scenario
- [ ] Verify Overview page updates in real-time after upload
- [ ] Verify Protection Score calculation
- [ ] Verify insurance alerts display
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (VoiceOver on Mac)
- [ ] Verify all tabs in modal work correctly
- [ ] Test subscription cleanup (check for memory leaks)
- [ ] Verify error toast auto-dismisses after 8 seconds
- [ ] Test offline behavior

## Implementation Plan

### Phase 1: Core Integration (Week 1)

**Tasks**:
1. Create PipelineProgressIndicator component
2. Update Insurance page to use new API endpoint
3. Update request format and response handling
4. Implement error handling for all error codes
5. Update PolicyAnalysisModal data mapping
6. Add fallback values for missing fields

**Deliverables**:
- Working upload flow with new API
- Proper error handling
- Updated modal with correct data mapping

### Phase 2: Overview Page Integration (Week 1-2)

**Tasks**:
1. Add insurance data fetching to Overview page
2. Implement Supabase subscription
3. Update Protection Score calculation
4. Add insurance alerts filtering
5. Implement conditional alert display
6. Add toast notifications
7. Implement subscription cleanup

**Deliverables**:
- Overview page displays insurance data
- Real-time updates working
- Proper subscription management

### Phase 3: Testing & Polish (Week 2)

**Tasks**:
1. Write unit tests for all components
2. Write property-based tests for all properties
3. Run accessibility audits
4. Fix accessibility issues
5. Optimize performance
6. Add error logging
7. Test on multiple devices/browsers

**Deliverables**:
- 80%+ test coverage
- No accessibility violations
- Performance within budgets
- Cross-browser compatibility

### Phase 4: Documentation & Deployment (Week 2)

**Tasks**:
1. Update API documentation
2. Write user guide
3. Create deployment checklist
4. Deploy to staging
5. Run smoke tests
6. Deploy to production
7. Monitor for errors

**Deliverables**:
- Complete documentation
- Successful production deployment
- Monitoring dashboards

## Security Considerations

### Authentication & Authorization

- All API requests must include valid authentication token
- Verify user owns the policy before allowing access
- Filter database queries by user_id
- Validate user_id in subscription filters

### Data Privacy

- Store policy documents in Supabase Storage with row-level security
- Encrypt sensitive policy data at rest
- Never log sensitive information (policy numbers, personal details)
- Implement data retention policies

### Input Validation

- Validate file type and size on client and server
- Sanitize all user inputs before database insertion
- Validate API response structure before processing
- Prevent XSS attacks in modal content

### Rate Limiting

- Implement rate limiting on API endpoint (10 requests/day per user)
- Store rate limit counters in Redis or database
- Return appropriate error codes when limit exceeded
- Reset counters daily at midnight UTC

### Error Handling

- Never expose internal error details to users
- Log detailed errors server-side only
- Use generic error messages for security issues
- Implement error tracking with PII redaction

## Monitoring & Observability

### Metrics to Track

**Business Metrics**:
- Number of policies uploaded per day
- Analysis success rate
- Partial success rate
- Error rate by error code
- Average processing time
- User retention after first upload

**Technical Metrics**:
- API response time (p50, p95, p99)
- Database query time
- Subscription connection success rate
- Real-time update latency
- Frontend error rate
- Page load time

**User Experience Metrics**:
- Time from upload to modal display
- Modal interaction rate
- Tab switch frequency
- Error recovery rate
- Mobile vs desktop usage

### Alerting

**Critical Alerts** (page immediately):
- API error rate > 10%
- Database connection failures
- Subscription service down
- Authentication service down

**Warning Alerts** (notify in Slack):
- API response time > 5 seconds
- Error rate > 5%
- Subscription reconnection rate > 20%
- Rate limit hit by > 10% of users

### Logging

**Log Levels**:
- ERROR: All errors and exceptions
- WARN: Partial successes, retries, fallbacks
- INFO: Successful operations, user actions
- DEBUG: Detailed execution flow (dev only)

**Structured Logging Format**:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "insurance-frontend",
  "userId": "uuid",
  "action": "upload_policy",
  "errorCode": "EXTRACTION_FAILED",
  "message": "Failed to extract policy fields",
  "metadata": {
    "fileName": "policy.pdf",
    "fileSize": 2048576,
    "processingTime": 2500
  }
}
```

## Rollback Plan

### Rollback Triggers

Rollback if:
- Error rate > 25% for 5 minutes
- API response time > 10 seconds for 5 minutes
- Database errors > 10% of requests
- Critical security vulnerability discovered
- Data corruption detected

### Rollback Procedure

1. **Immediate**: Revert frontend deployment to previous version
2. **Database**: No schema changes in this feature, no rollback needed
3. **API**: Keep new endpoint, add backward compatibility
4. **Monitoring**: Watch metrics for 30 minutes post-rollback
5. **Communication**: Notify users of temporary service disruption
6. **Investigation**: Analyze logs to identify root cause
7. **Fix**: Implement fix and redeploy with additional testing

### Backward Compatibility

- Keep old `/api/insurance/analyze-policy` endpoint active for 30 days
- Add deprecation warning in API response
- Gradually migrate users to new endpoint
- Monitor usage of old endpoint
- Remove old endpoint after 30 days if usage < 1%

## Conclusion

This design document provides a comprehensive technical specification for integrating the insurance pipeline backend with the frontend application. The implementation follows best practices for error handling, accessibility, performance, and security. The dual testing approach (unit tests + property-based tests) ensures correctness across all scenarios. Real-time updates via Supabase subscriptions provide a seamless user experience. The phased implementation plan allows for iterative development and testing.

