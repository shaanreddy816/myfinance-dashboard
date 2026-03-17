# Requirements Document

## Introduction

This document specifies the requirements for integrating the new insurance pipeline backend with the frontend application. The backend pipeline successfully analyzes policy documents through 7 stages (upload → process → classify → extract → analyze → gap → recommend) and exposes a unified API endpoint `/api/insurance/analyze`. The frontend must be updated to use this new endpoint, display comprehensive analysis results, and ensure the Overview page automatically reflects insurance analysis data.

## Glossary

- **Insurance_Pipeline**: The backend system that processes insurance policy documents through 7 sequential stages
- **Frontend_Upload_Flow**: The user interface component that handles policy document uploads in the insurance page
- **Analysis_Report_Modal**: The modal component that displays comprehensive policy analysis results
- **Overview_Page**: The dashboard page that displays aggregated financial health metrics including insurance data
- **Pipeline_Stage**: An individual processing step in the insurance pipeline (upload, process, classify, extract, analyze, gap, recommend)
- **Policy_Score**: A numerical rating (0-100) representing the quality and adequacy of an insurance policy
- **Risk_Analysis**: The identification and assessment of potential claim rejection risks and policy weaknesses
- **Coverage_Gap**: The difference between current insurance coverage and recommended coverage based on user profile
- **Partial_Success**: A pipeline execution state where critical stages succeeded but non-critical stages failed
- **Real_Time_Subscription**: A Supabase subscription that listens for database changes and triggers UI updates
- **Protection_Score**: The insurance coverage adequacy metric displayed on the Overview page
- **Financial_Health_Score**: The composite score on the Overview page that includes insurance data

## Requirements

### Requirement 1: Update Insurance Upload Flow API Integration

**User Story:** As a user, I want to upload my insurance policy document and receive comprehensive analysis results, so that I can understand my policy coverage and identify gaps.

#### Acceptance Criteria

1. WHEN a user uploads a PDF file, THE Frontend_Upload_Flow SHALL send the file to `/api/insurance/analyze` endpoint
2. THE Frontend_Upload_Flow SHALL include `policyType` parameter in the request with values from user selection
3. WHEN the pipeline is processing, THE Frontend_Upload_Flow SHALL display stage-by-stage progress indicators for all 7 Pipeline_Stages
4. WHEN the API returns status `success`, THE Frontend_Upload_Flow SHALL display the complete Analysis_Report_Modal with all analysis data
5. WHEN the API returns status `partial_success`, THE Frontend_Upload_Flow SHALL display available analysis data with warning indicators for failed stages
6. WHEN the API returns status `failed`, THE Frontend_Upload_Flow SHALL display an error message with the failed Pipeline_Stage name and helpful guidance
7. THE Frontend_Upload_Flow SHALL auto-fill the policy form fields with data from `extractedFields` in the API response
8. THE Frontend_Upload_Flow SHALL handle scanned/unsupported PDFs by displaying specific error messages with actionable suggestions

### Requirement 2: Display Stage-by-Stage Pipeline Progress

**User Story:** As a user, I want to see real-time progress as my policy is being analyzed, so that I understand what the system is doing and how long it will take.

#### Acceptance Criteria

1. WHEN the pipeline starts executing, THE Frontend_Upload_Flow SHALL display a progress indicator showing all 7 Pipeline_Stages
2. WHILE each Pipeline_Stage is executing, THE Frontend_Upload_Flow SHALL highlight the current stage with an "in progress" visual state
3. WHEN a Pipeline_Stage completes successfully, THE Frontend_Upload_Flow SHALL mark it with a success indicator
4. WHEN a Pipeline_Stage fails, THE Frontend_Upload_Flow SHALL mark it with a failure indicator and display the error message
5. THE Frontend_Upload_Flow SHALL display estimated time remaining based on average pipeline duration (2-3 seconds)
6. WHEN all stages complete, THE Frontend_Upload_Flow SHALL transition to displaying the analysis results within 500ms

### Requirement 3: Update Analysis Report Modal Data Mapping

**User Story:** As a user, I want to view comprehensive analysis results in an organized modal, so that I can understand my policy strengths, weaknesses, and recommendations.

#### Acceptance Criteria

1. THE Analysis_Report_Modal SHALL map `policyScore.totalScore` to the overall score display
2. THE Analysis_Report_Modal SHALL map `policyScore.grade` to the letter grade display
3. THE Analysis_Report_Modal SHALL map `riskAnalysis.risks` array to the risks section with severity indicators
4. THE Analysis_Report_Modal SHALL map `coverageGapAnalysis` to the coverage gap section showing current vs recommended coverage
5. THE Analysis_Report_Modal SHALL map `report.humanReadableReport` to the AI analysis summary section
6. THE Analysis_Report_Modal SHALL map `report.suggestedImprovements` to the recommendations list
7. THE Analysis_Report_Modal SHALL map `extractedFields` to the policy details section
8. WHEN optional fields are missing in the API response, THE Analysis_Report_Modal SHALL display safe fallback values (e.g., "Not specified", "Check policy document")
9. THE Analysis_Report_Modal SHALL display all tabs (Overview, Details, Benefits, Exclusions, AI Analysis, Claim Analysis, Insurer Report) with data from the new API structure

### Requirement 4: Integrate Insurance Data into Overview Page

**User Story:** As a user, I want my Overview page to automatically reflect my insurance analysis results, so that I can see my complete financial health including insurance coverage.

#### Acceptance Criteria

1. THE Overview_Page SHALL read insurance data from `insurance_policies`, `insurance_analysis`, and `insurance_recommendations` database tables
2. THE Overview_Page SHALL update the Protection_Score display using `policyScore.totalScore` from the most recent `insurance_analysis` record
3. THE Overview_Page SHALL display insurance-related alerts in the AI Financial Alerts section using `riskAnalysis.risks` where severity is "High" or "Critical"
4. THE Overview_Page SHALL include insurance data in the Financial_Health_Score calculation using the Protection_Score as a weighted component
5. WHEN an active health insurance policy exists in `insurance_policies`, THE Overview_Page SHALL remove the "No Health Insurance Detected" alert
6. THE Overview_Page SHALL display the sum insured amount from `insurance_policies.sum_insured` in the Protection Score card
7. THE Overview_Page SHALL calculate and display the coverage gap using `insurance_analysis.coverage_gap_analysis` data
8. WHEN no insurance policies exist, THE Overview_Page SHALL display a prompt to add insurance policies with a link to the insurance page

### Requirement 5: Implement Real-Time Updates with Supabase Subscriptions

**User Story:** As a user, I want my Overview page to automatically update when my policy analysis completes, so that I see the latest data without manual refresh.

#### Acceptance Criteria

1. THE Overview_Page SHALL create a Real_Time_Subscription to the `insurance_analysis` table on component mount
2. WHEN a new record is inserted into `insurance_analysis`, THE Real_Time_Subscription SHALL trigger a data refresh on the Overview_Page
3. WHEN the data refresh completes, THE Overview_Page SHALL display a toast notification indicating "Insurance analysis complete"
4. THE Overview_Page SHALL update the Protection_Score, Financial_Health_Score, and insurance alerts within 2 seconds of receiving the subscription event
5. THE Real_Time_Subscription SHALL filter events to only the current user's records using `user_id` filter
6. THE Overview_Page SHALL clean up the Real_Time_Subscription on component unmount to prevent memory leaks
7. WHEN the subscription connection fails, THE Overview_Page SHALL log the error and continue functioning with manual refresh capability

### Requirement 6: Handle Partial Success and Error Scenarios

**User Story:** As a user, I want to see helpful error messages and partial results when analysis fails, so that I can understand what went wrong and take corrective action.

#### Acceptance Criteria

1. WHEN the API returns `status: "partial_success"`, THE Frontend_Upload_Flow SHALL display a warning banner indicating which Pipeline_Stages failed
2. THE Frontend_Upload_Flow SHALL display all available data from `partial_success` responses in the Analysis_Report_Modal
3. WHEN the API returns `status: "failed"` with error code `SCANNED_PDF_DETECTED`, THE Frontend_Upload_Flow SHALL display message "This appears to be a scanned PDF. Please upload a text-based PDF for best results."
4. WHEN the API returns `status: "failed"` with error code `EXTRACTION_FAILED`, THE Frontend_Upload_Flow SHALL display message "Could not extract policy details. Please ensure the PDF is clear and text-based."
5. WHEN the API returns `status: "failed"` with error code `RATE_LIMIT_EXCEEDED`, THE Frontend_Upload_Flow SHALL display the daily limit and suggest trying again tomorrow
6. WHEN the API returns `status: "failed"` with error code `FILE_TOO_LARGE`, THE Frontend_Upload_Flow SHALL display the maximum file size (50MB) and suggest compressing the PDF
7. WHEN extractedFields are missing critical data (insurerName, sumInsured), THE Frontend_Upload_Flow SHALL display a warning and allow manual entry
8. THE Frontend_Upload_Flow SHALL log all error responses to the browser console with structured error details for debugging

### Requirement 7: Validate End-to-End Data Flow

**User Story:** As a developer, I want to ensure data flows correctly from upload to display to database, so that users see accurate and complete information.

#### Acceptance Criteria

1. WHEN a user uploads a policy PDF, THE system SHALL save the policy record to `insurance_policies` table with all extracted fields
2. WHEN the pipeline completes analysis, THE system SHALL save the analysis record to `insurance_analysis` table with `policy_id` foreign key reference
3. WHEN recommendations are generated, THE system SHALL save recommendation records to `insurance_recommendations` table with `policy_id` foreign key reference
4. THE Overview_Page SHALL query `insurance_analysis` table joined with `insurance_policies` to display the most recent analysis for each policy
5. THE Overview_Page SHALL display the policy score from `insurance_analysis.policy_score` field
6. THE Overview_Page SHALL display risk alerts from `insurance_analysis.risk_analysis` field
7. THE Overview_Page SHALL display recommendations from `insurance_recommendations` table ordered by priority
8. WHEN a user navigates from Overview_Page to insurance page, THE insurance page SHALL display all saved policies with their analysis status

### Requirement 8: Implement UI Error Handling and Loading States

**User Story:** As a user, I want clear visual feedback during loading and errors, so that I understand the system state and can take appropriate action.

#### Acceptance Criteria

1. WHEN a file upload starts, THE Frontend_Upload_Flow SHALL disable the upload button and display a loading spinner
2. WHILE the pipeline is executing, THE Frontend_Upload_Flow SHALL display an animated progress indicator with stage names
3. WHEN the pipeline completes, THE Frontend_Upload_Flow SHALL hide the loading state and show results within 500ms
4. WHEN an error occurs, THE Frontend_Upload_Flow SHALL display an error toast with the error message and a "Dismiss" button
5. THE error toast SHALL auto-dismiss after 8 seconds unless the user dismisses it manually
6. WHEN displaying partial results, THE Frontend_Upload_Flow SHALL show a warning icon next to incomplete sections
7. THE Analysis_Report_Modal SHALL display skeleton loaders for sections that are loading data
8. WHEN the Overview_Page is loading insurance data, THE Protection_Score card SHALL display a skeleton loader

### Requirement 9: Optimize Performance and User Experience

**User Story:** As a user, I want the insurance upload and analysis to be fast and responsive, so that I can quickly understand my policy coverage.

#### Acceptance Criteria

1. THE Frontend_Upload_Flow SHALL validate file type and size client-side before sending to the API
2. THE Frontend_Upload_Flow SHALL display file validation errors immediately without making an API call
3. THE Analysis_Report_Modal SHALL lazy-load tab content to reduce initial render time
4. THE Overview_Page SHALL cache insurance data for 5 minutes to reduce database queries
5. THE Real_Time_Subscription SHALL use debouncing to prevent multiple rapid updates within 1 second
6. THE Frontend_Upload_Flow SHALL compress large PDFs client-side before upload if they exceed 10MB
7. THE Analysis_Report_Modal SHALL use virtualization for long lists (risks, recommendations) exceeding 20 items
8. THE Overview_Page SHALL load insurance data in parallel with other dashboard data to minimize total load time

### Requirement 10: Ensure Accessibility and Responsive Design

**User Story:** As a user with accessibility needs, I want the insurance interface to be accessible and work on all devices, so that I can use the application effectively.

#### Acceptance Criteria

1. THE Frontend_Upload_Flow SHALL provide keyboard navigation for all interactive elements
2. THE Analysis_Report_Modal SHALL support screen readers with proper ARIA labels and roles
3. THE progress indicators SHALL announce stage changes to screen readers
4. THE error messages SHALL have sufficient color contrast (WCAG AA minimum 4.5:1)
5. THE Analysis_Report_Modal SHALL be responsive and usable on mobile devices (320px minimum width)
6. THE Overview_Page insurance cards SHALL be responsive and stack vertically on mobile devices
7. THE Frontend_Upload_Flow SHALL support touch gestures for file upload on mobile devices
8. THE Analysis_Report_Modal tabs SHALL be horizontally scrollable on mobile devices

## Special Requirements Guidance

### Parser and Serializer Requirements

This feature does not involve custom parsers or serializers. The PDF parsing is handled by the backend pipeline using existing libraries.

### Round-Trip Properties

WHEN a policy is saved to the database and then retrieved, THE system SHALL preserve all extracted fields with the same values (round-trip property).

### Idempotence

WHEN the same PDF is uploaded multiple times, THE system SHALL produce consistent analysis results (idempotent analysis).

### Error Conditions

THE Frontend_Upload_Flow SHALL test and handle all error codes returned by the `/api/insurance/analyze` endpoint:
- `AUTHENTICATION_REQUIRED`
- `INVALID_TOKEN`
- `RATE_LIMIT_EXCEEDED`
- `NO_FILE_PROVIDED`
- `FILE_TOO_LARGE`
- `INVALID_FILE_TYPE`
- `PIPELINE_FAILED`
- `INTERNAL_ERROR`

## Iteration and Feedback Rules

- The model MUST make modifications if the user requests changes
- The model MUST incorporate all user feedback before proceeding
- The model MUST offer to return to previous steps if gaps are identified

## Phase Completion

This requirements document is now complete and ready for review. Please provide feedback or approve to proceed to the design phase.
