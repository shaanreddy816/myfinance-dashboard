# Implementation Plan: Business Monetization Features

## Overview

This implementation plan transforms FamLedgerAI into a revenue-generating platform by adding 5 business-critical features: Daily Financial Briefing System, Financial Health Quick Check Tool, Insurance Clause Checker Tool, Pricing Page with Credit System, and Legal Disclaimer System. All features integrate seamlessly with the existing Next.js/TypeScript codebase without breaking changes.

## Tasks

- [x] 1. Database migrations and schema setup
  - [x] 1.1 Create daily_briefings table with RLS policies
    - Create table with columns: id, user_id, date, weekly_score, previous_score, score_change, insights (JSONB), generated_at, created_at
    - Add unique constraint on (user_id, date)
    - Create indexes on (user_id, date DESC) and generated_at
    - Enable RLS with policies for user access and service role management
    - File: `supabase/migrations/20250115_daily_briefings.sql`
    - _Requirements: 1.11, 1.14, 1.15, 1.16_

  - [x] 1.2 Extend user_profiles table with monetization columns
    - Add columns: age, city, profession, annual_income_range, plan (default 'free'), plan_expires_at, trial_started_at, ai_credits_used (default 0), ai_credits_limit (default 10)
    - Add CHECK constraint on plan column (free, pro, family)
    - Create indexes on plan and (ai_credits_used, ai_credits_limit)
    - File: `supabase/migrations/20250115_user_profiles_monetization.sql`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [x] 1.3 Create atomic credit increment database function
    - Create PostgreSQL function increment_ai_credits(user_id_param UUID)
    - Implement atomic UPDATE operation to increment ai_credits_used
    - Grant execute permissions to authenticated and service_role
    - File: `supabase/migrations/20250115_user_profiles_monetization.sql`
    - _Requirements: 4.31, 4.32, 6.11_

- [x] 2. Credit system implementation
  - [x] 2.1 Implement credit checking and consumption functions
    - Create checkAICredits(userId) function returning CreditCheckResult
    - Implement logic for pro/family unlimited credits
    - Implement logic for free plan credit limits
    - Handle plan expiration checking
    - Create consumeAICredit(userId) function using atomic database operation
    - Create getCreditStatus(userId) helper function
    - File: `src/lib/credits/creditSystem.ts`
    - _Requirements: 4.24, 4.25, 4.26, 4.27, 4.28, 4.29, 4.30, 4.31, 4.32_

  - [ ]* 2.2 Write property test for atomic credit consumption
    - **Property 12: Atomic Credit Consumption**
    - **Validates: Requirements 4.31, 4.32, 6.11**
    - Test concurrent credit consumption with N parallel calls
    - Verify final count equals initial + N (no race conditions)
    - File: `__tests__/properties/credits.property.test.ts`

  - [ ]* 2.3 Write unit tests for credit system
    - Test pro plan allows unlimited usage
    - Test free plan blocks when credits exhausted
    - Test free plan allows when credits available
    - Test consumeAICredit increments counter
    - Test plan expiration handling
    - File: `__tests__/creditSystem.test.ts`

- [x] 3. Daily briefing system - backend
  - [x] 3.1 Implement briefing engine core logic
    - Create generateDailyBriefing(userId) function with 2-hour caching
    - Implement getCachedBriefing() and isFresh() helpers
    - Implement fetchFinancialContext() to gather user data
    - Implement cacheBriefing() with upsert logic for unique constraint handling
    - Implement getScoreFromWeekAgo() for trend comparison
    - File: `src/lib/briefing/engine.ts`
    - _Requirements: 1.11, 1.12, 1.13_

  - [x] 3.2 Implement insight generation rules
    - Create generateInsights(context) function
    - Implement Rule 1: EMI payments due within 7 days (reminder)
    - Implement Rule 2: Insurance renewals within 30 days (reminder)
    - Implement Rule 3: Low savings rate below 20% (warning)
    - Implement Rule 4: Insufficient emergency fund below 6 months (warning)
    - Implement Rule 5: SIP opportunity when no SIPs and good savings (opportunity)
    - Implement Rule 6: Insurance coverage gap (opportunity)
    - Limit insights to 5-6, prioritize by severity
    - File: `src/lib/briefing/insights.ts`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 3.3 Implement weekly score calculation
    - Create calculateWeeklyScore(context) function
    - Implement Pillar 1: Savings rate (25 points max)
    - Implement Pillar 2: EMI ratio (20 points max)
    - Implement Pillar 3: Emergency fund (20 points max)
    - Implement Pillar 4: Investments (15 points max)
    - Implement Pillar 5: Insurance (15 points max)
    - Implement Pillar 6: Income (5 points max)
    - Ensure score is clamped to 0-100 range
    - File: `src/lib/briefing/engine.ts`
    - _Requirements: 1.9, 1.10_

  - [x] 3.4 Create daily briefing API endpoint
    - Create GET /api/briefing route
    - Verify user authentication
    - Call generateDailyBriefing() with fire-and-forget error handling
    - Generate time-appropriate greeting (morning/afternoon/evening)
    - Return briefing data with success/error responses
    - Handle 401 for unauthenticated, 500 for errors
    - File: `src/app/api/briefing/route.ts`
    - _Requirements: 1.17, 1.18, 6.9_

  - [ ]* 3.5 Write property tests for briefing system
    - **Property 1: Briefing Insight Count** - Verify 5-6 insights generated
    - **Property 2: Briefing Insight Type Validity** - Verify all types are valid
    - **Property 3: Briefing Cache Idempotence** - Verify cache returns identical data
    - **Property 4: Briefing Serialization Round-Trip** - Verify JSONB serialization
    - **Property 5: Daily Briefing Uniqueness** - Verify unique constraint enforcement
    - **Validates: Requirements 1.1, 1.2, 1.12, 1.15, 1.14**
    - File: `__tests__/properties/briefing.property.test.ts`

  - [ ]* 3.6 Write unit tests for briefing engine
    - Test EMI reminder generation when payment due in 7 days
    - Test warning generation for low savings rate
    - Test cached briefing return when less than 2 hours old
    - Test briefing regeneration when cache older than 2 hours
    - Test score calculation for various financial contexts
    - File: `__tests__/briefing.test.ts`

- [x] 4. Daily briefing system - frontend
  - [x] 4.1 Create DailyBriefing React component
    - Implement component with state: briefing, loading, error, collapsed
    - Fetch briefing data on mount with fire-and-forget error handling
    - Generate time-appropriate greeting based on current hour
    - Display weekly score as prominent number
    - Display trend arrow (up/down) based on score change
    - Render insights with type-specific icons and colors
    - Implement collapsible UI functionality
    - Handle action buttons for insights with actionUrl
    - File: `src/components/overview/DailyBriefing.tsx`
    - _Requirements: 1.19, 1.20, 1.21, 1.22, 1.23, 1.24, 1.25, 1.26_

  - [x] 4.2 Integrate DailyBriefing into Overview page
    - Import DailyBriefing component
    - Place as first element on Overview page above all other content
    - Ensure briefing failure doesn't block dashboard loading
    - File: `src/app/(dashboard)/overview/page.tsx`
    - _Requirements: 1.27, 6.9, 6.10_

- [x] 5. Health check tool - calculation logic
  - [x] 5.1 Implement health score calculation engine
    - Create calculateHealthScore(input) function
    - Implement calculateSavingsRatePillar() - 25 points max (20%+ = 25, 10-20% = 15, <10% = 5)
    - Implement calculateEMIRatioPillar() - 20 points max (<20% = 20, 20-40% = 12, >40% = 4)
    - Implement calculateEmergencyFundPillar() - 20 points max (6+ months = 20, 3-6 months = 12, <3 months = 4)
    - Implement calculateInvestmentsPillar() - 15 points max (any investments = 15, none = 0)
    - Implement calculateInsurancePillar() - 15 points max (health = 10, term = 5)
    - Implement calculateIncomePillar() - 5 points max (any income = 5)
    - Implement getGrade() - A (80+), B (65-79), C (50-64), D (<50)
    - Implement identifyRisks() and identifyOpportunities()
    - Implement generateMessage() based on score range
    - File: `src/lib/calculators/healthCheck.ts`
    - _Requirements: 2.7-2.31_

  - [ ]* 5.2 Write property tests for health check calculator
    - **Property 6: Health Score Bounds Invariant** - Verify score always 0-100
    - **Property 7: Health Score Determinism** - Verify same input produces same output
    - **Property 8: Grade Assignment Correctness** - Verify grade thresholds
    - **Validates: Requirements 2.27, 2.28, 2.29, 2.30, 2.31**
    - File: `__tests__/properties/healthCheck.property.test.ts`

  - [ ]* 5.3 Write unit tests for health check calculator
    - Test grade A assignment for score 80+
    - Test risk identification when no health insurance
    - Test edge case of zero income
    - Test opportunity identification for SIP
    - Test breakdown calculation for each pillar
    - File: `__tests__/healthCheck.test.ts`

- [x] 6. Health check tool - frontend
  - [x] 6.1 Create health check wizard components
    - Create HealthCheckWizard component with 6-step state management
    - Implement ProgressBar component showing completion percentage
    - Create input forms for: monthly income, monthly expenses, total loans, total investments, family size
    - Create insurance coverage checkboxes (health, term)
    - Implement step navigation with validation
    - Implement client-side validation with error messages
    - Call calculateHealthScore() on completion (no API calls)
    - File: `src/components/health-check/HealthCheckWizard.tsx`
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

  - [x] 6.2 Create health check results display component
    - Display score as large prominent number with color coding (teal 80+, white 65-79, orange <65)
    - Display grade badge next to score
    - Display contextual message based on score range
    - List identified risks in red/orange
    - List identified opportunities in teal
    - Display CTA button "Get Full Analysis — Free →" linking to /register
    - File: `src/components/health-check/HealthCheckResults.tsx`
    - _Requirements: 2.32, 2.33, 2.34, 2.35, 2.36, 2.37, 2.38, 2.39, 2.40_

  - [x] 6.3 Create public health check page
    - Create page at /health-check route
    - Integrate HealthCheckWizard and HealthCheckResults components
    - Ensure no authentication required
    - Add page title and description
    - File: `src/app/(public)/health-check/page.tsx`
    - _Requirements: 2.1, 2.2, 2.6_

- [x] 7. Clause checker tool
  - [x] 7.1 Create clause explanation API endpoint
    - Create POST /api/insurance-education/explain route
    - Accept requests without authentication (public endpoint)
    - Validate question field in request body
    - Construct Claude AI prompt: "Explain this insurance clause in simple language for an Indian consumer: [clause]. Tell me: what it means, real example with numbers, and if it is good or bad for me. Keep it under 150 words. Be direct."
    - Call Claude 3.5 Sonnet API
    - Return JSON response with answer field
    - Handle errors with 400/500 status codes
    - File: `src/app/api/insurance-education/explain/route.ts`
    - _Requirements: 3.8, 3.9, 3.10, 3.11, 3.12_

  - [ ]* 7.2 Write property test for clause explanation prompt
    - **Property 9: Clause Explanation Prompt Format**
    - **Validates: Requirements 3.11**
    - Verify prompt includes clause text, plain English request, example request, good/bad assessment, 150-word limit
    - File: `__tests__/properties/clauseChecker.property.test.ts`

  - [x] 7.3 Create clause checker page component
    - Create page at /clause-checker route
    - Implement textarea for clause input
    - Create 5 example clause buttons that populate textarea
    - Implement "Explain This Clause →" button
    - Call /api/insurance-education/explain on button click
    - Display AI explanation in teal-bordered box labeled "AI EXPLANATION"
    - Display CTA: "Want full policy analysis? Sign up free →" linking to /register
    - Handle loading and error states
    - Ensure no authentication required
    - File: `src/app/(public)/clause-checker/page.tsx`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.13, 3.14, 3.15_

- [x] 8. Pricing page
  - [x] 8.1 Create pricing page component
    - Create page at /pricing route
    - Display 3 subscription plans: Free (₹0/forever), Pro (₹299/month), Family (₹499/month)
    - Add "Most Popular" badge on Pro plan card
    - List features for each plan with checkmarks/X marks
    - Free: 3 AI runs/month, basic features
    - Pro: unlimited AI runs, all features, 14-day free trial
    - Family: Pro features + 6 members, joint planning, CA consultation
    - Display CTA buttons on each card
    - Display trust note: "Bank-grade security · No insurance commissions · Cancel anytime"
    - Display legal disclaimer about SEBI/IRDAI
    - Ensure no authentication required
    - File: `src/app/(public)/pricing/page.tsx`
    - _Requirements: 4.10, 4.11, 4.12, 4.13, 4.14, 4.15, 4.16, 4.17, 4.18, 4.19, 4.20, 4.21, 4.22, 4.23_

  - [ ]* 8.2 Write property test for credit check structure
    - **Property 10: Credit Check Structure**
    - **Validates: Requirements 4.24, 4.25**
    - Verify checkAICredits returns object with: allowed, plan, creditsUsed, creditsLimit, message
    - File: `__tests__/properties/credits.property.test.ts`

  - [ ]* 8.3 Write property test for credit allowance rules
    - **Property 11: Credit Allowance Rules**
    - **Validates: Requirements 4.26, 4.27, 4.28**
    - Test pro/family plans return allowed=true
    - Test free plan with available credits returns allowed=true
    - Test free plan with exhausted credits returns allowed=false
    - File: `__tests__/properties/credits.property.test.ts`

- [x] 9. Integrate credit gating into AI features
  - [x] 9.1 Add credit gating to insurance policy analysis API
    - Import checkAICredits and consumeAICredit functions
    - Call checkAICredits before processing request
    - Return 402 status with upgrade message if not allowed
    - Process request if allowed
    - Call consumeAICredit after successful processing
    - Include creditsRemaining in response
    - File: `src/app/api/analyze-insurance-policy/route.ts`
    - _Requirements: 4.33, 4.34, 4.35, 4.38_

  - [x] 9.2 Add credit gating to PED advisor API
    - Import checkAICredits and consumeAICredit functions
    - Call checkAICredits before processing request
    - Return 402 status with upgrade message if not allowed
    - Process request if allowed
    - Call consumeAICredit after successful processing
    - File: `src/app/api/ped-advisor/route.ts`
    - _Requirements: 4.36, 4.37, 4.38_

  - [ ]* 9.3 Write property test for AI feature credit gating
    - **Property 13: AI Feature Credit Gating**
    - **Validates: Requirements 4.33, 4.34, 4.35, 4.36, 4.37**
    - Test API returns 402 when credits exhausted
    - Test API does not process request when credits exhausted
    - Test API does not consume credits when request blocked
    - File: `__tests__/properties/credits.property.test.ts`

  - [ ]* 9.4 Write unit tests for API credit integration
    - Test 401 when user not authenticated
    - Test 402 when credits exhausted with upgrade URL
    - Test successful processing and credit consumption
    - Test credit counter increments after usage
    - File: `__tests__/apiCreditIntegration.test.ts`

- [x] 10. Legal disclaimer system
  - [x] 10.1 Create reusable LegalDisclaimer component
    - Accept type prop: 'general', 'insurance', or 'investment'
    - Display appropriate disclaimer text based on type
    - General: "FamLedgerAI provides financial tools for educational and organizational purposes only. We are not SEBI-registered advisors or IRDAI-licensed brokers. Nothing on this platform constitutes financial, investment, or insurance advice."
    - Insurance: "Insurance analysis shown is for educational purposes only. FamLedgerAI is not an insurance broker, agent, or intermediary. We do not sell policies or earn commissions. Always verify details with your insurer and consult a licensed advisor."
    - Investment: "Investment insights are for educational purposes only. Past performance does not guarantee future returns. FamLedgerAI is not a SEBI-registered investment advisor. Consult a qualified financial advisor before investing."
    - Render with scales of justice icon (⚖️)
    - Style with small font, reduced opacity, subtle border
    - File: `src/components/legal/LegalDisclaimer.tsx`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.14_

  - [ ]* 10.2 Write property test for disclaimer text mapping
    - **Property 14: Legal Disclaimer Text Mapping**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - Verify each type renders exact corresponding text
    - File: `__tests__/properties/legalDisclaimer.property.test.ts`

  - [x] 10.3 Integrate disclaimers into existing pages
    - Add LegalDisclaimer type='insurance' to bottom of /insurance page
    - Add LegalDisclaimer type='insurance' to top of /education page
    - Add LegalDisclaimer type='investment' to bottom of /investments page
    - Add LegalDisclaimer type='general' to bottom of /overview page
    - Files: `src/app/(dashboard)/insurance/page.tsx`, `src/app/(dashboard)/education/page.tsx`, `src/app/(dashboard)/investments/page.tsx`, `src/app/(dashboard)/overview/page.tsx`
    - _Requirements: 5.9, 5.10, 5.11, 5.12, 5.13_

- [x] 11. Middleware and routing updates
  - [x] 11.1 Update middleware to bypass authentication for public routes
    - Define public routes array: /health-check, /clause-checker, /pricing, /login, /register, /privacy, /terms, /disclaimer
    - Check if request path matches public route
    - Allow access without authentication for public routes
    - Maintain authentication requirement for protected routes
    - Redirect unauthenticated users to /login with returnTo parameter
    - File: `src/middleware.ts`
    - _Requirements: 2.2, 3.2, 4.11, 6.12_

  - [ ]* 11.2 Write property test for public route authentication bypass
    - **Property 15: Public Route Authentication Bypass**
    - **Validates: Requirements 2.2, 3.2, 4.11, 6.12**
    - Test public routes accessible without authentication
    - Test protected routes require authentication
    - File: `__tests__/properties/middleware.property.test.ts`

- [ ] 12. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property tests and verify they pass
  - Check TypeScript compilation for errors
  - Verify database migrations applied successfully
  - Test credit system atomic operations
  - Ask the user if questions arise

- [ ] 13. Integration testing and verification
  - [ ]* 13.1 Write end-to-end test for anonymous user journey
    - Test anonymous user visits /health-check
    - Test user completes wizard and sees results
    - Test user clicks CTA and reaches /register
    - File: `__tests__/e2e/anonymousUserJourney.test.ts`

  - [ ]* 13.2 Write end-to-end test for credit exhaustion flow
    - Test free user with 1 credit remaining
    - Test user uses last credit successfully
    - Test user sees upgrade modal on next AI feature attempt
    - Test user clicks upgrade and reaches /pricing
    - File: `__tests__/e2e/creditExhaustionFlow.test.ts`

  - [ ] 13.3 Manual verification of all features
    - Verify daily briefing appears on overview page with correct greeting
    - Verify health check tool works without login
    - Verify clause checker explains clauses correctly
    - Verify pricing page displays all 3 plans
    - Verify credit system blocks AI features when exhausted
    - Verify legal disclaimers appear on all specified pages
    - Verify public routes accessible without authentication
    - Verify protected routes require authentication

- [-] 14. Build verification and deployment preparation
  - [x] 14.1 Verify TypeScript compilation
    - Run build command and ensure 0 TypeScript errors
    - Fix any type errors or warnings
    - Verify all imports resolve correctly
    - _Requirements: 6.1_

  - [x] 14.2 Verify feature integration
    - Test daily briefing reuses automation insights logic
    - Test health check reuses financial calculation logic
    - Test clause checker reuses insurance-education endpoint
    - Test credit system gates all AI features
    - Test legal disclaimers on all AI output pages
    - Verify no breaking changes to existing features
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 14.3 Performance testing
    - Verify briefing generation completes in < 5 seconds
    - Verify health check calculation is instant (client-side)
    - Verify clause explanation returns in < 3 seconds
    - Verify credit check adds < 100ms to API calls
    - Test briefing cache reduces API calls

- [ ] 15. Final checkpoint - Production readiness
  - Ensure all tests pass (unit, property, integration, e2e)
  - Verify database migrations are idempotent
  - Verify environment variables are documented
  - Verify error handling works for all edge cases
  - Verify rollback plan is documented
  - Ask the user if ready to deploy

## Notes

- Tasks marked with `*` are optional property-based and integration tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ randomized iterations
- Unit tests validate specific examples and edge cases
- All code is TypeScript in a Next.js 14 application
- Database operations use Supabase PostgreSQL with RLS
- AI features use Anthropic Claude 3.5 Sonnet
- Credit system uses atomic database operations to prevent race conditions
- Public routes bypass authentication middleware for lead generation
- Legal disclaimers ensure regulatory compliance on all AI-powered pages
