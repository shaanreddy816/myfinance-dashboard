# Implementation Plan

## Bug 1: Spouse Dashboard Not Showing

- [ ] 1.1 Write bug condition exploration test for spouse dashboard
  - **Property 1: Fault Condition** - Spouse Dashboard Missing
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing case: user with spouse added (e.g., "Saritha God")
  - Test that when a spouse is added to family profile, a separate dashboard view exists for the spouse
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1_

- [ ] 1.2 Write preservation property tests for dashboard functionality (BEFORE implementing fix)
  - **Property 2: Preservation** - Primary User Dashboard Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns:
    - Primary user dashboard displays correctly (3.3)
    - Users without spouse show only primary dashboard (3.4)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.3, 3.4_

- [-] 1.3 Fix spouse dashboard visibility
  - [x] 1.3.1 Implement the fix
    - Investigate family profile data structure and spouse relationship storage
    - Add logic to detect when spouse exists in family profile
    - Create separate dashboard view/component for spouse
    - Ensure spouse dashboard displays spouse-specific financial data
    - _Bug_Condition: User has added spouse to family profile_
    - _Expected_Behavior: System displays separate individual financial dashboard view for spouse (2.1)_
    - _Preservation: Primary user dashboard continues to display correctly (3.3), users without spouse show only primary dashboard (3.4)_
    - _Requirements: 1.1, 2.1, 3.3, 3.4_

  - [ ] 1.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Spouse Dashboard Visible
    - **IMPORTANT**: Re-run the SAME test from task 1.1 - do NOT write a new test
    - The test from task 1.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1_

  - [ ] 1.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Primary User Dashboard Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 1.2 - do NOT write new tests
    - Run preservation property tests from step 1.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 2: WhatsApp Message Sending Failed

- [ ] 2.1 Write bug condition exploration test for WhatsApp messaging
  - **Property 1: Fault Condition** - WhatsApp Send Failure
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing case: user adds phone number and attempts test message
  - Test that sending test WhatsApp message returns success (not error "❌ Failed to send test message")
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.2_

- [ ] 2.2 Write preservation property tests for contact management (BEFORE implementing fix)
  - **Property 2: Preservation** - Contact Information Handling
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns:
    - Other contact information (email, etc.) saves and validates correctly (3.9)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.9_

- [-] 2.3 Fix WhatsApp message sending
  - [x] 2.3.1 Implement the fix
    - Investigate WhatsApp API integration and error logs
    - Check API credentials, endpoint configuration, and request format
    - Fix authentication or configuration issues causing send failure
    - Ensure success confirmation displays after successful send
    - _Bug_Condition: User adds phone number and attempts to send test WhatsApp message_
    - _Expected_Behavior: System successfully sends WhatsApp message and displays success confirmation (2.2)_
    - _Preservation: Other contact information continues to save and validate correctly (3.9)_
    - _Requirements: 1.2, 2.2, 3.9_

  - [ ] 2.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - WhatsApp Send Success
    - **IMPORTANT**: Re-run the SAME test from task 2.1 - do NOT write a new test
    - The test from task 2.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 2.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.2_

  - [ ] 2.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Contact Information Handling
    - **IMPORTANT**: Re-run the SAME tests from task 2.2 - do NOT write new tests
    - Run preservation property tests from step 2.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 3: Page Refresh Logs Out User

- [ ] 3.1 Write bug condition exploration test for page refresh session
  - **Property 1: Fault Condition** - Session Lost on Refresh
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing case: user adds income data then refreshes browser
  - Test that after page refresh, user session remains authenticated (no forced re-authentication)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.3_

- [ ] 3.2 Write preservation property tests for session management (BEFORE implementing fix)
  - **Property 2: Preservation** - Standard Session Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns:
    - Standard navigation without refresh maintains session (3.1)
    - Login with valid credentials establishes session (3.2)
    - Income data saves correctly through standard form (3.7)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.7_

- [ ] 3.3 Fix page refresh session persistence
  - [x] 3.3.1 Implement the fix
    - Investigate session storage mechanism (cookies, localStorage, sessionStorage)
    - Check session token persistence and refresh token handling
    - Fix session restoration logic on page load/refresh
    - Ensure authentication state persists across page refreshes
    - _Bug_Condition: User adds income data and refreshes browser page_
    - _Expected_Behavior: System maintains authenticated session without requiring re-authentication (2.3)_
    - _Preservation: Standard navigation maintains session (3.1), login establishes session (3.2), income data saves correctly (3.7)_
    - _Requirements: 1.3, 2.3, 3.1, 3.2, 3.7_

  - [ ] 3.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Session Persists on Refresh
    - **IMPORTANT**: Re-run the SAME test from task 3.1 - do NOT write a new test
    - The test from task 3.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 3.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.3_

  - [ ] 3.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Standard Session Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 3.2 - do NOT write new tests
    - Run preservation property tests from step 3.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 4: Zerodha Connection Logs Out User

- [ ] 4.1 Write bug condition exploration test for Zerodha connection session
  - **Property 1: Fault Condition** - Session Lost on Zerodha Connection
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing case: user navigates to investments and attempts Zerodha connection
  - Test that during Zerodha connection flow, user session remains authenticated (no forced re-authentication)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.4_

- [ ] 4.2 Write preservation property tests for third-party integrations (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Integration Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns:
    - Already connected Zerodha displays portfolio correctly (3.8)
    - Standard navigation maintains session (3.1)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.8, 3.1_

- [ ] 4.3 Fix Zerodha connection session persistence
  - [x] 4.3.1 Implement the fix
    - Investigate Zerodha OAuth/connection flow and redirect handling
    - Check session token handling during third-party redirect
    - Fix session restoration after Zerodha callback/redirect
    - Ensure authentication state persists through Zerodha connection flow
    - _Bug_Condition: User navigates to investments and attempts to connect to Zerodha_
    - _Expected_Behavior: System completes Zerodha connection while maintaining authenticated session (2.4)_
    - _Preservation: Already connected Zerodha displays portfolio correctly (3.8), standard navigation maintains session (3.1)_
    - _Requirements: 1.4, 2.4, 3.8, 3.1_

  - [ ] 4.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Session Persists Through Zerodha Connection
    - **IMPORTANT**: Re-run the SAME test from task 4.1 - do NOT write a new test
    - The test from task 4.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 4.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.4_

  - [ ] 4.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Integration Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 4.2 - do NOT write new tests
    - Run preservation property tests from step 4.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 5: Loan File Upload Parse Error

- [ ] 5.1 Write bug condition exploration test for loan file parsing
  - **Property 1: Fault Condition** - Loan File Parse Failure
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing case: user uploads loan document file
  - Test that loan file upload successfully parses and extracts data (not error "❌ Failed to parse: Failed to execute 'json' on 'Response': Unexpected end of JSON input")
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.5_

- [ ] 5.2 Write preservation property tests for loan data management (BEFORE implementing fix)
  - **Property 2: Preservation** - Manual Loan Entry Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns:
    - Manual loan data entry saves and displays correctly (3.5)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.5_

- [ ] 5.3 Fix loan file upload parsing
  - [x] 5.3.1 Implement the fix
    - Investigate loan file parsing API endpoint and response handling
    - Check JSON parsing logic and error handling for malformed responses
    - Fix API response format or add proper error handling for empty/incomplete responses
    - Ensure loan data extraction and field population works correctly
    - _Bug_Condition: User uploads loan document file in loans section_
    - _Expected_Behavior: System successfully parses document, extracts loan data, and populates loan fields (2.5)_
    - _Preservation: Manual loan data entry continues to save and display correctly (3.5)_
    - _Requirements: 1.5, 2.5, 3.5_

  - [ ] 5.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Loan File Parse Success
    - **IMPORTANT**: Re-run the SAME test from task 5.1 - do NOT write a new test
    - The test from task 5.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 5.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.5_

  - [ ] 5.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Manual Loan Entry Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 5.2 - do NOT write new tests
    - Run preservation property tests from step 5.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 6: Health Insurance PDF Upload Error

- [ ] 6.1 Write bug condition exploration test for health insurance PDF parsing
  - **Property 1: Fault Condition** - PDF Parse API Error 405
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing case: user uploads health insurance PDF document
  - Test that PDF upload successfully parses and extracts data (not error "❌ Failed to parse PDF: API error 405")
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.6_

- [ ] 6.2 Write preservation property tests for insurance data management (BEFORE implementing fix)
  - **Property 2: Preservation** - Manual Insurance Entry Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns:
    - Manual health insurance data entry saves and displays correctly (3.6)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.6_

- [ ] 6.3 Fix health insurance PDF upload parsing
  - [x] 6.3.1 Implement the fix
    - Investigate PDF parsing API endpoint and HTTP method configuration
    - Check if API error 405 (Method Not Allowed) indicates wrong HTTP method (GET vs POST)
    - Fix API endpoint configuration or request method
    - Ensure PDF data extraction and insurance field population works correctly
    - _Bug_Condition: User uploads health insurance PDF document_
    - _Expected_Behavior: System successfully parses PDF, extracts insurance details, and populates insurance fields (2.6)_
    - _Preservation: Manual health insurance data entry continues to save and display correctly (3.6)_
    - _Requirements: 1.6, 2.6, 3.6_

  - [ ] 6.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - PDF Parse Success
    - **IMPORTANT**: Re-run the SAME test from task 6.1 - do NOT write a new test
    - The test from task 6.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 6.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.6_

  - [ ] 6.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Manual Insurance Entry Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 6.2 - do NOT write new tests
    - Run preservation property tests from step 6.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Final Checkpoint

- [ ] 7. Checkpoint - Ensure all tests pass
  - Verify all 6 bug fixes are complete
  - Ensure all exploration tests now pass (bugs are fixed)
  - Ensure all preservation tests still pass (no regressions)
  - Ask the user if questions arise
