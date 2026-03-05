# Dashboard Issue Bugfix Design

## Overview

This design addresses six critical bugs in FamLedgerAI that block core functionality after user registration and profile wizard completion. The bugs span multiple domains: UI rendering (spouse dashboard), third-party integrations (WhatsApp, Zerodha), session management (page refresh, OAuth redirects), and document parsing (loan and insurance PDFs). Each bug has been analyzed to identify root causes and define targeted fixes that preserve existing functionality.

## Glossary

- **Bug_Condition (C)**: The condition that triggers each specific bug
- **Property (P)**: The desired behavior when the bug condition holds
- **Preservation**: Existing functionality that must remain unchanged by the fixes
- **familyMembers**: Array in `userData.profile.familyMembers` containing family member objects with `{id, name, role}` structure
- **populateProfileSelector()**: Function in `index.html` (line ~9512) that populates the profile dropdown with family member options
- **currentProfile**: Global variable tracking which family member's dashboard is currently displayed
- **sb.auth**: Supabase authentication client used for session management
- **checkSession()**: Function that validates and restores user session on page load
- **onAuthStateChange**: Supabase auth listener that fires on authentication state changes
- **connectZerodha()**: Function that initiates OAuth flow by redirecting to Kite login
- **handleZerodhaCallback**: API endpoint (`/api/integrations/zerodha/callback`) that processes OAuth callback
- **handleWhatsAppSend**: API endpoint (`/api/whatsapp/send`) that sends WhatsApp messages via Twilio
- **handleLoanParseStatement**: API endpoint (`/api/loan/parse-statement`) that extracts loan data from PDFs
- **handleInsuranceParsePdf**: API endpoint (`/api/insurance/parse-pdf`) that extracts insurance policy data from PDFs
- **CORS**: Cross-Origin Resource Sharing - security mechanism that controls API access from different domains


## Bug Details

### Bug 1: Spouse Dashboard Not Showing

#### Fault Condition

The bug manifests when a user adds a spouse to their family profile through the settings page. The `populateProfileSelector()` function correctly adds family members to the dropdown, but the spouse's individual dashboard view is not accessible or does not display correctly.

**Formal Specification:**
```
FUNCTION isBugCondition_SpouseDashboard(input)
  INPUT: input of type { familyMembers: Array, currentProfile: string }
  OUTPUT: boolean
  
  RETURN input.familyMembers.length > 0
         AND input.familyMembers.some(m => m.role === 'spouse')
         AND (profileSelectorMissingSpouse(input.familyMembers) 
              OR dashboardNotRenderedForSpouse(input.currentProfile))
END FUNCTION
```

#### Examples

- User adds spouse "Saritha God" via Settings → Family Members
- Expected: Dropdown shows "💑 Saritha God" option, selecting it displays Saritha's individual dashboard
- Actual: Spouse may not appear in dropdown, or selecting spouse shows empty/incorrect data

#### Root Cause Analysis

Based on code analysis of `index.html` (lines 9512-9530):

1. **Dropdown Population Logic**: The `populateProfileSelector()` function checks if `userData.profile.familyMembers` array exists and has length > 0. If true, it iterates and adds options. However, there may be a timing issue where the function is called before family members are saved.

2. **Data Persistence Issue**: When a spouse is added in Settings, the data may not be immediately persisted to `userData.profile.familyMembers` before `populateProfileSelector()` is called.

3. **Dashboard Rendering Logic**: The dashboard rendering functions (e.g., `renderOverview()`, `renderExpenses()`) use `currentProfile` to filter data. If the spouse's data structure is not properly initialized in `userData.expenses.byMember`, `userData.investments.byMember`, etc., the dashboard will appear empty.


### Bug 2: WhatsApp Message Sending Failed

#### Fault Condition

The bug manifests when a user adds a phone number in their profile and attempts to send a test WhatsApp message. The system returns error "❌ Failed to send test message".

**Formal Specification:**
```
FUNCTION isBugCondition_WhatsApp(input)
  INPUT: input of type { phoneNumber: string, testMessageRequest: boolean }
  OUTPUT: boolean
  
  RETURN input.phoneNumber IS_VALID
         AND input.testMessageRequest === true
         AND whatsAppMessageFails(input.phoneNumber)
END FUNCTION
```

#### Examples

- User enters phone number "+919876543210" in profile settings
- User clicks "Send Test Message" button
- Expected: Success message "✅ Test message sent successfully"
- Actual: Error message "❌ Failed to send test message"

#### Root Cause Analysis

Based on code analysis of `api/[...catchall].js` (lines 2479-2505):

1. **Missing API Credentials**: The `handleWhatsAppSend` function calls `sendWhatsAppMessage(to, message)` from `lib/api/whatsapp.js`. This requires `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` environment variables. If these are missing or invalid, the function will throw an error.

2. **Twilio Sandbox Configuration**: For development/testing, Twilio requires users to join the WhatsApp sandbox by sending "join [sandbox-keyword]" to the Twilio WhatsApp number. If the user hasn't joined the sandbox, Twilio returns error code 21408.

3. **Phone Number Format**: The phone number must be in E.164 format (e.g., "+919876543210"). If the user enters a number without the country code or with incorrect formatting, Twilio will reject it.

4. **CORS/API Routing**: The frontend calls `/api/whatsapp/send`, which should be routed to `handleWhatsAppSend` in the catchall handler. If the routing is incorrect or CORS headers are missing, the request will fail.


### Bug 3: Page Refresh Logs Out User

#### Fault Condition

The bug manifests when a user adds income data (or performs any action) and then refreshes the browser page. The system logs out the user and forces re-authentication.

**Formal Specification:**
```
FUNCTION isBugCondition_PageRefresh(input)
  INPUT: input of type { userAction: string, pageRefresh: boolean, sessionActive: boolean }
  OUTPUT: boolean
  
  RETURN input.sessionActive === true
         AND input.pageRefresh === true
         AND userLoggedOutAfterRefresh()
END FUNCTION
```

#### Examples

- User is logged in and adds income data
- User refreshes the browser (F5 or Ctrl+R)
- Expected: User remains logged in, data is preserved
- Actual: User is logged out, redirected to login page

#### Root Cause Analysis

Based on code analysis of `index.html` (lines 9430-9500, 16000-16050):

1. **Session Storage Issue**: Supabase stores session tokens in localStorage by default. If the session is not being properly persisted or retrieved, `sb.auth.getSession()` will return null on page refresh.

2. **Race Condition**: The `checkSession()` function is called on `window.onload`, and `sb.auth.onAuthStateChange` is also registered. There's a mutex (`isLoadingSession`) to prevent race conditions, but if the session check fails before the auth state listener fires, the user will be logged out.

3. **Session Expiry**: Supabase sessions expire after a certain period (default 1 hour). If the session has expired and the refresh token is not being used to obtain a new session, the user will be logged out.

4. **Supabase Client Configuration**: The Supabase client initialization may not be configured to persist sessions correctly. The `persistSession` option should be set to `true` (which is the default).


### Bug 4: Zerodha Connection Logs Out User

#### Fault Condition

The bug manifests when a user navigates to the investments section and attempts to connect to Zerodha. The OAuth flow redirects to Kite login, but after successful authentication, the user is logged out of FamLedgerAI.

**Formal Specification:**
```
FUNCTION isBugCondition_ZerodhaOAuth(input)
  INPUT: input of type { zerodhaConnectRequest: boolean, oauthRedirect: boolean, sessionActive: boolean }
  OUTPUT: boolean
  
  RETURN input.sessionActive === true
         AND input.zerodhaConnectRequest === true
         AND input.oauthRedirect === true
         AND userLoggedOutAfterOAuthCallback()
END FUNCTION
```

#### Examples

- User is logged in and navigates to Investments page
- User clicks "Connect Zerodha" button
- User is redirected to Kite login page
- User authenticates with Zerodha
- Expected: User is redirected back to FamLedgerAI, remains logged in, Zerodha connection is established
- Actual: User is redirected back but is logged out of FamLedgerAI

#### Root Cause Analysis

Based on code analysis of `index.html` (lines 2621-2635) and `api/[...catchall].js` (lines 1576-1630):

1. **OAuth Redirect Clears Session**: When `connectZerodha()` executes `window.location.href = loginUrl`, it performs a full page navigation to Kite's login page. This navigation may clear the Supabase session from memory (though it should persist in localStorage).

2. **Callback Page Session Restoration**: The callback endpoint redirects to `zerodha-success.html`. This is a separate HTML page that may not have the Supabase client initialized or may not restore the session before redirecting back to the main app.

3. **Session Cookie Domain Mismatch**: If the Supabase session is stored in cookies with a specific domain, the OAuth redirect to an external domain (kite.zerodha.com) and back may cause the cookie to be lost.

4. **Missing Session Restoration in Callback**: The `handleZerodhaCallback` function stores the Zerodha access token but doesn't verify or restore the user's FamLedgerAI session before redirecting.


### Bug 5: Loan File Upload Parse Error

#### Fault Condition

The bug manifests when a user uploads a loan document file in the loans section. The system returns error "❌ Failed to parse: Failed to execute 'json' on 'Response': Unexpected end of JSON input. Try adding manually."

**Formal Specification:**
```
FUNCTION isBugCondition_LoanParse(input)
  INPUT: input of type { loanFile: File, uploadRequest: boolean }
  OUTPUT: boolean
  
  RETURN input.loanFile IS_VALID_PDF
         AND input.uploadRequest === true
         AND loanParseReturnsJSONError()
END FUNCTION
```

#### Examples

- User navigates to Loans section
- User clicks "Upload Loan Document" and selects a PDF file
- Expected: System extracts loan details and populates fields
- Actual: Error "❌ Failed to parse: Failed to execute 'json' on 'Response': Unexpected end of JSON input"

#### Root Cause Analysis

Based on code analysis of `index.html` (lines 12547-12720) and `api/[...catchall].js` (lines 828-950):

1. **API Response Not JSON**: The error "Failed to execute 'json' on 'Response'" indicates that the API endpoint is not returning valid JSON. This could happen if:
   - The endpoint returns an HTML error page (e.g., 404, 500)
   - The endpoint returns plain text instead of JSON
   - The response is empty

2. **API Routing Issue**: The frontend calls `/api/loan/parse-statement`, but the catchall router may not be correctly routing this to `handleLoanParseStatement`. The routing logic needs to match the path exactly.

3. **AI Response Format**: The `handleLoanParseStatement` function expects the AI to return pure JSON, but the AI may be returning markdown-wrapped JSON (e.g., ` ```json\n{...}\n``` `). The code has logic to strip markdown, but if this fails, JSON.parse will throw an error.

4. **Empty Response**: If the AI service (Anthropic) is not configured or returns an error, the `callAIWithFallback` function may return an empty or invalid response, causing JSON parsing to fail.


### Bug 6: Health Insurance PDF Upload Error

#### Fault Condition

The bug manifests when a user uploads a health insurance PDF document. The system returns error "❌ Failed to parse PDF: API error 405".

**Formal Specification:**
```
FUNCTION isBugCondition_InsuranceParse(input)
  INPUT: input of type { insurancePDF: File, uploadRequest: boolean }
  OUTPUT: boolean
  
  RETURN input.insurancePDF IS_VALID_PDF
         AND input.uploadRequest === true
         AND apiReturns405Error()
END FUNCTION
```

#### Examples

- User navigates to Insurance section
- User clicks "Upload Health Insurance PDF" and selects a PDF file
- Expected: System extracts policy details and populates fields
- Actual: Error "❌ Failed to parse PDF: API error 405"

#### Root Cause Analysis

Based on code analysis of `index.html` (lines 13750-13950) and `api/[...catchall].js` (lines 1483-1575):

1. **HTTP 405 Method Not Allowed**: The error code 405 indicates that the API endpoint is being called with the wrong HTTP method. The `handleInsuranceParsePdf` function checks `if (req.method !== 'POST')` and returns 405 if the method is not POST.

2. **API Routing Issue**: The frontend calls `/api/insurance/parse-pdf`, but the catchall router may not be correctly routing this to `handleInsuranceParsePdf`. The routing logic needs to match the path exactly and preserve the HTTP method.

3. **CORS Preflight Request**: Browsers send an OPTIONS request before POST requests for CORS. If the API doesn't handle OPTIONS requests correctly, the browser will receive a 405 error on the preflight request and block the actual POST request.

4. **Vercel Serverless Function Configuration**: The API is deployed as a Vercel serverless function. If the `vercel.json` configuration doesn't correctly route `/api/insurance/parse-pdf` to the catchall handler, or if it doesn't allow POST methods, the request will fail with 405.


## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

**Session Management (General)**
- Standard navigation between pages without refresh must continue to maintain authenticated session
- Login with valid credentials must continue to establish authenticated session successfully
- Inactivity timeout (15 minutes) must continue to log out users for security

**Dashboard Functionality**
- Primary user's own dashboard must continue to display individual financial data correctly
- Users without a spouse must continue to see only the primary user's dashboard
- "All (Master)" view must continue to show combined family financial data

**Data Entry and Management**
- Manual entry of loan data without file upload must continue to save and display correctly
- Manual entry of health insurance data without PDF upload must continue to save and display correctly
- Manual entry of income data through standard form must continue to save correctly
- All existing data editing, deletion, and update operations must continue to work

**Third-Party Integrations**
- Users with already connected Zerodha accounts must continue to view portfolio information correctly
- Zerodha holdings sync must continue to work for already-connected accounts
- Other integrations (Plaid, Setu AA) must continue to function normally

**Communication Features**
- Adding other contact information (email, etc.) must continue to save and validate correctly
- All non-WhatsApp communication features must continue to work

**Document Parsing**
- PDF text extraction using pdf.js must continue to work for all document types
- Fallback to manual entry when parsing fails must continue to be available

**Scope:**
All inputs and user actions that do NOT involve the six specific bug conditions should be completely unaffected by these fixes. This includes all other pages, features, and workflows in the application.


## Hypothesized Root Cause

### Bug 1: Spouse Dashboard Not Showing

**Most Likely Causes:**

1. **Timing Issue in Profile Selector Population**: The `populateProfileSelector()` function is called in `showApp()`, but if the spouse is added after the app is already shown, the function is not called again to refresh the dropdown.

2. **Missing Data Structure Initialization**: When a spouse is added, the corresponding data structures (`userData.expenses.byMember[spouseId]`, `userData.investments.byMember[spouseId]`, etc.) may not be initialized, causing the dashboard to appear empty.

3. **Incorrect Member ID Mapping**: The spouse's `id` in `familyMembers` array may not match the keys used in `byMember` objects, causing data lookup failures.

### Bug 2: WhatsApp Message Sending Failed

**Most Likely Causes:**

1. **Missing or Invalid Twilio Credentials**: The `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` environment variables are not set or are invalid in the production environment.

2. **Twilio Sandbox Not Joined**: The user's phone number has not joined the Twilio WhatsApp sandbox, which is required for testing.

3. **Phone Number Format Issue**: The phone number is not in the correct E.164 format required by Twilio.

### Bug 3: Page Refresh Logs Out User

**Most Likely Causes:**

1. **Supabase Session Not Persisting**: The Supabase client is not configured to persist sessions in localStorage, or the localStorage is being cleared on page refresh.

2. **Session Retrieval Failure**: The `sb.auth.getSession()` call is failing to retrieve the stored session, possibly due to a configuration issue or a bug in the Supabase client.

3. **Session Expiry Without Refresh**: The session has expired and the refresh token is not being used to obtain a new session automatically.


### Bug 4: Zerodha Connection Logs Out User

**Most Likely Causes:**

1. **OAuth Redirect Doesn't Preserve Session**: The full page navigation to Kite login and back doesn't properly preserve the Supabase session, even though it's stored in localStorage.

2. **Callback Page Doesn't Initialize Supabase**: The `zerodha-success.html` page may not have the Supabase client initialized, or it redirects back to the main app before the session is restored.

3. **Session Lost During External Redirect**: The external redirect to kite.zerodha.com may cause the browser to clear session-related data due to security policies.

### Bug 5: Loan File Upload Parse Error

**Most Likely Causes:**

1. **API Endpoint Not Found (404)**: The `/api/loan/parse-statement` endpoint is not correctly routed in the catchall handler, returning a 404 HTML page instead of JSON.

2. **AI Service Not Configured**: The Anthropic API key is missing or invalid, causing the AI service to fail and return an empty response.

3. **Response Format Mismatch**: The API is returning a response that cannot be parsed as JSON, possibly due to an error page or plain text error message.

### Bug 6: Health Insurance PDF Upload Error

**Most Likely Causes:**

1. **API Routing Configuration Error**: The `/api/insurance/parse-pdf` endpoint is not correctly configured in `vercel.json` or the catchall router, causing requests to be rejected with 405.

2. **CORS Preflight Failure**: The API doesn't handle OPTIONS requests for CORS preflight, causing the browser to block the POST request.

3. **HTTP Method Mismatch**: The frontend is sending a GET request instead of POST, or the routing is changing the method during the request.

4. **Vercel Serverless Function Limits**: The function may be hitting Vercel's execution time or payload size limits, causing it to fail with a generic 405 error.


## Correctness Properties

Property 1: Fault Condition - Spouse Dashboard Visibility

_For any_ user action where a spouse is added to the family profile (isBugCondition_SpouseDashboard returns true), the fixed system SHALL display the spouse as an option in the profile selector dropdown and SHALL render the spouse's individual dashboard with correct data when selected.

**Validates: Requirements 2.1**

Property 2: Fault Condition - WhatsApp Message Sending

_For any_ user action where a valid phone number is provided and a test WhatsApp message is requested (isBugCondition_WhatsApp returns true), the fixed system SHALL successfully send the WhatsApp message via Twilio and display a success confirmation to the user.

**Validates: Requirements 2.2**

Property 3: Fault Condition - Page Refresh Session Persistence

_For any_ user action followed by a page refresh (isBugCondition_PageRefresh returns true), the fixed system SHALL maintain the user's authenticated session without requiring re-authentication, preserving all user data and application state.

**Validates: Requirements 2.3**

Property 4: Fault Condition - Zerodha OAuth Session Persistence

_For any_ user action where Zerodha connection is initiated via OAuth redirect (isBugCondition_ZerodhaOAuth returns true), the fixed system SHALL complete the OAuth flow and return the user to the application while maintaining their authenticated session.

**Validates: Requirements 2.4**

Property 5: Fault Condition - Loan Document Parsing

_For any_ user action where a loan document PDF is uploaded (isBugCondition_LoanParse returns true), the fixed system SHALL successfully parse the document, extract loan data, and populate the loan fields without JSON parsing errors.

**Validates: Requirements 2.5**

Property 6: Fault Condition - Insurance PDF Parsing

_For any_ user action where a health insurance PDF is uploaded (isBugCondition_InsuranceParse returns true), the fixed system SHALL successfully parse the PDF, extract insurance details, and populate the insurance fields without HTTP 405 errors.

**Validates: Requirements 2.6**

Property 7: Preservation - General Session Management

_For any_ user action that does NOT involve page refresh or OAuth redirects (NOT isBugCondition_PageRefresh AND NOT isBugCondition_ZerodhaOAuth), the fixed system SHALL produce exactly the same session management behavior as the original system, preserving standard navigation and login functionality.

**Validates: Requirements 3.1, 3.2**

Property 8: Preservation - Dashboard and Data Entry

_For any_ user action involving dashboard viewing, manual data entry, or data management that does NOT involve spouse dashboard rendering (NOT isBugCondition_SpouseDashboard), the fixed system SHALL produce exactly the same behavior as the original system, preserving all existing dashboard and data entry functionality.

**Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.7**

Property 9: Preservation - Third-Party Integrations and Communication

_For any_ user action involving third-party integrations or communication features that does NOT involve WhatsApp sending or Zerodha connection (NOT isBugCondition_WhatsApp AND NOT isBugCondition_ZerodhaOAuth), the fixed system SHALL produce exactly the same behavior as the original system, preserving all existing integration and communication functionality.

**Validates: Requirements 3.8, 3.9**


## Fix Implementation

### Bug 1: Spouse Dashboard Not Showing

**File**: `famledgerai/index.html`

**Functions**: `populateProfileSelector()` (line ~9512), spouse addition handlers in Settings

**Specific Changes**:

1. **Add Refresh Call After Spouse Addition**: In the spouse addition handler (Settings page), add a call to `populateProfileSelector()` immediately after saving the spouse data to ensure the dropdown is updated.

2. **Initialize Data Structures for New Members**: When a new family member (spouse, kid, etc.) is added, initialize empty data structures in `userData.expenses.byMember[memberId]`, `userData.investments.byMember[memberId]`, `userData.loans.byMember[memberId]`, and `userData.insurance.byMember[memberId]`.

3. **Ensure Consistent Member ID Usage**: Verify that the `id` field in `familyMembers` array matches the keys used in all `byMember` objects. Use a consistent ID generation strategy (e.g., 'spouse', 'kid-1', 'kid-2').

4. **Add Defensive Checks in Dashboard Rendering**: In functions like `renderOverview()`, `renderExpenses()`, etc., add checks to ensure `byMember[currentProfile]` exists before accessing it. If it doesn't exist, initialize it as an empty array/object.

**Example Code Change**:
```javascript
// In spouse addition handler (Settings page)
window.saveSpouseProfile = () => {
    const spouseName = document.getElementById('spouse-name')?.value;
    if (!spouseName) { showToast('Please enter spouse name', 'red'); return; }
    
    if (!userData.profile.familyMembers) userData.profile.familyMembers = [];
    const existingSpouse = userData.profile.familyMembers.find(m => m.role === 'spouse');
    
    if (existingSpouse) {
        existingSpouse.name = spouseName;
    } else {
        userData.profile.familyMembers.push({ id: 'spouse', name: spouseName, role: 'spouse' });
    }
    
    // Initialize data structures for spouse
    if (!userData.expenses.byMember) userData.expenses.byMember = {};
    if (!userData.expenses.byMember['spouse']) userData.expenses.byMember['spouse'] = [];
    if (!userData.investments.byMember) userData.investments.byMember = {};
    if (!userData.investments.byMember['spouse']) userData.investments.byMember['spouse'] = { mutualFunds: [], stocks: [], fd: [], ppf: [] };
    if (!userData.loans.byMember) userData.loans.byMember = {};
    if (!userData.loans.byMember['spouse']) userData.loans.byMember['spouse'] = [];
    if (!userData.insurance.byMember) userData.insurance.byMember = {};
    if (!userData.insurance.byMember['spouse']) userData.insurance.byMember['spouse'] = { term: [], health: [], vehicle: [] };
    
    debounceSave();
    populateProfileSelector(); // Refresh dropdown
    showToast('Spouse profile saved!');
    renderCurrentPage();
};
```


### Bug 2: WhatsApp Message Sending Failed

**File**: `famledgerai/api/[...catchall].js`

**Function**: `handleWhatsAppSend` (line 2479)

**Specific Changes**:

1. **Verify Environment Variables**: Add explicit checks for `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` at the start of the handler. Return a clear error message if they are missing.

2. **Add Phone Number Validation**: Before calling `sendWhatsAppMessage`, validate that the phone number is in E.164 format. If not, attempt to format it or return a clear error.

3. **Improve Error Messages**: Catch specific Twilio error codes (21408 for sandbox not joined, 21211 for invalid number) and return user-friendly error messages.

4. **Add Logging**: Add console.log statements to track the request flow and identify where failures occur.

**Example Code Change**:
```javascript
async function handleWhatsAppSend(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, message } = req.body;
  
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required fields: to, message' });
  }

  // Verify Twilio credentials
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.error('WhatsApp send failed: Missing Twilio credentials');
    return res.status(500).json({
      success: false,
      error: 'WhatsApp service not configured. Please contact support.'
    });
  }

  // Validate phone number format
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(to)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number format. Please use E.164 format (e.g., +919876543210)'
    });
  }

  try {
    console.log('Sending WhatsApp message to:', to);
    const result = await sendWhatsAppMessage(to, message);
    console.log('WhatsApp message sent successfully:', result.sid);
    return res.status(200).json({
      success: true,
      messageSid: result.sid,
      status: result.status,
      to: result.to
    });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    
    // Handle specific Twilio errors
    if (error.message.includes('21408')) {
      return res.status(400).json({
        success: false,
        error: 'Please join the WhatsApp sandbox first. Send "join happy-tiger" to +14155238886'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    });
  }
}
```


### Bug 3: Page Refresh Logs Out User

**File**: `famledgerai/index.html`

**Functions**: `checkSession()` (line 9430), Supabase client initialization

**Specific Changes**:

1. **Verify Supabase Client Configuration**: Ensure the Supabase client is initialized with `persistSession: true` (default) and `autoRefreshToken: true` (default).

2. **Add Session Refresh Logic**: In `checkSession()`, if the session is expired but a refresh token exists, attempt to refresh the session before logging out.

3. **Add Detailed Logging**: Add console.log statements to track session retrieval and identify why sessions are not persisting.

4. **Check localStorage Availability**: Verify that localStorage is available and not being blocked by browser settings or privacy modes.

**Example Code Change**:
```javascript
async function checkSession() {
    const ls = document.getElementById('loading-screen');
    isLoadingSession = true;
    try {
        console.log('Checking session with Supabase URL:', SUPABASE_URL);
        console.log('localStorage available:', typeof(Storage) !== 'undefined');
        
        // Get current session
        const { data: { session }, error } = await sb.auth.getSession();
        
        if (error) {
            console.error('getSession error:', error);
            showAuth();
            return;
        }
        
        console.log('Session result:', session ? 'active' : 'none');
        console.log('Session details:', session ? {
            expiresAt: new Date(session.expires_at * 1000).toISOString(),
            expiresIn: session.expires_in,
            hasRefreshToken: !!session.refresh_token
        } : 'no session');
        
        if (session) {
            currentUserEmail = session.user.email;
            await loadHouseholdContext();
            await loadUserData(currentUserEmail);
            
            // ... rest of the logic
            
            const profileComplete = userData.profile?._wizardCompleted || (userData.profile?.age && userData.profile?.occupation);
            if (!profileComplete) {
                showProfileWizard();
            } else {
                showApp();
                resetInactivity();
            }
        } else {
            console.log('No session found, checking for refresh token...');
            // Attempt to refresh session if refresh token exists
            const { data: refreshData, error: refreshError } = await sb.auth.refreshSession();
            if (refreshData?.session) {
                console.log('Session refreshed successfully');
                currentUserEmail = refreshData.session.user.email;
                await loadHouseholdContext();
                await loadUserData(currentUserEmail);
                showApp();
                resetInactivity();
            } else {
                console.log('No refresh token available or refresh failed:', refreshError);
                showAuth();
            }
        }
    } catch (e) {
        console.error('checkSession error:', e);
        showAuth();
    } finally {
        isLoadingSession = false;
        if (ls) ls.style.display = 'none';
    }
}
```


### Bug 4: Zerodha Connection Logs Out User

**File**: `famledgerai/public/zerodha-success.html`

**Function**: Callback page initialization

**Specific Changes**:

1. **Initialize Supabase Client in Callback Page**: The `zerodha-success.html` page needs to initialize the Supabase client and verify the session before redirecting back to the main app.

2. **Add Session Verification**: Before redirecting, check that the user's session is still active. If not, attempt to restore it from localStorage.

3. **Use Client-Side Redirect with Session Preservation**: Instead of a server-side redirect from the API callback, return the user to `zerodha-success.html` which then performs a client-side redirect after verifying the session.

4. **Add Loading State**: Show a loading message while the session is being verified and the redirect is being prepared.

**Example Code Change**:

Create/update `famledgerai/public/zerodha-success.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zerodha Connection Success</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Zerodha Connected Successfully!</h1>
        <div class="spinner"></div>
        <p id="status">Verifying your session...</p>
    </div>

    <script>
        const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with actual URL
        const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace with actual key
        
        const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        async function verifyAndRedirect() {
            const statusEl = document.getElementById('status');
            
            try {
                // Check if session exists
                const { data: { session }, error } = await sb.auth.getSession();
                
                if (error) {
                    console.error('Session check error:', error);
                    statusEl.textContent = 'Session verification failed. Redirecting...';
                    setTimeout(() => window.location.href = '/', 2000);
                    return;
                }
                
                if (session) {
                    console.log('Session verified:', session.user.email);
                    statusEl.textContent = 'Session verified! Redirecting to dashboard...';
                    setTimeout(() => window.location.href = '/', 1000);
                } else {
                    console.log('No session found, attempting refresh...');
                    const { data: refreshData, error: refreshError } = await sb.auth.refreshSession();
                    
                    if (refreshData?.session) {
                        console.log('Session refreshed successfully');
                        statusEl.textContent = 'Session restored! Redirecting to dashboard...';
                        setTimeout(() => window.location.href = '/', 1000);
                    } else {
                        console.error('Session refresh failed:', refreshError);
                        statusEl.textContent = 'Session expired. Please log in again.';
                        setTimeout(() => window.location.href = '/', 2000);
                    }
                }
            } catch (e) {
                console.error('Verification error:', e);
                statusEl.textContent = 'Error occurred. Redirecting...';
                setTimeout(() => window.location.href = '/', 2000);
            }
        }
        
        // Start verification after a short delay
        setTimeout(verifyAndRedirect, 500);
    </script>
</body>
</html>
```


### Bug 5: Loan File Upload Parse Error

**File**: `famledgerai/api/[...catchall].js`

**Function**: Main handler routing logic (line ~22), `handleLoanParseStatement` (line 828)

**Specific Changes**:

1. **Fix API Routing**: Ensure the catchall handler correctly routes `/api/loan/parse-statement` to `handleLoanParseStatement`. Add explicit path matching logic.

2. **Add Error Response Handling**: Wrap the entire handler in try-catch and ensure all error responses return valid JSON.

3. **Improve AI Response Parsing**: Enhance the markdown stripping logic to handle various AI response formats.

4. **Add Fallback Response**: If AI parsing fails completely, return a structured error JSON instead of throwing an exception.

**Example Code Change**:
```javascript
// In main handler function (line ~22)
async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-Member-Id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url.split('?')[0];
  console.log('API Request:', req.method, path);

  try {
    // Loan parsing endpoint
    if (path === '/api/loan/parse-statement') {
      return await handleLoanParseStatement(req, res);
    }
    
    // ... other routes
    
    // Default 404
    return res.status(404).json({ error: 'Endpoint not found', path });
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      detail: error.message 
    });
  }
}

// Update handleLoanParseStatement
async function handleLoanParseStatement(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { pdfText } = req.body;
  if (!pdfText || pdfText.length < 20) {
    return res.status(400).json({ error: 'No PDF text provided' });
  }

  const prompt = `You are an Indian loan/bank statement parser...`; // (existing prompt)

  try {
    let result = await callAIWithFallback(prompt, 'loan_parse');
    
    // Handle string response (markdown-wrapped JSON)
    if (typeof result === 'string') {
      console.log('AI returned string, attempting to parse:', result.substring(0, 200));
      
      // Remove markdown code blocks
      result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Remove any leading/trailing text before/after JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = jsonMatch[0];
      }
      
      try {
        result = JSON.parse(result);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', result);
        return res.status(500).json({ 
          error: 'AI returned invalid JSON', 
          detail: 'The AI response could not be parsed. Please try again or add the loan manually.',
          suggestion: 'Use the "Add Manually" button to enter loan details'
        });
      }
    }
    
    // Validate result is an object
    if (!result || typeof result !== 'object') {
      return res.status(500).json({
        error: 'Invalid AI response format',
        detail: 'The AI did not return a valid loan data object',
        suggestion: 'Please try again or add the loan manually'
      });
    }
    
    // Ensure all required fields exist with defaults
    const loanData = {
      label: result.label || 'Loan',
      lender: result.lender || '',
      loanType: result.loanType || 'other',
      principal: Number(result.principal) || 0,
      outstanding: Number(result.outstanding) || 0,
      emi: Number(result.emi) || 0,
      rate: Number(result.rate) || 0,
      tenureMonths: Number(result.tenureMonths) || 0,
      paidMonths: Number(result.paidMonths) || 0,
      remainingMonths: Number(result.remainingMonths) || 0,
      totalInterestPaid: Number(result.totalInterestPaid) || 0,
      totalPrincipalPaid: Number(result.totalPrincipalPaid) || 0,
      disbursementDate: result.disbursementDate || '',
      maturityDate: result.maturityDate || '',
      nextEmiDate: result.nextEmiDate || '',
      interestType: result.interestType || '',
      processingFee: Number(result.processingFee) || 0,
      prepaymentCharges: result.prepaymentCharges || '',
      collateral: result.collateral || '',
      coApplicant: result.coApplicant || '',
      accountNumber: result.accountNumber || '',
      additionalDetails: result.additionalDetails || ''
    };
    
    console.log('Loan parse successful:', JSON.stringify(loanData, null, 2));
    return res.status(200).json(loanData);
  } catch (e) {
    console.error('Loan parse error:', e);
    return res.status(500).json({ 
      error: 'Failed to parse loan statement', 
      detail: e.message,
      suggestion: 'Please try adding the loan manually using the "Add Manually" button'
    });
  }
}
```


### Bug 6: Health Insurance PDF Upload Error

**File**: `famledgerai/api/[...catchall].js`, `famledgerai/vercel.json`

**Function**: Main handler routing logic, `handleInsuranceParsePdf` (line 1483)

**Specific Changes**:

1. **Fix API Routing**: Ensure the catchall handler correctly routes `/api/insurance/parse-pdf` to `handleInsuranceParsePdf`. Add explicit path matching logic.

2. **Add CORS Headers**: Ensure CORS headers are set for all responses, including OPTIONS preflight requests.

3. **Verify Vercel Configuration**: Check `vercel.json` to ensure the route is correctly configured and allows POST methods.

4. **Add Request Logging**: Log incoming requests to identify if they're reaching the handler with the correct method.

**Example Code Change**:

Update `famledgerai/api/[...catchall].js`:
```javascript
// In main handler function (line ~22)
async function handler(req, res) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-Member-Id');
  
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url.split('?')[0];
  console.log('API Request:', req.method, path);

  try {
    // Insurance PDF parsing endpoint
    if (path === '/api/insurance/parse-pdf') {
      return await handleInsuranceParsePdf(req, res);
    }
    
    // Loan parsing endpoint
    if (path === '/api/loan/parse-statement') {
      return await handleLoanParseStatement(req, res);
    }
    
    // WhatsApp endpoints
    if (path === '/api/whatsapp/send') {
      return await handleWhatsAppSend(req, res);
    }
    if (path === '/api/whatsapp/test') {
      return await handleWhatsAppTest(req, res);
    }
    
    // ... other routes
    
    // Default 404
    return res.status(404).json({ error: 'Endpoint not found', path });
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      detail: error.message 
    });
  }
}
```

Update `famledgerai/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    },
    {
      "src": "api/[...catchall].js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/[...catchall].js",
      "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "functions": {
    "api/[...catchall].js": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```


## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fixes work correctly and preserve existing behavior. Each bug will be tested independently with its own exploratory, fix checking, and preservation checking phases.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fixes. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate the bug conditions and assert the expected failures. Run these tests on the UNFIXED code to observe failures and understand the root causes.

**Test Cases**:

1. **Bug 1 - Spouse Dashboard Test**: 
   - Add a spouse "Test Spouse" via Settings
   - Check if spouse appears in profile selector dropdown
   - Select spouse from dropdown
   - Assert that spouse's dashboard renders with initialized data structures
   - (Will fail on unfixed code: spouse may not appear or dashboard may be empty)

2. **Bug 2 - WhatsApp Send Test**:
   - Configure valid Twilio credentials in environment
   - Call `/api/whatsapp/send` with valid phone number and message
   - Assert response is 200 with success: true
   - (Will fail on unfixed code: may return 500 error or missing credentials error)

3. **Bug 3 - Page Refresh Session Test**:
   - Log in as a user
   - Add income data
   - Simulate page refresh by calling `checkSession()`
   - Assert user remains logged in and data is preserved
   - (Will fail on unfixed code: user will be logged out)

4. **Bug 4 - Zerodha OAuth Session Test**:
   - Log in as a user
   - Initiate Zerodha connection (mock OAuth flow)
   - Simulate callback redirect to zerodha-success.html
   - Assert user session is maintained after redirect
   - (Will fail on unfixed code: user will be logged out)

5. **Bug 5 - Loan Parse Test**:
   - Upload a sample loan PDF with valid text
   - Call `/api/loan/parse-statement` with extracted text
   - Assert response is 200 with valid JSON loan data
   - (Will fail on unfixed code: may return HTML error page or JSON parse error)

6. **Bug 6 - Insurance Parse Test**:
   - Upload a sample insurance PDF with valid text
   - Call `/api/insurance/parse-pdf` with extracted text
   - Assert response is 200 (not 405) with valid JSON policy data
   - (Will fail on unfixed code: will return 405 Method Not Allowed)

**Expected Counterexamples**:
- Bug 1: Spouse not in dropdown or empty dashboard
- Bug 2: WhatsApp send returns error
- Bug 3: Session lost on page refresh
- Bug 4: Session lost after OAuth redirect
- Bug 5: Loan parse returns non-JSON response
- Bug 6: Insurance parse returns 405 error


### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR EACH bug IN [Bug1, Bug2, Bug3, Bug4, Bug5, Bug6] DO
  FOR ALL input WHERE isBugCondition_bug(input) DO
    result := fixedFunction_bug(input)
    ASSERT expectedBehavior_bug(result)
  END FOR
END FOR
```

**Test Cases**:

1. **Bug 1 Fix Verification**:
   - Add spouse via Settings
   - Verify spouse appears in dropdown immediately
   - Select spouse and verify dashboard renders with correct data
   - Add expense for spouse and verify it appears in spouse's dashboard
   - Switch to "All" view and verify spouse's data is included in combined view

2. **Bug 2 Fix Verification**:
   - Configure Twilio credentials
   - Send test WhatsApp message with valid phone number
   - Verify success response with message SID
   - Test with invalid phone format and verify clear error message
   - Test with missing credentials and verify clear error message

3. **Bug 3 Fix Verification**:
   - Log in and add data
   - Refresh page multiple times
   - Verify session persists across all refreshes
   - Verify data is preserved
   - Test with expired session and verify refresh token is used

4. **Bug 4 Fix Verification**:
   - Log in and initiate Zerodha connection
   - Complete OAuth flow
   - Verify session is maintained after callback
   - Verify Zerodha connection is established
   - Verify user can access dashboard without re-login

5. **Bug 5 Fix Verification**:
   - Upload various loan PDFs (ICICI, SBI, HDFC formats)
   - Verify all return valid JSON with loan data
   - Verify extracted data is accurate
   - Test with malformed PDF and verify graceful error handling

6. **Bug 6 Fix Verification**:
   - Upload various insurance PDFs (health, term, vehicle)
   - Verify all return 200 status (not 405)
   - Verify extracted policy data is accurate
   - Test with different PDF formats and verify parsing works


### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR EACH bug IN [Bug1, Bug2, Bug3, Bug4, Bug5, Bug6] DO
  FOR ALL input WHERE NOT isBugCondition_bug(input) DO
    ASSERT originalFunction_bug(input) = fixedFunction_bug(input)
  END FOR
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-bug scenarios, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Bug 1 Preservation - Dashboard Without Spouse**:
   - Observe that users without spouse see only their own dashboard (unfixed code)
   - Verify primary user dashboard continues to work correctly after fix
   - Verify "All" view works correctly for single-user households
   - Verify kid profiles (if any) continue to work correctly

2. **Bug 2 Preservation - Non-WhatsApp Communication**:
   - Observe that email and other contact info saving works (unfixed code)
   - Verify email validation continues to work after fix
   - Verify profile saving without WhatsApp continues to work
   - Verify other communication features are unaffected

3. **Bug 3 Preservation - Standard Navigation**:
   - Observe that navigation between pages without refresh works (unfixed code)
   - Verify page transitions continue to work smoothly after fix
   - Verify login flow continues to work correctly
   - Verify logout functionality continues to work

4. **Bug 4 Preservation - Non-OAuth Integrations**:
   - Observe that Plaid and Setu AA integrations work (unfixed code)
   - Verify these integrations continue to work after Zerodha fix
   - Verify manual investment entry continues to work
   - Verify viewing existing Zerodha connections continues to work

5. **Bug 5 Preservation - Manual Loan Entry**:
   - Observe that manual loan entry works correctly (unfixed code)
   - Verify manual entry continues to work after parsing fix
   - Verify loan editing and deletion continue to work
   - Verify loan calculations continue to work correctly

6. **Bug 6 Preservation - Manual Insurance Entry**:
   - Observe that manual insurance entry works correctly (unfixed code)
   - Verify manual entry continues to work after parsing fix
   - Verify insurance editing and deletion continue to work
   - Verify insurance calculations continue to work correctly


### Unit Tests

**Bug 1 - Spouse Dashboard**:
- Test `populateProfileSelector()` with various family member configurations
- Test data structure initialization for new members
- Test dashboard rendering with empty vs populated member data
- Test member ID consistency across all data structures

**Bug 2 - WhatsApp Sending**:
- Test `handleWhatsAppSend` with valid credentials and phone number
- Test with missing credentials (should return clear error)
- Test with invalid phone format (should return validation error)
- Test with Twilio sandbox errors (should return user-friendly message)

**Bug 3 - Page Refresh Session**:
- Test `checkSession()` with active session
- Test with expired session and valid refresh token
- Test with no session and no refresh token
- Test localStorage availability check

**Bug 4 - Zerodha OAuth**:
- Test `zerodha-success.html` session verification logic
- Test session restoration from localStorage
- Test redirect timing and flow
- Test with expired session during OAuth flow

**Bug 5 - Loan Parsing**:
- Test `handleLoanParseStatement` with valid PDF text
- Test with markdown-wrapped JSON response
- Test with malformed JSON response
- Test with empty or invalid PDF text

**Bug 6 - Insurance Parsing**:
- Test `handleInsuranceParsePdf` with valid PDF text
- Test CORS headers on OPTIONS request
- Test routing to correct handler
- Test with various insurance document formats

### Property-Based Tests

**Bug 1 - Dashboard Rendering**:
- Generate random family configurations (0-5 members with various roles)
- Verify dropdown always contains correct number of options
- Verify each member's dashboard can be rendered without errors
- Verify data isolation between members

**Bug 2 - WhatsApp Phone Validation**:
- Generate random phone numbers in various formats
- Verify E.164 validation works correctly for all valid formats
- Verify invalid formats are rejected with clear errors

**Bug 3 - Session Persistence**:
- Generate random user actions followed by page refresh
- Verify session persists across all scenarios
- Verify data is preserved across all scenarios

**Bug 4 - OAuth Flow**:
- Generate random OAuth callback scenarios
- Verify session is maintained in all cases
- Verify error handling for failed OAuth attempts

**Bug 5 - Loan Document Parsing**:
- Generate various loan document text formats
- Verify parser handles all formats gracefully
- Verify extracted data is within valid ranges

**Bug 6 - Insurance Document Parsing**:
- Generate various insurance document text formats
- Verify parser handles all formats gracefully
- Verify extracted policy data is within valid ranges

### Integration Tests

**Bug 1 - Full Spouse Workflow**:
- Complete flow: Add spouse → Select spouse → Add expense → View dashboard → Switch to All view
- Verify all steps work correctly and data flows properly

**Bug 2 - Full WhatsApp Workflow**:
- Complete flow: Add phone → Send test message → Verify delivery
- Test with real Twilio sandbox account

**Bug 3 - Full Session Workflow**:
- Complete flow: Login → Add data → Refresh → Verify data → Logout → Login again
- Test across multiple browser tabs

**Bug 4 - Full Zerodha Workflow**:
- Complete flow: Login → Navigate to Investments → Connect Zerodha → Complete OAuth → View holdings
- Test with real Zerodha sandbox account

**Bug 5 - Full Loan Upload Workflow**:
- Complete flow: Navigate to Loans → Upload PDF → Verify extraction → Edit data → Save
- Test with real loan documents from multiple banks

**Bug 6 - Full Insurance Upload Workflow**:
- Complete flow: Navigate to Insurance → Upload PDF → Verify extraction → Edit data → Save
- Test with real insurance documents from multiple providers

