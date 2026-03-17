# Requirements Document

## Introduction

Security and performance hardening layer for the FamLedgerAI financial dashboard. This feature addresses critical gaps: unprotected API routes, missing Row-Level Security enforcement, absent input validation on API boundaries, incomplete rate limiting on AI-powered routes, no streaming for AI chat, sequential database queries on the overview page, uncached XIRR calculations, and missing skeleton/progressive loading states. The goal is to bring the app from "works in dev" to "production-grade" across both security and perceived performance.

## Glossary

- **Auth_Guard**: Server-side middleware or route-level check that verifies a valid Supabase session exists before processing a request
- **API_Route**: A Next.js route handler located under `src/app/api/`
- **Rate_Limiter**: The Upstash Redis-backed sliding window rate limiter at `src/lib/security/rateLimit.ts`
- **AI_Route**: Any API_Route that calls the Anthropic Claude API (ai/chat, copilot/run-agent, analyze-insurance-policy, ai-alerts/generate, question-router/ask, ped-advisor, categorize, briefing, insurance-education, budget/suggest, anomaly/detect)
- **Overview_Page**: The dashboard overview at `src/app/(dashboard)/overview/page.tsx`
- **XIRR_Calculator**: The Newton-Raphson XIRR computation at `src/lib/finance/xirr.ts`
- **Skeleton_Loader**: A placeholder UI component shown immediately while data loads asynchronously
- **Security_Headers**: HTTP response headers that mitigate XSS, clickjacking, MIME sniffing, and other browser-based attacks
- **Input_Validator**: Zod schema validation applied at the API boundary before any database or AI call
- **Middleware**: The Next.js middleware at `src/middleware.ts` that intercepts requests before they reach route handlers
- **Streaming_Response**: An HTTP response using Server-Sent Events or ReadableStream to deliver AI tokens incrementally
- **Batch_Query**: A single `Promise.all` call that executes multiple Supabase queries in parallel
- **Progressive_Loader**: A UI pattern that shows partial results immediately and fills in remaining data as it arrives

## Requirements

### Requirement 1: API Route Authentication Guard

**User Story:** As a user, I want all API routes to require authentication, so that unauthenticated callers cannot access my financial data or trigger AI operations.

#### Acceptance Criteria

1. WHEN an unauthenticated request is sent to any API_Route under `/api/` (excluding `/api/auth/` and `/api/payments/webhook/`), THE Auth_Guard SHALL return HTTP 401 with a JSON error body `{ "error": "Unauthorized" }`
2. WHEN an authenticated request with a valid Supabase session is sent to any API_Route, THE Auth_Guard SHALL allow the request to proceed to the route handler
3. IF the Supabase session token is expired or malformed, THEN THE Auth_Guard SHALL return HTTP 401 and not execute any downstream logic
4. THE Auth_Guard SHALL extract the authenticated user ID and make it available to the route handler without each route re-implementing auth logic

### Requirement 2: Middleware Route Protection

**User Story:** As a developer, I want the Next.js middleware to protect all dashboard and API routes, so that there is a single enforcement point for authentication.

#### Acceptance Criteria

1. THE Middleware SHALL redirect unauthenticated requests to `/login` for all paths under `/(dashboard)/`
2. WHEN an unauthenticated request targets any path under `/api/` (excluding `/api/auth/` and `/api/payments/webhook/`), THE Middleware SHALL return HTTP 401 without redirecting
3. THE Middleware SHALL allow unauthenticated access to public routes: `/login`, `/register`, `/pricing`, `/privacy`, `/terms`, `/disclaimer`, `/health-check`, `/clause-checker`
4. THE Middleware SHALL set the `returnTo` query parameter when redirecting to `/login` so the user returns to the originally requested page after authentication

### Requirement 3: Security Headers

**User Story:** As a user, I want the application to set security headers on all responses, so that my browser is protected against XSS, clickjacking, and MIME-sniffing attacks.

#### Acceptance Criteria

1. THE Middleware SHALL set the `X-Content-Type-Options` header to `nosniff` on all responses
2. THE Middleware SHALL set the `X-Frame-Options` header to `DENY` on all responses
3. THE Middleware SHALL set the `Referrer-Policy` header to `strict-origin-when-cross-origin` on all responses
4. THE Middleware SHALL set the `X-XSS-Protection` header to `1; mode=block` on all responses
5. THE Middleware SHALL set the `Permissions-Policy` header to disable camera, microphone, and geolocation on all responses
6. THE Middleware SHALL set the `Strict-Transport-Security` header to `max-age=31536000; includeSubDomains` on all responses
7. NOTE: The `Strict-Transport-Security` header with `max-age=31536000` commits the domain to HTTPS for 1 year. This is intentional for production and SHALL only be applied on the production domain, not on localhost or preview deployments.

### Requirement 4: AI Route Rate Limiting

**User Story:** As a product owner, I want all AI-powered routes to have rate limits, so that abuse and cost attacks against the Claude API are prevented.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL enforce a per-user sliding window limit on each AI_Route
2. WHEN a user exceeds the rate limit for an AI_Route, THE Rate_Limiter SHALL return HTTP 429 with a JSON body containing `{ "error": "Rate limit exceeded", "retryAfter": <seconds> }`
3. THE Rate_Limiter SHALL use the authenticated user ID as the rate limit identifier
4. WHEN the Upstash Redis service is unavailable:
   - The `/api/ai/chat` route SHALL fail-closed (reject requests with HTTP 503) since it is the highest-cost operation
   - All other AI_Routes SHALL fail-open (allow requests to proceed) and log the Redis failure
   - All failures SHALL be logged to the server console with timestamp and route name
5. THE Rate_Limiter SHALL apply a limit of 20 requests per 60-second window for the `/api/ai/chat` route
6. THE Rate_Limiter SHALL apply a limit of 5 requests per 60-second window for the `/api/analyze-insurance-policy` route
7. THE Rate_Limiter SHALL apply a limit of 10 requests per 60-second window for all other AI_Routes

### Requirement 5: IP-Based Rate Limiting

**User Story:** As a product owner, I want IP-based rate limiting on all routes, so that DDoS and brute-force attacks from a single IP are mitigated.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL enforce a per-IP sliding window limit of 100 requests per 60-second window on all API_Routes
2. WHEN an IP address exceeds the limit, THE Rate_Limiter SHALL return HTTP 429 with a `Retry-After` header
3. THE Rate_Limiter SHALL extract the client IP from the `x-forwarded-for` header, falling back to the request connection IP
4. THE Rate_Limiter SHALL apply IP-based limits independently from per-user limits (both must pass)
5. THE Rate_Limiter SHALL exclude these routes from IP-based rate limiting:
   - `/api/kite/callback` (called by Zerodha OAuth server, not the user's browser)
   - `/api/payments/webhook` (called by Razorpay servers, not the user's browser)
   These routes use their own signature/token verification.

### Requirement 6: Input Validation on API Routes

**User Story:** As a developer, I want all API routes to validate incoming request bodies using Zod schemas, so that malformed or malicious input is rejected before reaching the database or AI services.

#### Acceptance Criteria

1. WHEN an API_Route receives a POST request, THE Input_Validator SHALL validate the request body against a Zod schema before any database query or AI call
2. IF the request body fails Zod validation, THEN THE Input_Validator SHALL return HTTP 400 with a JSON body containing the validation error messages
3. THE Input_Validator SHALL sanitize string inputs by trimming whitespace and removing null bytes
4. THE Input_Validator SHALL enforce maximum string lengths: 500 characters for chat messages, 200 characters for names and titles, 5000 characters for description fields
5. THE Input_Validator SHALL reject request bodies larger than 1MB (excluding file upload routes)
6. File upload routes SHALL validate uploaded files:
   - Applicable routes: `/api/import/csv`, `/api/analyze-insurance-policy`, `/api/insurance/analyze`
   - Insurance PDF routes SHALL enforce:
     - File type: `application/pdf` only
     - File size: maximum 10MB
     - Filename: alphanumeric, hyphens, underscores only (reject filenames containing `../` or path separators)
   - CSV import route SHALL enforce:
     - File type: `text/csv` or `application/vnd.ms-excel` only
     - File size: maximum 5MB
   - WHEN file validation fails: return HTTP 400 with `{ "error": "Invalid file", "code": "VALIDATION_ERROR" }`

### Requirement 7: Overview Page Parallel Batch Query

**User Story:** As a user, I want the overview page to load quickly, so that I see my financial dashboard without waiting for sequential database queries.

#### Acceptance Criteria

1. THE Overview_Page SHALL fetch all required data (income, expenses, investments, goals, loans, insurance policies, retirement plan, user profile) using a single Batch_Query with `Promise.all`
2. THE Overview_Page SHALL complete the Batch_Query within 2000ms under normal database load
3. THE Overview_Page SHALL not make duplicate queries for the same data (the health score computation SHALL reuse data from the initial Batch_Query rather than fetching separately)
4. THE Overview_Page SHALL execute the Batch_Query once on mount rather than triggering separate queries in multiple `useEffect` hooks
5. WHEN any individual query within the Batch_Query fails, THE Overview_Page SHALL:
   - Display successfully loaded widgets with real data
   - Show an inline error state only for the failed widget (not a full-page error)
   - Never show a blank overview page if at least 50% of queries succeeded
6. WHEN the entire Batch_Query times out (> 5000ms), THE Overview_Page SHALL show all Skeleton_Loaders with a retry button.

### Requirement 8: AI Chat Streaming Response

**User Story:** As a user, I want to see AI chat responses appear token-by-token, so that I get feedback within 1 second instead of waiting 8-12 seconds for the full response.

#### Acceptance Criteria

1. WHEN a user sends a chat message, THE AI_Route at `/api/ai/chat` SHALL return a Streaming_Response using the Anthropic SDK streaming API
2. THE AI_Route SHALL deliver the first token to the client within 2 seconds of receiving the request
3. THE AI_Route SHALL stream tokens as Server-Sent Events or as a ReadableStream that the client can consume incrementally
4. IF the Anthropic API returns an error during streaming, THEN THE AI_Route SHALL send an error event to the client and close the stream
5. THE AI_Route SHALL save the complete assistant message to the database after the stream finishes
6. THE `/api/ai/chat` route SHALL reject messages exceeding 500 characters before calling the Anthropic API, returning HTTP 400 with code `VALIDATION_ERROR`
7. THE `/api/ai/chat` route SHALL limit conversation history sent to Claude to the last 10 messages to prevent context window abuse and runaway token costs

### Requirement 9: Insurance PDF Progressive Loading

**User Story:** As a user, I want to see basic insurance policy information quickly while the full AI analysis runs in the background, so that I am not staring at a blank screen for 15-30 seconds.

#### Acceptance Criteria

1. WHEN a user uploads an insurance PDF, THE Progressive_Loader SHALL display extracted basic fields (insurer name, policy number, sum insured, premium amount) within 3 seconds
2. THE Progressive_Loader SHALL show a progress indicator while the full AI analysis runs
3. WHEN the full AI analysis completes, THE Progressive_Loader SHALL update the UI with the complete analysis results without requiring a page reload
4. IF the AI analysis fails, THEN THE Progressive_Loader SHALL retain the basic extracted fields and display an error message for the AI portion only

### Requirement 10: XIRR Calculation Caching

**User Story:** As a user, I want XIRR calculations to be instant after the first computation, so that navigating between pages does not trigger expensive recalculations.

#### Acceptance Criteria

1. THE XIRR_Calculator SHALL cache computed XIRR results keyed by a hash of the input cash flows
2. WHEN the same cash flows are provided, THE XIRR_Calculator SHALL return the cached result without re-running the Newton-Raphson iteration
3. WHEN the user adds, edits, or deletes an investment record, OR when a Zerodha Kite sync completes, THE XIRR cache entry for that user SHALL be invalidated
4. THE XIRR_Calculator SHALL store cached results in client-side memory (React state or module-level Map) to survive re-renders within the same session

### Requirement 11: Dashboard Skeleton Loading

**User Story:** As a user, I want to see skeleton placeholders immediately when the dashboard loads, so that the page feels responsive instead of showing a blank screen.

#### Acceptance Criteria

1. WHILE data is loading, THE Overview_Page SHALL display Skeleton_Loader components in place of each data widget (summary cards, charts, transaction list, goals snapshot)
2. THE Overview_Page SHALL render the Skeleton_Loader layout before the first data fetch response arrives, ensuring the user never sees a blank content area
3. WHEN data for a specific widget arrives, THE Overview_Page SHALL replace that widget's Skeleton_Loader with the real content independently of other widgets
4. THE Skeleton_Loader SHALL match the approximate dimensions of the real content to prevent layout shift

### Requirement 12: API Route Error Standardization

**User Story:** As a developer, I want all API routes to return errors in a consistent format, so that the client can handle errors uniformly.

#### Acceptance Criteria

1. THE API_Route SHALL return error responses in the format `{ "error": "<message>", "code": "<ERROR_CODE>" }`
2. WHEN an unexpected error occurs in any API_Route, THE API_Route SHALL return HTTP 500 with `{ "error": "Internal server error", "code": "INTERNAL_ERROR" }` and log the full error server-side
3. THE API_Route SHALL not expose stack traces, database error details, or internal implementation details in error responses
4. WHEN a rate limit is exceeded, THE API_Route SHALL return HTTP 429 with `{ "error": "Rate limit exceeded", "code": "RATE_LIMITED", "retryAfter": <seconds> }`
5. THE following error codes SHALL be used consistently:
   - `UNAUTHORIZED` — missing or expired session (401)
   - `FORBIDDEN` — valid session but insufficient access (403)
   - `RATE_LIMITED` — rate limit exceeded (429)
   - `VALIDATION_ERROR` — input failed validation (400)
   - `NOT_FOUND` — resource does not exist (404)
   - `INTERNAL_ERROR` — unexpected server error (500)
   - `SERVICE_UNAVAILABLE` — dependency down (503)

### Requirement 13: Database Query User Isolation

**User Story:** As a user, I want my financial data to be accessible only to me, so that other users cannot read or modify my records even if they know my record IDs.

#### Acceptance Criteria

1. EVERY Supabase query in API routes that reads, updates, or deletes user data SHALL include a filter on the authenticated user's ID:
   - Tables with `user_id` column: `.eq('user_id', session.user.id)`
   - `user_profiles` table: `.eq('id', session.user.id)`
   The user ID SHALL always be sourced from the verified Supabase session, NEVER from the request body, query params, or URL path
2. THE following tables SHALL have Row Level Security (RLS) enabled with user isolation policies: `income`, `expenses`, `budgets`, `investments`, `goals`, `loans`, `loan_prepayments`, `insurance_policies`, `insurance_claims`, `insurance_analysis`, `family_members`, `alerts`, `notifications`, `ai_conversations`, `ai_messages`, `retirement_plan`, `nri_return_plan`, `nri_return_checklist_items`, `user_profiles`
3. THE `ai_messages` table RLS policy SHALL verify ownership through the `ai_conversations` table: `EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid())`
4. WHEN RLS blocks a query, Supabase SHALL return an empty result set (not an error) — this is the default Supabase behavior and SHALL be preserved
5. A codebase scan SHALL confirm no API route uses a user ID value taken from `request.body`, `request.params`, or `searchParams` for data access

### Requirement 14: Payment Webhook Security

**User Story:** As a product owner, I want the Razorpay webhook endpoint to verify request authenticity, so that malicious actors cannot trigger payment processing events.

#### Acceptance Criteria

1. THE `/api/payments/webhook` route SHALL verify the Razorpay webhook signature using HMAC-SHA256 on the raw request body before executing any payment logic
2. THE signature verification SHALL use the formula: `expectedSig = HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)` and compare `expectedSig` to the `X-Razorpay-Signature` header
3. IF the `X-Razorpay-Signature` header is absent or does not match: THE route SHALL return HTTP 400 with `{ "error": "Invalid signature", "code": "FORBIDDEN" }` and SHALL NOT process the event
4. THE route SHALL read the raw request body as text BEFORE parsing as JSON to ensure signature integrity is preserved
5. `RAZORPAY_WEBHOOK_SECRET` SHALL be a required environment variable — if absent at startup, the webhook route SHALL return 503 on every request
6. `RAZORPAY_WEBHOOK_SECRET` SHALL be added to `.env.example` with instructions to configure it in the Razorpay dashboard

### Requirement 15: Client-Side Secret Exposure Prevention

**User Story:** As a developer, I want to confirm that no server-side secrets are accessible in client-side code, so that API keys and credentials cannot be extracted from the browser.

#### Acceptance Criteria

1. The following environment variables SHALL be server-side only (no `NEXT_PUBLIC_` prefix): `ANTHROPIC_API_KEY`, `SENDGRID_API_KEY`, `KITE_ENCRYPTION_KEY`, `KITE_API_SECRET`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`
2. `NEXT_PUBLIC_` prefix is permitted ONLY for: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` (publishable key only)
3. A codebase scan SHALL confirm zero occurrences of server-only secret names inside files that contain the `'use client'` directive
4. A codebase scan SHALL confirm no hardcoded credential strings matching these patterns exist anywhere in source code (outside `.env` files):
   - `sk-ant-` prefix (Anthropic keys)
   - `SG.` prefix (SendGrid keys)
   - `rzp_live_` or `rzp_test_` prefix (Razorpay keys)
   - Any string of 32+ hex characters in source files
5. IF any violation is found during the scan: report the file and line number and DO NOT proceed to implementation until resolved
