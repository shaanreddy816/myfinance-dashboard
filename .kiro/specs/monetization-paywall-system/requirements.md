# Monetization & Paywall System — Requirements

## Overview
Complete monetization system for FamLedgerAI with 3 subscription tiers (Free, Pro, NRI Premium) using Razorpay subscriptions. Stores subscription state in `user_profiles.preferences` JSONB — no schema changes. Gates existing features behind plan checks with HTTP 402 responses. Includes pricing page, upgrade modal, paywall interceptor, usage tracking, and billing settings.

## Requirements

### REQUIREMENT-1: Plan Configuration
**User Story:** As a developer, I need a centralized plan configuration so all billing logic references a single source of truth for plan features, limits, and pricing.
**Acceptance Criteria:**
- `lib/billing/plans.ts` exports `PLANS` record with `free`, `pro`, `nri_premium` entries
- Each plan defines: `id`, `name`, `description`, `monthlyPrice`, `annualPrice`, `annualMonthlyEquivalent`, `annualSavingPercent`, `features` (13 boolean flags), `limits` (3 metrics), `razorpayPlanIds` (monthly/annual), optional `badge`, `color`
- `getPlan(planId)` returns the plan config
- `canAccessFeature(planId, feature)` returns boolean
- `getLimit(planId, limit)` returns `number | 'unlimited'`
- Free plan: AI Advisor 5/month, Insurance PDF 1/month, AI Copilot 0, Monte Carlo locked, Kite locked, NRI locked, Export locked
- Pro plan: ₹299/month or ₹2,499/year (30% save), AI Advisor unlimited, Copilot 30/month, Insurance unlimited, Kite/Monte Carlo/Export unlocked, NRI locked
- NRI Premium: ₹499/month or ₹3,999/year (33% save), everything unlimited including NRI Return Planner, multi-currency, priority support


### REQUIREMENT-2: Subscription State Management
**User Story:** As a system, I need to persist subscription state in `user_profiles.preferences` JSONB so no database schema changes are needed.
**Acceptance Criteria:**
- `UserSubscription` type with: `plan_id`, `status` (active/cancelled/past_due/expired/trial), `billing_cycle`, `current_period_start`, `current_period_end`, `razorpay_subscription_id`, `razorpay_customer_id`, `cancelled_at`, `usage` (3 counters + reset date)
- `getDefaultSubscription()` returns free plan with active status
- `getUserSubscription(userId, supabase)` reads from `preferences.subscription`, returns default if missing
- Auto-resets usage counters on first of each month
- `saveUserSubscription(userId, subscription, supabase)` merges into existing preferences without overwriting other fields
- `incrementUsage(userId, metric, supabase)` atomically increments a usage counter
- `isSubscriptionActive(sub)` returns true for free plan always, checks `status === 'active'` and `current_period_end > now` for paid plans
- `getEffectivePlan(sub)` returns `'free'` if subscription inactive, otherwise returns `plan_id`

### REQUIREMENT-3: Feature Gate Middleware
**User Story:** As a developer, I need a single `checkFeatureAccess()` function to gate any API route by plan + usage limits.
**Acceptance Criteria:**
- `checkFeatureAccess(userId, feature, usageMetric, supabase)` returns `GateResult` with `allowed`, `reason` (locked/limit_reached/subscription_expired), `currentUsage`, `limit`, `upgradeRequired`, `message`
- If feature is not available on user's plan: `allowed: false`, `reason: 'locked'`, `upgradeRequired` points to minimum required plan
- If feature is available but usage limit reached: `allowed: false`, `reason: 'limit_reached'`, includes `currentUsage` and `limit`
- If feature is available and within limits: `allowed: true`
- Upgrade messages are human-readable and feature-specific
- NRI-only features require `nri_premium`, all other locked features require `pro`

### REQUIREMENT-4: Razorpay Subscription Creation
**User Story:** As a user, I can start a paid subscription by selecting a plan and billing cycle, which creates a Razorpay subscription.
**Acceptance Criteria:**
- `POST /api/payments/create-subscription` accepts `{ planId, billingCycle }` with auth check
- Validates planId is `'pro'` or `'nri_premium'`, billingCycle is `'monthly'` or `'annual'`
- Creates or reuses Razorpay customer (stores `razorpay_customer_id` in subscription)
- Creates Razorpay subscription with correct plan ID from env vars
- Returns `{ subscriptionId, customerId, razorpayKeyId, amount, currency, planName, billingCycle }`
- Amount is in paise (multiply by 100)
- Uses `withAuth` and `withErrorHandler` from existing security utilities

### REQUIREMENT-5: Webhook Subscription Event Handling
**User Story:** As a system, I need to process Razorpay subscription lifecycle events to keep user subscription state in sync.
**Acceptance Criteria:**
- Existing webhook route at `/api/payments/webhook` handles these additional events:
  - `subscription.activated`: Set plan active, store plan_id from notes, set period end from `next_billing_at`
  - `subscription.charged`: Extend `current_period_end` by billing cycle, status = active
  - `subscription.cancelled`: Set status = cancelled, set `cancelled_at`, keep plan active until period end
  - `subscription.completed`: Set status = expired, downgrade to free after period end
  - `subscription.halted`: Set status = past_due
- User ID extracted from `subscription.notes.user_id`
- Webhook signature verification (already implemented in Task 11) remains intact
- No user data exposed in webhook logs

### REQUIREMENT-6: Subscription Cancellation
**User Story:** As a user, I can cancel my subscription and retain access until the current billing period ends.
**Acceptance Criteria:**
- `POST /api/payments/cancel-subscription` with auth check
- Returns 404 if no active paid subscription
- Calls `razorpay.subscriptions.cancel(id, { cancel_at_cycle_end: true })` — access preserved until period end
- Updates subscription: status = cancelled, cancelled_at = now
- Returns `{ message, accessUntil }` with the period end date

### REQUIREMENT-7: Billing Status API
**User Story:** As a client, I need to fetch current subscription status, plan details, and usage for UI rendering.
**Acceptance Criteria:**
- `GET /api/billing/status` with auth check
- Returns `{ subscription, plan (without razorpayPlanIds), daysRemaining, usagePercents }` where usagePercents has `aiMessages`, `insuranceAnalyses`, `copilotRuns` (null if unlimited, 0-100 percent if limited)

### REQUIREMENT-8: Feature Gates on Existing API Routes
**User Story:** As a system, I need to enforce plan-based access on all gated features, returning HTTP 402 with upgrade info when blocked.
**Acceptance Criteria:**
- `/api/ai/chat` gated on `aiAdvisor` + `ai_messages_this_month`, increments usage after success
- `/api/copilot/run-agent` gated on `aiCopilot` + `ai_copilot_runs_this_month`
- `/api/insurance/analyze-policy` and `/api/insurance/analyze` gated on `insurancePDFAnalysis` + `insurance_analyses_this_month`
- `/api/kite/connect` and `/api/kite/sync` gated on `zerodhaKiteSync` (no usage limit)
- `/api/retirement/simulate` gated on `monteCarlo` (no usage limit)
- NRI Return Planner routes gated on `nriReturnPlanner` (no usage limit)
- Export routes gated on `exportToPDF` (no usage limit)
- All blocked responses return HTTP 402 with `{ error, code: 'RATE_LIMITED', upgradeRequired, currentUsage, limit }`
- Gates run AFTER auth check, BEFORE expensive operations

### REQUIREMENT-9: Pricing Page
**User Story:** As a visitor (no auth required), I can view all subscription plans with features, pricing, and comparison to make an informed purchase decision.
**Acceptance Criteria:**
- Public page at `/pricing` (no auth required, marketing layout)
- Three-column card grid showing Free, Pro, NRI Premium
- Monthly/Annual toggle at top — annual shows per-month equivalent with savings callout
- Each card: plan name, badge, price, feature list with checkmark/cross and limits, CTA button
- Feature comparison table below cards with all 13 features as rows
- FAQ section with 4 questions (switching plans, cancellation, data safety, payment methods)
- CTA: Free → `/register`, Pro/NRI → opens upgrade modal (or `/register` if not logged in)
- Dark theme: `#0D1120` bg, `#FF9933` orange accent, `#5BE6C4` green, `#E85D75` red

### REQUIREMENT-10: Upgrade Modal
**User Story:** As a logged-in user, I can upgrade my plan through a modal that shows plan details and opens Razorpay checkout.
**Acceptance Criteria:**
- `UpgradeModal` component with props: `isOpen`, `onClose`, `feature?`, `requiredPlan?`
- Shows plan card with price, billing toggle (monthly/annual), feature highlights, savings callout
- Payment button calls `/api/payments/create-subscription`, then opens Razorpay checkout with `subscription_id`
- Razorpay checkout uses `NEXT_PUBLIC_RAZORPAY_KEY_ID`, theme color `#FF9933`
- On success: calls `/api/payments/verify`, shows toast, closes modal, refreshes page
- Bottom text: "Secured by Razorpay. Cancel anytime." + payment methods note

### REQUIREMENT-11: Paywall Gate Component
**User Story:** As a developer, I can wrap any feature component with `<PaywallGate>` to show a locked state with upgrade prompt when the user lacks access.
**Acceptance Criteria:**
- `PaywallGate` component with props: `feature`, `requiredPlan?`, `children`, `fallback?`
- If user has access: renders children normally
- If locked: renders lock icon, feature name, plan requirement, "Upgrade to unlock" button → opens UpgradeModal
- Uses `useSubscription()` hook that fetches from `/api/billing/status` with 5-minute cache
- `useSubscription()` returns `{ plan, subscription, canAccess(feature), getLimit(metric), isLoading }`

### REQUIREMENT-12: Usage Indicator Component
**User Story:** As a free/limited user, I can see my current usage against limits so I know when I'm approaching the cap.
**Acceptance Criteria:**
- `UsageIndicator` component with props: `metric`, `current`, `limit`
- If unlimited: renders nothing
- If limited: shows progress bar with "[current]/[limit] used this month"
- >80% used: orange color, at limit: red + "Upgrade for more →" link
- Shown in: AI Advisor sidebar, insurance upload area, AI Copilot page

### REQUIREMENT-13: Billing Settings Page
**User Story:** As a user, I can view my current plan, usage, and manage my subscription from settings.
**Acceptance Criteria:**
- Billing section in settings (at `/settings/billing` or within existing settings page)
- Shows: current plan badge, status, next billing date, amount
- Paid users: "Manage Subscription" and "Cancel Subscription" buttons
- Free users: "Upgrade to unlock all features" with "View Plans" button
- Usage section with `UsageIndicator` for each limited metric + reset date
- Cancel flow: confirmation modal with "keep access until [date]" messaging

### REQUIREMENT-14: Wire Paywalls into Existing UI
**User Story:** As a user, I see appropriate paywall gates on premium features throughout the app.
**Acceptance Criteria:**
- Retirement page: Monte Carlo section wrapped in `PaywallGate feature="monteCarlo"`
- AI Copilot page: agent cards wrapped in `PaywallGate feature="aiCopilot"`
- Investments page: Kite Connect card wrapped in `PaywallGate feature="zerodhaKiteSync"`
- NRI Return Planner page: entire content wrapped in `PaywallGate feature="nriReturnPlanner"`
- AI Advisor sidebar: `UsageIndicator metric="aiMessages"` shown
- Insurance upload: `UsageIndicator metric="insuranceAnalyses"` shown above upload area
- Export PDF buttons on health score, insurance analysis, retirement pages wrapped in `PaywallGate feature="exportToPDF"`

### REQUIREMENT-15: Environment Variables & Documentation
**User Story:** As a developer, I have clear documentation for Razorpay dashboard setup and all required env vars.
**Acceptance Criteria:**
- `.env.example` updated with 4 Razorpay plan ID vars + existing Razorpay vars documented
- `docs/razorpay-setup.md` with step-by-step instructions: create 4 subscription plans, configure webhook events, add env vars to Vercel
- All server-only secrets lack `NEXT_PUBLIC_` prefix
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the only client-exposed Razorpay var