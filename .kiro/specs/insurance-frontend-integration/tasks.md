# Implementation Plan: Insurance Frontend Integration

## Overview

This implementation plan integrates the new insurance pipeline backend (`/api/insurance/analyze`) with the frontend application. The tasks focus on updating the upload flow, displaying pipeline progress, mapping analysis data to UI components, integrating insurance data into the Overview page, and implementing real-time updates via Supabase subscriptions.

**Key Implementation Notes**:
- Use CONFIRMED production schema: `insurance_policies`, `insurance_analysis`, `insurance_recommendations`
- API endpoint: `POST /api/insurance/analyze`
- 7 pipeline stages: upload → process → classify → extract → analyze → gap → recommend
- Real-time updates via Supabase subscriptions
- Handle partial success and error scenarios

## Tasks

- [x] 1. Create pipeline progress indicator component
  - [x] 1.1 Create PipelineProgressIndicator component
    - Create `src/components/insurance/PipelineProgressIndicator.tsx`
    - Implement indeterminate spinner with stage list display
    - Show all 7 stages: upload, process, classify, extract, analyze, gap, recommend
    - Add visual states: pending, in-progress, success, failed
    - Include estimated time display (2-3 seconds average)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 1.2 Write unit tests for PipelineProgressIndicator
    - Test stage state transitions
    - Test error state display
    - Test accessibility attributes
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 1.3 Create pipeline stages constants file
    - Create `src/lib/insurance/pipelineStages.ts`
    - Define stage names, descriptions, and order
    - Export stage type definitions
    - _Requirements: 2.1, 2.2_

- [x] 2. Update insurance upload flow API integration
  - [x] 2.1 Update handlePolicyUpload function in insurance page
    - Modify `src/app/(dashboard)/insurance/page.tsx`
    - Change API endpoint from old to `/api/insurance/analyze`
    - Add policyType parameter to request
    - Integrate PipelineProgressIndicator component
    - Handle response statuses: success, partial_success, failed
    - Auto-fill form fields from extractedFields in response
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 2.2 Implement error handling for all error codes
    - Handle SCANNED_PDF_DETECTED with specific message
    - Handle EXTRACTION_FAILED with helpful guidance
    - Handle RATE_LIMIT_EXCEEDED with daily limit info
    - Handle FILE_TOO_LARGE with size limit (50MB)
    - Handle AUTHENTICATION_REQUIRED, INVALID_TOKEN, NO_FILE_PROVIDED, INVALID_FILE_TYPE, PIPELINE_FAILED, INTERNAL_ERROR
    - Display error toasts with 8-second auto-dismiss
    - Log structured error details to console
    - _Requirements: 1.6, 1.8, 6.1, 6.3, 6.4, 6.5, 6.6, 6.8_
  
  - [x] 2.3 Implement client-side file validation
    - Validate file type (PDF only) before upload
    - Validate file size (max 50MB) before upload
    - Display validation errors immediately without API call
    - Add loading states: disable upload button, show spinner
    - _Requirements: 8.1, 8.2, 9.1, 9.2_
  
  - [ ]* 2.4 Write integration tests for upload flow
    - Test successful upload and analysis
    - Test partial success scenarios
    - Test error scenarios with different error codes
    - Test file validation
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 6.1, 6.3, 6.4, 6.5, 6.6_

- [x] 3. Checkpoint - Verify upload flow works end-to-end
  - Test file upload with real PDF
  - Verify progress indicator displays correctly
  - Verify error handling works for invalid files
  - Ensure all tests pass, ask the user if questions arise

- [x] 4. Update Analysis Report Modal data mapping
  - [x] 4.1 Verify and update PolicyAnalysisModal component
    - Review `src/components/insurance/PolicyAnalysisModal.tsx`
    - Map `policyScore.totalScore` to overall score display
    - Map `policyScore.grade` to letter grade display
    - Map `riskAnalysis.risks` array to risks section with severity indicators
    - Map `coverageGapAnalysis` to coverage gap section (current vs recommended)
    - Map `report.humanReadableReport` to AI analysis summary
    - Map `report.suggestedImprovements` to recommendations list
    - Map `extractedFields` to policy details section
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [x] 4.2 Implement safe fallback values for missing fields
    - Display "Not specified" for missing optional fields
    - Display "Check policy document" for critical missing fields
    - Add warning icons next to incomplete sections for partial_success
    - _Requirements: 3.8, 6.2_
  
  - [x] 4.3 Implement lazy loading for modal tabs
    - Lazy-load tab content to reduce initial render time
    - Add skeleton loaders for loading sections
    - Implement virtualization for long lists (>20 items)
    - _Requirements: 8.7, 9.3, 9.7_
  
  - [ ]* 4.4 Write unit tests for modal data mapping
    - Test all field mappings
    - Test fallback values for missing data
    - Test partial success display
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 6.2_

- [x] 5. Integrate insurance data into Overview page
  - [x] 5.1 Update Overview page to query insurance tables
    - Modify `src/app/(dashboard)/overview/page.tsx`
    - Query `insurance_policies` table with join to `insurance_analysis`
    - Query `insurance_recommendations` table
    - Use correct schema: `insurance_policies`, `insurance_analysis`, `insurance_recommendations`
    - Fetch most recent analysis for each policy
    - Load insurance data in parallel with other dashboard data
    - _Requirements: 4.1, 4.2, 7.4, 7.5, 9.8_
  
  - [x] 5.2 Update Protection Score display
    - Map `policyScore.totalScore` from `insurance_analysis` to Protection Score
    - Display sum insured from `insurance_policies.sum_insured`
    - Calculate and display coverage gap from `insurance_analysis.coverage_gap_analysis`
    - Add skeleton loader for loading state
    - _Requirements: 4.2, 4.6, 4.7, 8.8_
  
  - [x] 5.3 Update Financial Health Score calculation
    - Include Protection Score as weighted component in Financial Health Score
    - Update score calculation logic to incorporate insurance data
    - _Requirements: 4.4_
  
  - [x] 5.4 Display insurance alerts in AI Financial Alerts section
    - Extract high and critical severity risks from `insurance_analysis.risk_analysis`
    - Display risks in AI Financial Alerts section
    - Remove "No Health Insurance Detected" alert when active health policy exists
    - _Requirements: 4.3, 4.5_
  
  - [x] 5.5 Add prompt for users with no insurance policies
    - Display prompt when no policies exist in `insurance_policies`
    - Include link to insurance page
    - _Requirements: 4.8_
  
  - [x] 5.6 Implement data caching for performance
    - Cache insurance data for 5 minutes to reduce database queries
    - Invalidate cache on real-time updates
    - _Requirements: 9.4_
  
  - [ ]* 5.7 Write unit tests for Overview page insurance integration
    - Test data fetching and display
    - Test Protection Score calculation
    - Test Financial Health Score calculation
    - Test alert display logic
    - Test no-policies prompt
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 6. Implement real-time updates with Supabase subscriptions
  - [x] 6.1 Create real-time subscription in Overview page
    - Add subscription to `insurance_analysis` table on component mount
    - Filter events by current user's `user_id`
    - Trigger data refresh on INSERT events
    - Clean up subscription on component unmount
    - _Requirements: 5.1, 5.2, 5.5, 5.6_
  
  - [x] 6.2 Implement subscription event handlers
    - Update Protection Score within 2 seconds of event
    - Update Financial Health Score within 2 seconds of event
    - Update insurance alerts within 2 seconds of event
    - Display toast notification: "Insurance analysis complete"
    - Implement debouncing to prevent multiple rapid updates (1 second)
    - _Requirements: 5.3, 5.4, 9.5_
  
  - [x] 6.3 Add error handling for subscription failures
    - Log subscription connection errors to console
    - Continue functioning with manual refresh capability
    - _Requirements: 5.7_
  
  - [ ]* 6.4 Write integration tests for real-time updates
    - Test subscription creation and cleanup
    - Test event handling and data refresh
    - Test debouncing logic
    - Test error handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 7. Checkpoint - Verify Overview page integration
  - Test Overview page displays insurance data correctly
  - Test real-time updates when analysis completes
  - Test Protection Score and Financial Health Score calculations
  - Ensure all tests pass, ask the user if questions arise

- [x] 8. Update useInsurance hook with analysis methods
  - [x] 8.1 Add analysis fetching methods to useInsurance hook
    - Modify `src/hooks/useInsurance.ts`
    - Add `fetchPolicyAnalysis(policyId)` method
    - Add `fetchAllAnalyses()` method
    - Use correct table name: `insurance_analysis`
    - Return typed analysis data
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 8.2 Write unit tests for new hook methods
    - Test fetchPolicyAnalysis
    - Test fetchAllAnalyses
    - Test error handling
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 9. Validate end-to-end data flow
  - [x] 9.1 Verify database record creation
    - Test policy record saved to `insurance_policies` with all extracted fields
    - Test analysis record saved to `insurance_analysis` with `policy_id` foreign key
    - Test recommendations saved to `insurance_recommendations` with `policy_id` foreign key
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 9.2 Verify data display on Overview page
    - Test Overview page queries `insurance_analysis` joined with `insurance_policies`
    - Test policy score displayed from `insurance_analysis.policy_score`
    - Test risk alerts displayed from `insurance_analysis.risk_analysis`
    - Test recommendations displayed from `insurance_recommendations` ordered by priority
    - _Requirements: 7.4, 7.5, 7.6, 7.7_
  
  - [x] 9.3 Verify navigation between pages
    - Test navigation from Overview to insurance page
    - Test insurance page displays all saved policies with analysis status
    - _Requirements: 7.8_
  
  - [ ]* 9.4 Write end-to-end integration tests
    - Test complete flow: upload → analysis → display → real-time update
    - Test data persistence across page navigation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 10. Implement accessibility and responsive design
  - [x] 10.1 Add keyboard navigation and ARIA labels
    - Add keyboard navigation to upload flow
    - Add ARIA labels and roles to Analysis Report Modal
    - Add screen reader announcements for progress indicators
    - Add screen reader announcements for stage changes
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x] 10.2 Ensure color contrast and responsive layout
    - Verify error messages have WCAG AA contrast (4.5:1 minimum)
    - Make Analysis Report Modal responsive (320px minimum width)
    - Make Overview page insurance cards stack vertically on mobile
    - Make modal tabs horizontally scrollable on mobile
    - _Requirements: 10.4, 10.5, 10.6, 10.8_
  
  - [x] 10.3 Add mobile touch support
    - Support touch gestures for file upload on mobile
    - Test touch interactions on all components
    - _Requirements: 10.7_
  
  - [ ]* 10.4 Write accessibility tests
    - Test keyboard navigation
    - Test screen reader compatibility
    - Test color contrast
    - Test responsive breakpoints
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 11. Final checkpoint - Complete end-to-end testing
  - Test complete user flow: upload → progress → analysis → Overview update
  - Test all error scenarios
  - Test accessibility on screen readers
  - Test responsive design on mobile devices
  - Verify all requirements are met
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Use CONFIRMED production schema: `insurance_policies`, `insurance_analysis`, `insurance_recommendations`
- API endpoint: `POST /api/insurance/analyze`
- Checkpoints ensure incremental validation
- Real-time updates use Supabase subscriptions with proper cleanup
- Error handling covers all API error codes
- Accessibility and responsive design are built-in throughout
