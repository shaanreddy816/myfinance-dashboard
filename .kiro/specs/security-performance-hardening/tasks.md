# Tasks

## Task 1: Standardized Error Response Utility
- [x] 1.1 Create `src/lib/security/apiError.ts` with `ErrorCode` type, `apiError()` helper, and `withErrorHandler` wrapper
- [x] 1.2 Export error codes: UNAUTHORIZED, FORBIDDEN, RATE_LIMITED, VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR, SERVICE_UNAVAILABLE
- [x] 1.3 Ensure `withErrorHandler` catches all exceptions and returns `{ error: "Internal server error", code: "INTERNAL_ERROR" }` without stack traces
- [x] 1.4 Write property test: standardized error format (Property 18) in `tests/security/errorFormat.property.test.ts`

## Task 2: Auth Guard Utility
- [x] 2.1 Create `src/lib/security/authGuard.ts` with `withAuth` higher-order function
- [x] 2.2 `withAuth` extracts Supabase session, returns 401 UNAUTHORIZED if no session, passes `{ userId, supabase }` to handler
- [x] 2.3 Write property tests: unauthenticated rejection (Property 1) and authenticated context (Property 2) in `tests/security/authGuard.property.test.ts`

## Task 3: Enhanced Middleware — Route Protection
- [x] 3.1 Update `src/middleware.ts` matcher config to cover all `/(dashboard)/*` and `/api/*` paths
- [x] 3.2 Add unauthenticated `/api/*` handling: return 401 JSON (exclude `/api/auth/*` and `/api/payments/webhook/`)
- [x] 3.3 Ensure dashboard redirects include `returnTo` query parameter
- [x] 3.4 Write property tests: dashboard redirect with returnTo (Property 3) and API 401 without redirect (Property 4) in `tests/security/middleware.test.ts`

## Task 4: Security Headers in Middleware
- [x] 4.1 Add security headers to all middleware responses: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, X-XSS-Protection, Permissions-Policy
- [x] 4.2 Add HSTS header conditionally — only when hostname is not localhost and not a preview deployment
- [x] 4.3 Write property test: security headers present on all responses (Property 5) in `tests/security/middleware.test.ts`

## Task 5: Enhanced Rate Limiter — AI Route Limits
- [x] 5.1 Add `checkAIRateLimit(userId, routePath)` to `src/lib/security/rateLimit.ts` with per-route config (chat: 20/60s, analyze-insurance: 5/60s, others: 10/60s)
- [x] 5.2 Implement tiered fail-closed (chat) / fail-open (others) behavior when Redis is unavailable
- [x] 5.3 Return `{ success, retryAfter }` from rate limit check
- [x] 5.4 Write property tests: AI rate limit enforcement (Property 6) and Redis failure behavior (Property 7) in `tests/security/rateLimit.property.test.ts`

## Task 6: IP-Based Rate Limiting
- [x] 6.1 Add `checkIPRateLimit(ip)` to `src/lib/security/rateLimit.ts` with 100 req/60s limit
- [x] 6.2 Add `extractClientIP(req)` helper that reads `x-forwarded-for` with fallback
- [x] 6.3 Add route exclusion list for `/api/kite/callback` and `/api/payments/webhook/`
- [x] 6.4 Write property tests: IP rate limit (Property 8), IP extraction (Property 9), independent composition (Property 10) in `tests/security/rateLimit.property.test.ts`

## Task 7: Input Validation Utility
- [x] 7.1 Create `src/lib/security/inputValidator.ts` with `withValidation` HOF, sanitize function, and reusable Zod schemas
- [x] 7.2 Implement string sanitization (trim whitespace, remove null bytes)
- [x] 7.3 Implement body size check (reject >1MB for non-file-upload routes)
- [x] 7.4 Add file validation schemas: PDF (type, 10MB, safe filename) and CSV (type, 5MB)
- [x] 7.5 Write property tests: invalid input rejection (Property 11), string sanitization (Property 12), file validation (Property 13) in `tests/security/inputValidator.property.test.ts`

## Task 8: Apply Auth + Validation + Rate Limiting to AI Chat Route
- [x] 8.1 Refactor `/api/ai/chat/route.ts` to use `withAuth`, `withValidation`, `checkAIRateLimit`, and `withErrorHandler`
- [x] 8.2 Add Zod schema for chat request body (messages array, conversationId, financialContext) with 500-char message limit
- [x] 8.3 Limit conversation history to last 10 messages before sending to Anthropic
- [x] 8.4 Write property test: conversation history truncation (Property 16) in `tests/security/inputValidator.property.test.ts`

## Task 9: AI Chat Streaming Response
- [x] 9.1 Replace `fetch` call to Anthropic with `@anthropic-ai/sdk` streaming: `anthropic.messages.stream()`
- [x] 9.2 Return `ReadableStream` response with `Content-Type: text/event-stream`
- [x] 9.3 Save complete assistant message to DB after stream finishes using `stream.finalMessage()`
- [x] 9.4 Handle Anthropic errors during streaming: send error event and close stream
- [x] 9.5 Write property test: streamed message persistence (Property 15) in `tests/performance/aiChatStreaming.test.ts`
- [x] 9.6 Write unit tests: streaming response headers, error event on Anthropic failure in `tests/performance/aiChatStreaming.test.ts`

## Task 10: Apply Auth + Validation to Remaining API Routes
- [x] 10.1 Apply `withAuth` and `withErrorHandler` to all API routes under `/api/` (excluding `/api/auth/*` and `/api/payments/webhook/`)
- [x] 10.2 Apply `checkAIRateLimit` to all AI routes listed in the glossary
- [x] 10.3 Add Zod schemas and `withValidation` to POST routes that accept request bodies
- [x] 10.4 Apply file validation to `/api/import/csv`, `/api/analyze-insurance-policy`, `/api/insurance/analyze`

## Task 11: Payment Webhook Security Hardening
- [x] 11.1 Add `RAZORPAY_WEBHOOK_SECRET` presence check — return 503 if missing
- [x] 11.2 Replace `!==` signature comparison with `crypto.timingSafeEqual`
- [x] 11.3 Return standardized error format `{ error, code: "FORBIDDEN" }` on signature mismatch
- [x] 11.4 Add `RAZORPAY_WEBHOOK_SECRET` to `.env.example` with configuration instructions
- [x] 11.5 Write property tests: HMAC verification (Property 19) and invalid signature rejection (Property 20) in `tests/security/webhookSignature.property.test.ts`

## Task 12: Database Row-Level Security
- [x] 12.1 Create SQL migration enabling RLS on all 19 tables with user isolation policies
- [x] 12.2 Add `ai_messages` RLS policy with conversation ownership check via `ai_conversations`
- [x] 12.3 Add `user_profiles` RLS policy using `id = auth.uid()` (not `user_id`)
- [x] 12.4 Write property test: ai_messages RLS through conversation ownership (Property 21) — verify query returns empty for non-owner
- [x] 12.5 Audit all API routes to confirm user_id is sourced from session, not request body/params

## Task 13: Overview Page Batch Query
- [x] 13.1 Create `src/hooks/useOverviewData.ts` with single `Promise.allSettled` batch query for all 8 data types
- [x] 13.2 Implement per-widget status tracking (loading/success/error) based on settled results
- [x] 13.3 Implement 5-second timeout with retry button
- [x] 13.4 Refactor health score computation to reuse batch data instead of making separate queries
- [x] 13.5 Write property test: partial failure resilience (Property 14) in `tests/performance/overviewBatch.test.ts`
- [x] 13.6 Write unit test: timeout shows retry button in `tests/performance/overviewBatch.test.ts`

## Task 14: Overview Page Skeleton Loading
- [x] 14.1 Refactor `OverviewPage` to use `useOverviewData` hook and render `SkeletonLoader` per widget during loading
- [x] 14.2 Replace individual hook loading states with per-widget status from batch query
- [x] 14.3 Ensure each widget independently transitions from skeleton to real content or error state
- [x] 14.4 Remove duplicate `useEffect` hooks for data fetching (user type check, health score, etc.)

## Task 15: XIRR Calculation Caching
- [x] 15.1 Create `src/lib/finance/xirrCache.ts` with module-level `Map` cache, `getCachedXirr`, `setCachedXirr`, `invalidateXirrCache`
- [x] 15.2 Implement `hashCashFlows` function for deterministic cache keys
- [x] 15.3 Integrate cache into existing `xirr()` function — check cache before Newton-Raphson, store result after
- [x] 15.4 Add cache invalidation calls on investment CRUD operations and Kite sync completion
- [x] 15.5 Write property test: XIRR cache round-trip (Property 17) in `tests/performance/xirrCache.property.test.ts`

## Task 16: Insurance PDF Progressive Loading
- [x] 16.1 Modify insurance upload flow to return basic extracted fields (insurer, policy number, sum insured, premium) immediately after text extraction
- [x] 16.2 Run full AI analysis asynchronously after returning basic fields
- [x] 16.3 Update client-side insurance upload UI to show basic fields immediately with progress indicator
- [x] 16.4 Leverage existing Supabase realtime subscription to update UI when AI analysis completes
- [x] 16.5 Handle AI analysis failure: retain basic fields, show error for AI portion only

## Task 17: Client-Side Secret Exposure Prevention
- [x] 17.1 Run codebase scan for server-only secret names in `'use client'` files
- [x] 17.2 Run codebase scan for hardcoded credential patterns (`sk-ant-`, `SG.`, `rzp_live_`, `rzp_test_`, 32+ hex chars)
- [x] 17.3 Verify all server-only env vars lack `NEXT_PUBLIC_` prefix
- [x] 17.4 Document findings and fix any violations before proceeding
