# FamLedgerAI — Low Level Design (LLD)
**Version**: 3.0  
**Date**: March 2, 2026  

---

## 1. File Structure

```
famledgerai/
├── index.html                    # Single-page app (all frontend code)
├── api/
│   └── [...catchall].js          # All API routes (Vercel serverless)
├── lib/
│   ├── api/
│   │   ├── aiRouter.js           # Multi-AI provider with fallback
│   │   ├── apiResponse.js        # Standardized response helpers
│   │   ├── cache.js              # In-memory cache with TTL
│   │   ├── deterministic.js      # Financial projection engine
│   │   ├── encryption.js         # AES encryption utilities
│   │   ├── rateLimit.js          # Request rate limiter with cleanup
│   │   ├── supabase.js           # Supabase client factory
│   │   └── whatsapp.js           # Twilio WhatsApp integration
│   └── services/
│       ├── aaService.js           # Setu Account Aggregator (India)
│       ├── alertService.js        # Smart alert generation engine
│       ├── debtOptimizationService.js  # Snowball/Avalanche/Hybrid
│       ├── financialModelingService.js # Monte Carlo simulation
│       ├── gamificationService.js      # Badges, streaks, milestones
│       ├── goldService.js              # Metals-API gold prices
│       ├── healthScoreService.js       # Financial health 0-100
│       ├── historicalDataService.js    # Historical financial data
│       ├── insuranceService.js         # Policy CRUD + hashing
│       ├── mutualFundService.js        # mfapi.in NAV data
│       ├── newsService.js              # Finnhub financial news
│       ├── plaidService.js             # Plaid US bank connectivity
│       ├── riskScoreService.js         # Risk scoring 0-100
│       ├── stockService.js             # Alpha Vantage stock quotes
│       └── wealthDnaService.js         # Wealth DNA + motivation
├── public/                        # Static assets (icons, PWA)
├── docs/                          # Documentation
├── test-all-services.js           # Comprehensive test suite
├── package.json
├── vercel.json                    # Deployment + routing config
└── manifest.json                  # PWA manifest
```

## 2. API Route Map

All routes handled by `api/[...catchall].js`. Path matching via string comparison.

### AI Advisory Routes (POST)
| Route | Handler | Auth | Rate Limit |
|-------|---------|------|------------|
| `/api/advice` | handleAdvice | userId header | 5/hour |
| `/api/budget/coach` | handleBudget | userId in body | — |
| `/api/invest/recommend` | handleInvest | userId in body | — |
| `/api/nri/plan` | handleNriPlan | — | — |
| `/api/autopilot/plan` | handleAutopilot | userId in body | — |
| `/api/family/insights` | handleFamily | userId in body | — |
| `/api/inflation/analyze` | handleInflationAnalyze | — | — |

### Document Parsing Routes (POST)
| Route | Handler | Input |
|-------|---------|-------|
| `/api/loans/parse-statement` | handleLoanParseStatement | pdfText (string) |
| `/api/loans/advisor` | handleLoanAdvisor | loans array + financials |
| `/api/insurance/parse-pdf` | handleInsuranceParsePdf | pdfText (string) |

### Financial Score Routes (POST)
| Route | Handler | Input |
|-------|---------|-------|
| `/api/health-score` | handleHealthScore | profile object |
| `/api/risk-score` | handleRiskScore | profile object |
| `/api/alerts` | handleAlerts | profile object |
| `/api/debt-optimize` | handleDebtOptimize | loans + extra_monthly_budget |
| `/api/gamification` | handleGamification | profile + scores + streaks |
| `/api/financial-dashboard` | handleFinancialDashboard | full profile (unified) |

### Market Data Routes (GET)
| Route | Handler | Params |
|-------|---------|--------|
| `/api/stocks` | handleStocks | symbol or symbols (comma-sep) |
| `/api/mutualfund` | handleMutualFund | code or codes (comma-sep) |
| `/api/gold` | handleGold | grams (optional) |
| `/api/news` | handleNews | category, limit, symbol |

### Bank Connectivity — India (POST)
| Route | Handler |
|-------|---------|
| `/api/aa/create-consent` | handleAaCreateConsent |
| `/api/aa/consent-callback` | handleAaConsentCallback (GET) |
| `/api/aa/fetch-accounts` | handleAaFetchAccounts |
| `/api/aa/refresh` | handleAaRefresh |
| `/api/aa/consent-status` | handleAaConsentStatus |
| `/api/aa/create-session` | handleAaCreateSession |
| `/api/aa/fetch-data` | handleAaFetchData |

### Bank Connectivity — US (POST)
| Route | Handler |
|-------|---------|
| `/api/plaid/create-link-token` | handlePlaidCreateLinkToken |
| `/api/plaid/exchange-token` | handlePlaidExchangeToken |
| `/api/plaid/accounts` | handlePlaidAccounts |
| `/api/plaid/balances` | handlePlaidBalances |
| `/api/plaid/transactions` | handlePlaidTransactions |
| `/api/plaid/institution` | handlePlaidInstitution |
| `/api/plaid/disconnect` | handlePlaidDisconnect |
| `/api/plaid/webhook` | handlePlaidWebhook |

### Integrations
| Route | Handler | Method |
|-------|---------|--------|
| `/api/integrations/zerodha/callback` | handleZerodhaCallback | GET |
| `/api/integrations/zerodha/holdings` | handleZerodhaHoldings | GET |
| `/api/integrations/zerodha/mf-sips` | handleZerodhaMfSips | GET |
| `/api/whatsapp/send` | handleWhatsAppSend | POST |
| `/api/whatsapp/test` | handleWhatsAppTest | POST |
| `/api/whatsapp/reminders` | handleWhatsAppReminders | POST |
| `/api/accounts` | handleAccounts | GET |
| `/api/test-env` | inline | GET |

## 3. Database Schema (Supabase)

### Core Tables
```sql
-- User data (main storage — JSON columns for flexibility)
user_data (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  profile JSONB,        -- {name, age, occupation, risk, goals[], whatsapp_number}
  income JSONB,         -- {husband, wife, rental, rentalActive}
  expenses JSONB,       -- {monthly: [{label, v}]}
  loans JSONB[],        -- [{label, emi, outstanding, rate, ...}]
  investments JSONB,    -- {mutualFunds[], stocks[], fd[], ppf[]}
  insurance JSONB,      -- {term[], health[], vehicle[]}
  schemes JSONB,        -- {pmjjby, pmsby, apy, sukanya}
  goals JSONB[],        -- [{name, target, current, deadline}]
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Insurance (structured storage)
insurance_policies (
  id UUID PRIMARY KEY,
  user_id TEXT,
  insurer TEXT,
  plan_name TEXT,
  policy_type TEXT,           -- term, health, vehicle
  status TEXT,                -- active, lapsed, expired
  policy_number_hash TEXT,    -- SHA-256 hashed
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  premium_amount NUMERIC,
  premium_frequency TEXT,
  sum_insured NUMERIC,
  deductible NUMERIC,
  members JSONB,
  waiting_periods JSONB,
  exclusions JSONB,
  utilization JSONB,
  documents JSONB,
  UNIQUE(user_id, policy_number_hash)
)

insurance_claims (
  id UUID PRIMARY KEY,
  user_id TEXT,
  policy_id UUID REFERENCES insurance_policies(id),
  claim_id TEXT,
  member_name TEXT,
  hospital_name TEXT,
  cashless BOOLEAN,
  admission_date DATE,
  discharge_date DATE,
  status TEXT,
  amount_claimed NUMERIC,
  amount_paid NUMERIC
)

-- Bank connectivity
linked_accounts (
  id UUID PRIMARY KEY,
  user_id TEXT,
  source TEXT,              -- 'plaid' or 'setu_aa'
  account_ref TEXT,
  account_data JSONB,
  balance NUMERIC,
  currency TEXT DEFAULT 'INR',
  institution_name TEXT,
  last_refreshed TIMESTAMPTZ,
  UNIQUE(user_id, source, account_ref)
)

aa_consents (
  id UUID PRIMARY KEY,
  user_id TEXT,
  consent_id TEXT UNIQUE,
  status TEXT,
  consent_detail JSONB,
  consent_artefact JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

plaid_items (
  id UUID PRIMARY KEY,
  user_id TEXT,
  item_id TEXT UNIQUE,
  access_token TEXT,
  institution_id TEXT,
  institution_name TEXT,
  status TEXT DEFAULT 'ACTIVE',
  error JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

plaid_webhooks (
  id UUID PRIMARY KEY,
  item_id TEXT,
  webhook_type TEXT,
  webhook_code TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ
)

-- Integrations
integrations (
  id UUID PRIMARY KEY,
  user_id TEXT,
  provider TEXT,            -- 'zerodha'
  access_token TEXT,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, provider)
)
```

All tables have Row Level Security (RLS) enabled.

## 4. Service Module Specifications

### 4.1 Health Score Engine (`healthScoreService.js`)
```
Input:  { income, expenses, total_emi, total_debt_outstanding,
          liquid_assets, total_assets, term_cover, health_cover,
          dependents, sip_monthly, credit_utilization, age }

Output: { financial_health_score: 0-100, grade, color,
          sub_scores: {cashflow, emi_load, emergency, debt,
                       insurance, credit, investment},
          derived_metrics: {savings_rate, emi_ratio, months_cover, debt_to_assets} }

Algorithm:
  7 sub-scores with weighted aggregation
  Weights: cashflow(0.20) + emi(0.20) + emergency(0.15) + debt(0.15)
           + insurance(0.15) + credit(0.10) + investment(0.05) = 1.00
  Grade: >=80 Excellent | >=60 Good | >=40 Fair | >=20 Poor | <20 Critical
```

### 4.2 Risk Score Engine (`riskScoreService.js`)
```
Input:  Same as health score + equity_allocation_pct, income_sources, job_stability

Output: { risk_score: 0-100, risk_category, color,
          risk_dimensions: {emi_risk, liquidity_risk, cashflow_risk,
                            debt_risk, insurance_risk, volatility},
          stress_test: {job_loss_survival_months, rate_hike_impact, recession_risk} }

Algorithm:
  6 risk dimensions with weighted aggregation
  Weights: emi(0.25) + liquidity(0.20) + cashflow(0.20) + debt(0.15)
           + insurance(0.10) + volatility(0.10) = 1.00
  Categories: 0-25 Stable | 26-50 Watchlist | 51-75 High | 76-100 Critical
```

### 4.3 Debt Optimization Engine (`debtOptimizationService.js`)
```
Input:  loans[{label, outstanding, emi, rate, remainingMonths}], extraMonthlyBudget

Output: { best_strategy, comparison[3], optimal_extra_emi,
          total_outstanding, total_monthly_emi }

Algorithm:
  Simulates 3 strategies:
  - Avalanche: highest interest rate first
  - Snowball: smallest balance first
  - Hybrid: weighted score (rate × 0.6 + inverse_balance × 0.4)
  Each runs month-by-month simulation with extra payment allocation
  Best = lowest total interest paid
```

### 4.4 AI Router (`aiRouter.js`)
```
Flow:
  1. Try primary provider (env AI_PROVIDER, default: anthropic)
  2. Retry up to 2 times with exponential backoff (1s, 2s)
  3. If all retries fail, try fallback provider (OpenAI or Anthropic)
  4. If fallback fails, return mock advice for the module

Providers:
  - Anthropic: Claude 3 Haiku (claude-3-haiku-20240307)
  - OpenAI: GPT-4o-mini (with JSON mode)
  - Gemini: Gemini 1.5 Flash (with JSON mode)

JSON Extraction:
  1. Direct JSON.parse
  2. Strip ```json fences
  3. Find outermost { ... } block
  4. Find outermost [ ... ] block
  5. Throw if none found
```

### 4.5 Rate Limiter (`rateLimit.js`)
```
Type: In-memory sliding window
Storage: Map<string, number[]> (key → timestamps)
Cleanup: Every 5 minutes, purge entries older than 1 hour
Methods:
  - isAllowed(key, maxRequests, windowMs) → boolean
  - getRetryAfter(key, windowMs) → seconds
  - clear(key) → void
```

## 5. Frontend Architecture (index.html)

### Page Navigation
```
showPage(pageId) → hides all .page elements, shows target
Pages: dashboard, income, expenses, loans, investments,
       insurance, schemes, goals, settings, ai-dashboard,
       nri-plan, inflation, accounts
```

### State Management
```
userData = {
  profile: {}, income: {}, expenses: {},
  loans: [], investments: {}, insurance: {},
  schemes: {}, goals: [], children: [], parents: []
}

Flow: User edits → update userData → render*() → debounceSave()
debounceSave: 2-second debounce → Supabase upsert user_data
```

### Key Frontend Functions
| Function | Purpose |
|----------|---------|
| `initApp()` | Auth check, load data, render all |
| `debounceSave()` | Debounced save to Supabase |
| `renderDashboard()` | Main dashboard with KPIs |
| `renderLoans()` | Loan table with dropdown actions |
| `renderInsurance()` | Insurance policy cards |
| `renderInvestments()` | Portfolio breakdown |
| `loadAIDashboard()` | Fetch /api/financial-dashboard |
| `showPage(id)` | SPA page navigation |

## 6. Error Handling Strategy

```
API Layer:
  - All handlers wrapped in try/catch
  - Consistent error response: { error: string, detail?: string }
  - HTTP status codes: 400 (bad input), 401 (unauth), 404 (not found),
    405 (wrong method), 429 (rate limited), 500 (server error)

AI Layer:
  - 3 retries with backoff → fallback provider → mock response
  - Never returns 500 for AI failures (always has mock fallback)

Frontend:
  - try/catch on all fetch calls
  - Toast notifications for errors
  - Graceful degradation (show cached data if API fails)
```

## 7. Environment Variables

| Variable | Required | Used By |
|----------|----------|---------|
| SUPABASE_URL | Yes | All API handlers |
| SUPABASE_SERVICE_ROLE_KEY | Yes | All API handlers |
| ANTHROPIC_API_KEY | Yes* | AI Router |
| OPENAI_API_KEY | No | AI Router (fallback) |
| GEMINI_API_KEY | No | AI Router (fallback) |
| ALPHA_VANTAGE_API_KEY | No | Stock service |
| METALS_API_KEY | No | Gold service |
| FINNHUB_API_KEY | No | News service |
| TWILIO_ACCOUNT_SID | No | WhatsApp service |
| TWILIO_AUTH_TOKEN | No | WhatsApp service |
| KITE_API_KEY | No | Zerodha integration |
| KITE_API_SECRET | No | Zerodha integration |
| PLAID_CLIENT_ID | No | Plaid service |
| PLAID_SECRET | No | Plaid service |
| PLAID_ENV | No | Plaid service (default: sandbox) |
| SETU_CLIENT_ID | No | AA service |
| SETU_CLIENT_SECRET | No | AA service |
| SETU_PRODUCT_ID | No | AA service |
| ALLOWED_ORIGIN | No | CORS (default: famledgerai.com) |

*At least one AI provider key required for AI features.
