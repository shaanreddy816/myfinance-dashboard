# Bugfix Requirements Document

## Introduction

This document addresses six critical bugs in FamLedgerAI that are blocking core functionality after user registration and profile wizard completion. These bugs affect spouse dashboard visibility, WhatsApp messaging, session persistence, third-party integrations, and document parsing capabilities. All issues prevent users from completing essential financial management tasks.

## Bug Analysis

### Current Behavior (Defect)

**Issue 1: Spouse Dashboard Not Showing**

1.1 WHEN a user adds a spouse (e.g., "Saritha God") to their family profile THEN the system does not display a separate dashboard for the spouse

**Issue 2: WhatsApp Message Sending Failed**

1.2 WHEN a user adds a phone number and attempts to send a test WhatsApp message THEN the system returns error "❌ Failed to send test message"

**Issue 3: Page Refresh Logs Out User**

1.3 WHEN a user adds income data and then refreshes the browser page THEN the system logs out the user and forces re-authentication

**Issue 4: Zerodha Connection Logs Out User**

1.4 WHEN a user navigates to the investments section and attempts to connect to Zerodha THEN the system logs out the user and forces re-authentication

**Issue 5: Loan File Upload Parse Error**

1.5 WHEN a user uploads a loan document file in the loans section THEN the system returns error "❌ Failed to parse: Failed to execute 'json' on 'Response': Unexpected end of JSON input. Try adding manually."

**Issue 6: Health Insurance PDF Upload Error**

1.6 WHEN a user uploads a health insurance PDF document THEN the system returns error "❌ Failed to parse PDF: API error 405"

### Expected Behavior (Correct)

**Issue 1: Spouse Dashboard Not Showing**

2.1 WHEN a user adds a spouse to their family profile THEN the system SHALL display a separate individual financial dashboard view for the spouse

**Issue 2: WhatsApp Message Sending Failed**

2.2 WHEN a user adds a phone number and attempts to send a test WhatsApp message THEN the system SHALL successfully send the WhatsApp message and display a success confirmation

**Issue 3: Page Refresh Logs Out User**

2.3 WHEN a user adds income data and then refreshes the browser page THEN the system SHALL maintain the user's authenticated session without requiring re-authentication

**Issue 4: Zerodha Connection Logs Out User**

2.4 WHEN a user navigates to the investments section and attempts to connect to Zerodha THEN the system SHALL complete the Zerodha connection flow while maintaining the user's authenticated session

**Issue 5: Loan File Upload Parse Error**

2.5 WHEN a user uploads a loan document file in the loans section THEN the system SHALL successfully parse the document, extract loan data, and populate the loan fields

**Issue 6: Health Insurance PDF Upload Error**

2.6 WHEN a user uploads a health insurance PDF document THEN the system SHALL successfully parse the PDF, extract insurance details, and populate the insurance fields

### Unchanged Behavior (Regression Prevention)

**General Session Management**

3.1 WHEN a user performs standard navigation between pages without refresh THEN the system SHALL CONTINUE TO maintain the authenticated session

3.2 WHEN a user logs in with valid credentials THEN the system SHALL CONTINUE TO establish an authenticated session successfully

**Dashboard Functionality**

3.3 WHEN a user views their own (primary user) dashboard THEN the system SHALL CONTINUE TO display their individual financial data correctly

3.4 WHEN a user has not added a spouse THEN the system SHALL CONTINUE TO display only the primary user's dashboard

**Data Entry and Management**

3.5 WHEN a user manually enters loan data without file upload THEN the system SHALL CONTINUE TO save and display the loan information correctly

3.6 WHEN a user manually enters health insurance data without PDF upload THEN the system SHALL CONTINUE TO save and display the insurance information correctly

3.7 WHEN a user adds income data through the standard form THEN the system SHALL CONTINUE TO save the income information correctly

**Third-Party Integrations**

3.8 WHEN a user has already connected to Zerodha and views investment data THEN the system SHALL CONTINUE TO display the connected Zerodha portfolio information correctly

**Communication Features**

3.9 WHEN a user adds other contact information (email, etc.) THEN the system SHALL CONTINUE TO save and validate the contact details correctly
