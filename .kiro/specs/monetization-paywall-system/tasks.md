# Implementation Plan: Monetization & Paywall System

## Overview

Implementation follows a layered architecture: data layer (plans, subscription state) → gate layer (feature access checks) → payment layer (Razorpay integration) → UI layer (pricing page, upgrade modal, paywalls). All API routes use existing security patterns (`withAuth`, `withErrorHandler`, `withValidation`).

## Tasks

- [x] 1. Plan Configuration Module
  - [x] 1.1 Create `src/lib/billing/plans.ts` with `PlanFeature`, `UsageMetric`, `PlanId`, `BillingCycle` types and `PlanConfig` interface
    - Define 13 boolean feature flags and 3 usage metrics
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Implement `PLANS` record with `free`, `pro`, `nri_premium` configurations
    - Free: ₹0, AI Advisor 5/mo, Insurance 1/mo, Copilot 0
    - Pro: ₹299/mo or ₹2,499/yr (30% save), unlimited AI/Insurance, Copilot 30/mo
    - NRI Premium: ₹499/mo or ₹3,999/yr (33% save), everything unlimited
    - _Requirements: 1.6, 1.7, 1.8_
  - [x] 1.3 Implement `getPlan()`, `canAccessFeature()`, `getLimit()`, `getMinimumPlanForFeature()` functions
    - _Requirements: 1.3, 1.4, 1.5_
  - [ ]* 1.4 Write property test for plan lookup consistency (Property 1)
    - **Property 1: Plan lookup consistency**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - Test file: `tests/billing/plans.property.test.ts`
  - [ ]* 1.5 Write property test for plan config completeness (Property 2)
    - **Property 2: Plan config completeness**
    - **Validates: Requirements 1.2**
    - Test file: `tests/billing/plans.property.test.ts`

- [x] 2. Subscription State Management
  - [x] 2.1 Create `src/lib/billing/subscription.ts` with `SubscriptionStatus`, `UsageCounters`, `UserSubscription` types
    - _Requirements: 2.1_
  - [x] 2.2 Implement `getDefaultSubscription()` returning free plan with active status and zero counters
    - _Requirements: 2.2_
  - [x] 2.3 Implement `getUserSubscription()` — reads `preferences.subscription` from `user_profiles`, returns default if missing, auto-resets usage counters on month boundary
    - _Requirements: 2.3, 2.4_
  - [x] 2.4 Implement `saveUserSubscription()` — JSONB merge that preserves other preferences keys
    - _Requirements: 2.5_
  - [x] 2.5 Implement `incrementUsage()` — atomic read-modify-write for a single usage counter
    - _Requirements: 2.6_
  - [x] 2.6 Implement `isSubscriptionActive()` and `getEffectivePlan()` — free always active, paid checks status + period end, cancelled active until period end
    - _Requirements: 2.7, 2.8_
  - [ ]* 2.7 Write property test for subscription default fallback (Property 3)
    - **Property 3: Subscription default fallback**
    - **Validates: Requirements 2.3**
    - Test file: `tests/billing/subscription.property.test.ts`
  - [ ]* 2.8 Write property test for usage counter monthly reset (Property 4)
    - **Property 4: Usage counter monthly reset**
    - **Validates: Requirements 2.4**
    - Test file: `tests/billing/subscription.property.test.ts`
  - [ ]* 2.9 Write property test for preferences JSONB merge preservation (Property 5)
    - **Property 5: Preferences JSONB merge preservation**
    - **Validates: Requirements 2.5**
    - Test file: `tests/billing/subscription.property.test.ts`
  - [ ]* 2.10 Write property test for usage increment invariant (Property 6)
    - **Property 6: Usage increment invariant**
    - **Validates: Requirements 2.6**
    - Test file: `tests/billing/subscription.property.test.ts`
  - [ ]* 2.11 Write property test for subscription active calculation (Property 7)
    - **Property 7: Subscription active calculation**
    - **Validates: Requirements 2.7**
    - Test file: `tests/billing/subscription.property.test.ts`
  - [ ]* 2.12 Write property test for effective plan resolution (Property 8)
    - **Property 8: Effective plan resolution**
    - **Validates: Requirements 2.8**
    - Test file: `tests/billing/subscription.property.test.ts`

- [x] 3. Feature Gate Middleware
  - [x] 3.1 Create `src/lib/billing/featureGate.ts` with `GateReason`, `GateResult` types and `checkFeatureAccess()` function
    - Implements: get subscription → get effective plan → check feature access → check usage limits
    - Returns `allowed`, `reason` (locked/limit_reached), `upgradeRequired`, `currentUsage`, `limit`, `message`
    - NRI-only features require `nri_premium`, all other locked features require `pro`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 3.2 Write property test for feature gate result correctness (Property 9)
    - **Property 9: Feature gate result correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5**
    - Test file: `tests/billing/featureGate.property.test.ts`

- [x] 4. Checkpoint — Core billing library
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Razorpay Subscription Creation API
  - [x] 5.1 Create `src/app/api/payments/create-subscription/route.ts` with Zod schema for `{ planId, billingCycle }`
    - Validate `planId` is `'pro'` or `'nri_premium'`, `billingCycle` is `'monthly'` or `'annual'`
    - Use `withErrorHandler(withAuth(withValidation(schema, handler)))` pattern
    - _Requirements: 4.1, 4.2_
  - [x] 5.2 Implement handler: create/reuse Razorpay customer, create subscription with plan ID from env vars, return subscription details with amount in paise
    - Store `user_id` and `plan_id` in subscription notes for webhook extraction
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  - [ ]* 5.3 Write property test for subscription creation input validation (Property 10)
    - **Property 10: Subscription creation input validation**
    - **Validates: Requirements 4.1, 4.2**
    - Test file: `tests/billing/createSubscription.property.test.ts`
  - [ ]* 5.4 Write property test for price to paise conversion (Property 11)
    - **Property 11: Price to paise conversion**
    - **Validates: Requirements 4.6**
    - Test file: `tests/billing/createSubscription.property.test.ts`

- [x] 6. Webhook Subscription Event Handling
  - [x] 6.1 Extend existing `/api/payments/webhook/route.ts` to handle subscription lifecycle events
    - `subscription.activated`: Set `status: 'active'`, `plan_id` from notes, `current_period_end` from `next_billing_at`
    - `subscription.charged`: Extend `current_period_end` by billing cycle, `status: 'active'`
    - `subscription.cancelled`: Set `status: 'cancelled'`, `cancelled_at: now`, keep plan active until period end
    - `subscription.completed`: Set `status: 'expired'`
    - `subscription.halted`: Set `status: 'past_due'`
    - Extract user ID from `subscription.notes.user_id`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [ ]* 6.2 Write property test for webhook event state transitions (Property 12)
    - **Property 12: Webhook event state transitions**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
    - Test file: `tests/billing/webhook.property.test.ts`

- [x] 7. Subscription Cancellation API
  - [x] 7.1 Create `src/app/api/payments/cancel-subscription/route.ts` with `withErrorHandler(withAuth(handler))`
    - Return 404 if no active paid subscription
    - Call `razorpay.subscriptions.cancel(id, { cancel_at_cycle_end: true })`
    - Update subscription: `status: 'cancelled'`, `cancelled_at: now`
    - Return `{ message, accessUntil }` with period end date
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Billing Status API
  - [x] 8.1 Create `src/app/api/billing/status/route.ts` with `withErrorHandler(withAuth(handler))`
    - Return `{ subscription, plan (without razorpayPlanIds), daysRemaining, usagePercents }`
    - `usagePercents`: null if unlimited, 0-100 percent if limited
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 8.2 Write property test for billing status usage percent calculation (Property 13)
    - **Property 13: Billing status usage percent calculation**
    - **Validates: Requirements 7.2, 7.3**
    - Test file: `tests/billing/billingStatus.property.test.ts`

- [x] 9. Feature Gates on Existing API Routes
  - [x] 9.1 Add feature gate to `/api/ai/chat/route.ts` — gate on `aiAdvisor` + `ai_messages_this_month`, increment usage after success
    - Return HTTP 402 with `{ error, code: 'RATE_LIMITED', upgradeRequired, currentUsage, limit }` when blocked
    - Gate runs AFTER auth check, BEFORE expensive AI operations
    - _Requirements: 8.1, 8.8, 8.9_
  - [x] 9.2 Add feature gate to `/api/copilot/run-agent/route.ts` — gate on `aiCopilot` + `ai_copilot_runs_this_month`
    - _Requirements: 8.2, 8.8, 8.9_
  - [x] 9.3 Add feature gate to `/api/insurance/analyze-policy/route.ts` and `/api/insurance/analyze/route.ts` — gate on `insurancePDFAnalysis` + `insurance_analyses_this_month`
    - _Requirements: 8.3, 8.8, 8.9_
  - [x] 9.4 Add feature gate to Kite routes (`/api/kite/connect`, `/api/kite/sync`) — gate on `zerodhaKiteSync` (no usage limit)
    - _Requirements: 8.4, 8.8_
  - [x] 9.5 Add feature gate to `/api/retirement/simulate` — gate on `monteCarlo` (no usage limit)
    - _Requirements: 8.5, 8.8_
  - [x] 9.6 Add feature gate to NRI Return Planner routes — gate on `nriReturnPlanner` (no usage limit)
    - _Requirements: 8.6, 8.8_
  - [x] 9.7 Add feature gate to export routes — gate on `exportToPDF` (no usage limit)
    - _Requirements: 8.7, 8.8_

- [x] 10. Checkpoint — API layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Client Subscription Hook
  - [x] 11.1 Create `src/hooks/useSubscription.ts` — fetches `GET /api/billing/status` with 5-minute SWR-style cache
    - Returns `{ plan, subscription, canAccess(feature), getUsage(metric), isLoading, refresh }`
    - Falls back to free plan defaults on error
    - _Requirements: 11.4, 11.5_

- [x] 12. PaywallGate Component
  - [x] 12.1 Create `src/components/billing/PaywallGate.tsx` with props: `feature`, `requiredPlan?`, `children`, `fallback?`
    - If user has access: render children
    - If locked: render lock icon, feature name, plan requirement, "Upgrade to unlock" button → opens UpgradeModal
    - Uses `useSubscription()` hook
    - _Requirements: 11.1, 11.2, 11.3_
  - [ ]* 12.2 Write property test for PaywallGate conditional rendering (Property 14)
    - **Property 14: PaywallGate conditional rendering**
    - **Validates: Requirements 11.2, 11.3**
    - Test file: `tests/billing/paywallGate.property.test.ts`

- [x] 13. UsageIndicator Component
  - [x] 13.1 Create `src/components/billing/UsageIndicator.tsx` with props: `metric`, `current`, `limit`
    - If unlimited: render nothing
    - If limited: progress bar with "[current]/[limit] used this month"
    - >80%: orange color, at limit: red + "Upgrade for more →" link
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ]* 13.2 Write property test for UsageIndicator conditional rendering (Property 15)
    - **Property 15: UsageIndicator conditional rendering**
    - **Validates: Requirements 12.2, 12.3, 12.4**
    - Test file: `tests/billing/usageIndicator.property.test.ts`

- [x] 14. UpgradeModal Refactor
  - [x] 14.1 Refactor existing `UpgradeModal.tsx` to accept `feature?` and `requiredPlan?` props for contextual upgrade prompts
    - Add monthly/annual billing toggle with savings callout
    - Call `/api/payments/create-subscription` then open Razorpay checkout with `subscription_id`
    - Use `NEXT_PUBLIC_RAZORPAY_KEY_ID`, theme color `#FF9933`
    - On success: call `/api/payments/verify`, show toast, close modal, refresh page
    - Footer: "Secured by Razorpay. Cancel anytime." + payment methods note
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 15. Pricing Page
  - [x] 15.1 Create `src/app/pricing/page.tsx` — public page (no auth required, marketing layout)
    - Three-column card grid: Free, Pro, NRI Premium
    - Monthly/Annual toggle showing per-month equivalent + savings badge
    - Each card: plan name, badge, price, feature list with checkmark/cross and limits, CTA button
    - Dark theme: `#0D1120` bg, `#FF9933` orange accent, `#5BE6C4` green, `#E85D75` red
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7_
  - [x] 15.2 Add feature comparison table below cards with all 13 features as rows
    - _Requirements: 9.5_
  - [x] 15.3 Add FAQ accordion section with 4 questions (switching plans, cancellation, data safety, payment methods)
    - _Requirements: 9.6_
  - [x] 15.4 Implement CTA routing: Free → `/register`, Pro/NRI → opens UpgradeModal (or `/register` if not logged in)
    - _Requirements: 9.8_

- [x] 16. Billing Settings Page
  - [x] 16.1 Create billing section at `/settings/billing` or within existing settings page
    - Shows: current plan badge, status, next billing date, amount
    - Paid users: "Manage Subscription" and "Cancel Subscription" buttons
    - Free users: "Upgrade to unlock all features" with "View Plans" button
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  - [x] 16.2 Add usage section with `UsageIndicator` for each limited metric + reset date
    - _Requirements: 13.5_
  - [x] 16.3 Implement cancel flow: confirmation modal with "keep access until [date]" messaging
    - _Requirements: 13.6_

- [x] 17. Checkpoint — UI components complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Wire Paywalls into Existing UI
  - [x] 18.1 Wrap Monte Carlo section on retirement page in `PaywallGate feature="monteCarlo"`
    - _Requirements: 14.1_
  - [x] 18.2 Wrap AI Copilot agent cards in `PaywallGate feature="aiCopilot"`
    - _Requirements: 14.2_
  - [x] 18.3 Wrap Kite Connect card on investments page in `PaywallGate feature="zerodhaKiteSync"`
    - _Requirements: 14.3_
  - [x] 18.4 Wrap NRI Return Planner page content in `PaywallGate feature="nriReturnPlanner"`
    - _Requirements: 14.4_
  - [x] 18.5 Add `UsageIndicator metric="aiMessages"` to AI Advisor sidebar
    - _Requirements: 14.5_
  - [x] 18.6 Add `UsageIndicator metric="insuranceAnalyses"` above insurance upload area
    - _Requirements: 14.6_
  - [x] 18.7 Wrap Export PDF buttons on health score, insurance analysis, and retirement pages in `PaywallGate feature="exportToPDF"`
    - _Requirements: 14.7_

- [x] 19. Environment Variables & Documentation
  - [x] 19.1 Update `.env.example` with 4 Razorpay plan ID vars (`RAZORPAY_PLAN_PRO_MONTHLY`, `RAZORPAY_PLAN_PRO_ANNUAL`, `RAZORPAY_PLAN_NRI_MONTHLY`, `RAZORPAY_PLAN_NRI_ANNUAL`) + document existing Razorpay vars
    - Ensure all server-only secrets lack `NEXT_PUBLIC_` prefix
    - _Requirements: 15.1, 15.3, 15.4_
  - [x] 19.2 Create `docs/razorpay-setup.md` with step-by-step instructions: create 4 subscription plans in Razorpay dashboard, configure webhook events, add env vars to Vercel
    - _Requirements: 15.2_

- [x] 20. Final checkpoint — All tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- All API routes follow existing security pattern: `withErrorHandler(withAuth(withValidation(schema, handler)))`
- Checkpoints at tasks 4, 10, 17, and 20 ensure incremental validation
