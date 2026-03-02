# FamLedgerAI — Architecture Document
**Version**: 3.0  
**Date**: March 2, 2026  
**Architecture Style**: Monolithic SPA + Serverless API  
**Deployment**: Vercel (Edge + Serverless)  

---

## 1. Architecture Principles

| Principle | Implementation |
|-----------|---------------|
| Offline-First | localStorage as primary store, Supabase as sync target |
| Fail-Safe AI | 3 retries → fallback provider → mock response (never crashes) |
| Zero Build Frontend | Single HTML file, no transpilation, CDN imports |
| Security by Default | RLS on all tables, API keys server-side only, CORS locked |
| Progressive Enhancement | Core features work without AI/bank APIs |
| Cost Efficiency | Free tiers (Vercel, Supabase, AI models), pay only at scale |

## 2. System Architecture

```
                              ┌──────────────┐
                              │   Browser    │
                              │  (index.html)│
                              └──────┬───────┘
                                     │ HTTPS
                              ┌──────▼───────┐
                              │   Vercel     │
                              │   CDN/Edge   │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
             ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
             │  Static     │ │  Serverless │ │  Cron Jobs  │
             │  Assets     │ │  Function   │ │  (Vercel)   │
             │  index.html │ │  catchall.js│ │  aa/refresh │
             │  icons, sw  │ │  (Node 20)  │ │  daily 0:30 │
             └─────────────┘ └──────┬──────┘ └─────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
             ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
             │  lib/api/   │ │lib/services│ │  External  │
             │  aiRouter   │ │ 15 service │ │  APIs      │
             │  rateLimit  │ │ modules    │ │            │
             │  cache      │ │            │ │            │
             │  whatsapp   │ │            │ │            │
             └──────┬──────┘ └─────┬──────┘ └─────┬──────┘
                    │              │               │
         ┌─────────┼──────────────┼───────────────┼─────────┐
         │         │              │               │         │
    ┌────▼───┐ ┌───▼────┐ ┌──────▼──────┐ ┌─────▼───┐ ┌───▼────┐
    │Anthropic│ │OpenAI  │ │  Supabase   │ │  Plaid  │ │  Setu  │
    │Claude   │ │GPT-4o  │ │  Postgres   │ │  (US)   │ │  (IN)  │
    │Haiku    │ │mini    │ │  Auth       │ │         │ │        │
    └────────┘ └────────┘ │  Storage    │ └─────────┘ └────────┘
                          │  RLS        │
    ┌────────┐ ┌────────┐ └─────────────┘ ┌─────────┐ ┌────────┐
    │Gemini  │ │Twilio  │                 │Zerodha  │ │Alpha   │
    │Flash   │ │WhatsApp│                 │Kite     │ │Vantage │
    └────────┘ └────────┘                 └─────────┘ └────────┘
                                          ┌─────────┐ ┌────────┐
                                          │mfapi.in │ │Metals  │
                                          │MF NAVs  │ │API     │
                                          └─────────┘ └────────┘
                                          ┌─────────┐
                                          │Finnhub  │
                                          │News     │
                                          └─────────┘
```

## 3. Component Architecture

### 3.1 Frontend Layer
```
index.html (~13,000 lines)
├── <head>
│   ├── CDN imports (Supabase, Font Awesome, Chart.js, pdf.js)
│   ├── <style> — All CSS (landing, auth, sidebar, pages, responsive)
│   └── Meta tags + PWA manifest link
├── <body>
│   ├── Landing Page (visible before auth)
│   ├── Auth Forms (login + registration)
│   ├── Sidebar Navigation (PocketGuard-inspired)
│   ├── Page Containers (12 pages, one visible at a time)
│   └── Modals + Toasts
└── <script>
    ├── Supabase client initialization (sb)
    ├── State: userData object
    ├── Auth: login(), register(), logout()
    ├── Navigation: showPage(), showAuth(), goToAuth()
    ├── Data: loadUserData(), debounceSave()
    ├── Render: renderDashboard(), renderLoans(), renderInsurance(), ...
    ├── AI: loadAIDashboard(), getAdvice(), ...
    └── Utilities: formatCurrency(), showToast(), ...
```

### 3.2 API Layer
```
api/[...catchall].js
├── Imports (17 modules)
├── Supabase client (service role)
├── handler(req, res) — main entry
│   ├── URL parsing + query param merge
│   ├── CORS headers
│   ├── Route matching (40+ if statements)
│   └── 404 fallback
├── Helpers
│   ├── sanitizeForPrompt(val, maxLen)
│   ├── resolveUserId(userIdOrEmail)
│   └── safeQuery(query)
├── AI Handlers (7)
│   ├── handleAdvice, handleBudget, handleInvest
│   ├── handleNriPlan, handleAutopilot, handleFamily
│   └── handleInflationAnalyze
├── Document Parsers (3)
│   ├── handleLoanParseStatement
│   ├── handleLoanAdvisor
│   └── handleInsuranceParsePdf
├── Score Handlers (6)
│   ├── handleHealthScore, handleRiskScore, handleAlerts
│   ├── handleDebtOptimize, handleGamification
│   └── handleFinancialDashboard (unified)
├── Market Data (4)
│   ├── handleStocks, handleMutualFund
│   ├── handleGold, handleNews
├── Bank Connectivity — India (7)
│   └── handleAa* (consent, callback, fetch, refresh, status, session, data)
├── Bank Connectivity — US (8)
│   └── handlePlaid* (link, exchange, accounts, balances, txns, institution, disconnect, webhook)
├── Integrations (6)
│   ├── handleZerodha* (callback, holdings, mf-sips)
│   └── handleWhatsApp* (send, test, reminders)
└── Utility (2)
    ├── handleAccounts
    └── test-env (inline)
```

### 3.3 Service Layer
```
lib/services/ (15 modules)
├── Pure Computation (no external calls)
│   ├── healthScoreService.js    — computeHealthScore()
│   ├── riskScoreService.js      — computeRiskScore()
│   ├── alertService.js          — generateAlerts()
│   ├── debtOptimizationService.js — optimizeDebt()
│   ├── gamificationService.js   — evaluateBadges(), evaluateStreaks()
│   └── wealthDnaService.js      — classifyWealthDna(), getMotivation()
├── External API Wrappers
│   ├── stockService.js          — Alpha Vantage
│   ├── mutualFundService.js     — mfapi.in
│   ├── goldService.js           — Metals-API
│   └── newsService.js           — Finnhub
├── Bank Connectivity
│   ├── plaidService.js          — Plaid API (8 functions)
│   └── aaService.js             — Setu AA (5 functions)
├── Database Operations
│   └── insuranceService.js      — Supabase CRUD + hashing
└── Advanced (architecture ready)
    ├── financialModelingService.js — Monte Carlo (planned)
    └── historicalDataService.js    — Historical data (planned)
```

## 4. Data Architecture

### 4.1 Data Flow Patterns

```
Pattern 1: User Data (Offline-First)
  User Input → userData object (memory)
             → localStorage (immediate)
             → debounceSave() → Supabase user_data (2s delay)

Pattern 2: Computed Scores (Stateless)
  Frontend collects profile → POST /api/health-score
  → healthScoreService.computeHealthScore(profile)
  → JSON response (no DB write)

Pattern 3: AI Advisory (Stateless + Logging)
  Frontend sends context → POST /api/advice
  → Rate limit check → sanitizeForPrompt()
  → callAIWithFallback(prompt, module)
  → JSON response
  → Fire-and-forget: log to ai_advice_logs table

Pattern 4: Bank Sync (Server-Side State)
  Plaid Link UI → public_token → POST /api/plaid/exchange-token
  → Store access_token in plaid_items
  → Fetch accounts → Store in linked_accounts
  → Return accounts to frontend

Pattern 5: Market Data (Cached)
  GET /api/stocks?symbol=AAPL
  → Check in-memory cache (15-min TTL)
  → If miss: call Alpha Vantage → cache → return
  → If hit: return cached
```

### 4.2 Data Storage Strategy

| Data Type | Primary Store | Backup | Sync |
|-----------|--------------|--------|------|
| User profile, income, expenses | localStorage | Supabase user_data | Debounced 2s |
| Loans, investments, goals | localStorage | Supabase user_data | Debounced 2s |
| Insurance policies | Supabase insurance_policies | — | Real-time |
| Insurance claims | Supabase insurance_claims | — | Real-time |
| Linked bank accounts | Supabase linked_accounts | — | On refresh |
| Plaid tokens | Supabase plaid_items | — | On exchange |
| AA consents | Supabase aa_consents | — | On create/callback |
| Zerodha tokens | Supabase integrations | — | On callback |
| Market data | In-memory cache | — | 15-min TTL |
| AI advice logs | Supabase ai_advice_logs | — | Fire-and-forget |

## 5. Security Architecture

### 5.1 Authentication Flow
```
Registration:
  User fills form → supabase.auth.signUp({email, password})
  → Supabase creates auth.users row
  → Frontend creates user_data row with email
  → Redirect to dashboard

Login:
  User fills form → supabase.auth.signInWithPassword({email, password})
  → Supabase returns session (JWT)
  → Frontend loads user_data by email
  → Render dashboard

Session:
  Supabase JS client auto-refreshes JWT
  onAuthStateChange listener handles session changes
```

### 5.2 API Security
```
Layer 1: CORS
  Access-Control-Allow-Origin: famledgerai.com (or env override)

Layer 2: Rate Limiting
  AI endpoints: 5 requests/hour per userId
  Sliding window with in-memory Map

Layer 3: Input Validation
  Required fields checked (400 if missing)
  Type coercion for numeric fields
  Length limits on text inputs

Layer 4: Input Sanitization
  sanitizeForPrompt() strips:
  - Prompt injection patterns ("ignore previous instructions")
  - HTML tags
  - Truncates to maxLen

Layer 5: Supabase RLS
  All tables have Row Level Security enabled
  Service role key used server-side only
  Anon key used client-side (limited by RLS policies)
```

### 5.3 Sensitive Data Handling
```
Policy Numbers: SHA-256 hashed before storage
Plaid Tokens: Stored in plaid_items (server-side only, never sent to frontend)
Zerodha Tokens: Stored in integrations table
API Keys: Vercel environment variables only
Supabase Service Key: Server-side only (catchall.js)
Supabase Anon Key: Client-side (limited by RLS)
```

## 6. Deployment Architecture

```
Developer Machine
  │
  │ git push origin main
  │
  ▼
GitHub (main branch)
  │
  │ Webhook trigger
  │
  ▼
Vercel Build Pipeline
  ├── Detect: No build command needed (static + serverless)
  ├── Deploy: index.html → CDN edge nodes
  ├── Deploy: api/[...catchall].js → Serverless function (Node 20)
  ├── Deploy: lib/ → Bundled with serverless function
  ├── Deploy: public/ → Static assets
  └── Apply: vercel.json rewrites + headers + crons
  │
  │ ~2-3 minutes
  │
  ▼
Production (famledgerai.com)
  ├── CDN: index.html, icons, manifest, sw.js
  ├── Serverless: /api/* → [...catchall].js
  ├── Cron: /api/aa/refresh → daily at 00:30 UTC
  └── Environment: 20+ env vars from Vercel dashboard
```

### Vercel Configuration
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/[...catchall].js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "crons": [
    { "path": "/api/aa/refresh", "schedule": "30 0 * * *" }
  ]
}
```

## 7. Integration Architecture

### 7.1 AI Provider Integration
```
                    callAIWithFallback(prompt, module)
                              │
                    ┌─────────▼─────────┐
                    │ Primary Provider   │
                    │ (env AI_PROVIDER)  │
                    └─────────┬─────────┘
                              │ Retry 3x with backoff
                    ┌─────────▼─────────┐
                    │ Fallback Provider  │
                    │ (auto-detected)    │
                    └─────────┬─────────┘
                              │ If all fail
                    ┌─────────▼─────────┐
                    │ Mock Response      │
                    │ (getMockAdvice)    │
                    └───────────────────┘

Providers:
  Anthropic → Claude 3 Haiku (claude-3-haiku-20240307) — 4K max tokens
  OpenAI    → GPT-4o-mini — JSON mode enabled
  Gemini    → Gemini 1.5 Flash — JSON mode enabled
```

### 7.2 Bank Connectivity — India (Setu AA)
```
User → Create Consent → Setu redirects to bank → User approves
     → Consent Callback → Status: ACTIVE
     → Create Data Session → Fetch FI Data
     → Normalize ReBIT schema → Store in linked_accounts
     → Daily cron refresh (vercel.json)
```

### 7.3 Bank Connectivity — US (Plaid)
```
User → Create Link Token → Open Plaid Link UI → User selects bank
     → Public Token returned → Exchange for Access Token
     → Store in plaid_items → Fetch accounts/balances
     → Store in linked_accounts
     → Webhook for real-time transaction updates
```

### 7.4 Zerodha Integration
```
User → Redirect to Kite login (with state=email)
     → Kite callback with request_token
     → Exchange for access_token (SHA-256 checksum)
     → Store in integrations table
     → Fetch holdings (equity + MF) and SIPs
```

## 8. Performance Architecture

| Optimization | Implementation |
|-------------|----------------|
| CDN Caching | Static assets cached at Vercel edge |
| No-Cache HTML | Cache-Control: no-cache on index.html (always fresh) |
| In-Memory Cache | Market data cached 15 min per serverless invocation |
| Debounced Saves | User data saved to Supabase max once per 2 seconds |
| Lazy AI Calls | AI dashboard loaded on-demand, not on page load |
| Parallel Fetches | Financial dashboard computes all scores in one call |
| CDN Imports | Supabase, Chart.js, Font Awesome loaded from CDN |
| PWA | Service worker for offline access to cached pages |

## 9. Monitoring and Observability

| Area | Current | Planned |
|------|---------|---------|
| Error Logging | console.error in serverless | Sentry integration |
| API Monitoring | Vercel dashboard | Custom metrics dashboard |
| AI Usage | Token count logging | Cost tracking per module |
| Uptime | Vercel status page | UptimeRobot or similar |
| Performance | Manual testing | Vercel Analytics |

## 10. Future Architecture (React Migration)

```
Phase 1 (Current): Monolithic SPA
  index.html → Vercel CDN
  catchall.js → Vercel Serverless

Phase 2 (Planned): React + Vite
  src/
  ├── components/     # Reusable UI components
  ├── pages/          # Route-based pages
  ├── hooks/          # Custom React hooks
  ├── services/       # API client functions
  ├── store/          # State management (Zustand)
  └── utils/          # Shared utilities
  
  Benefits:
  - Code splitting (lazy load pages)
  - Type safety (TypeScript)
  - Component testing (Vitest + Testing Library)
  - Better developer experience
  
  Migration Strategy:
  - Keep same API layer (no backend changes)
  - Migrate page by page
  - Feature flag to switch between old/new
```
