# AI Financial Operating System — Master Specification
**FamLedgerAI v3.0**  
**Date**: March 2, 2026  
**Status**: Implementation Plan  
**Mission**: Transform into a predictive, emotionally intelligent, gamified, subscription-ready AI wealth engine

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FamLedgerAI v3.0                          │
│              AI Financial Operating System                   │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND (ReactJS — future migration from index.html)      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Dashboard │ │Scores &  │ │Gamifi-   │ │Settings &│       │
│  │& KPIs    │ │Analytics │ │cation    │ │Profiles  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  API LAYER (Vercel Serverless — /api/[...catchall].js)      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Health    │ │Risk      │ │Debt      │ │Monte     │       │
│  │Score API │ │Score API │ │Engine API│ │Carlo API │       │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤       │
│  │Tax Opt   │ │Refi Scan │ │Invest    │ │Gamify    │       │
│  │API       │ │API       │ │Rec API   │ │API       │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  BACKEND (Supabase)                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Users &   │ │Financial │ │Scores &  │ │Gamifi-   │       │
│  │Profiles  │ │Data      │ │History   │ │cation    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  EXTERNAL DATA (Live Feeds — Optional)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Alpha     │ │mfapi.in  │ │Metals-API│ │Finnhub   │       │
│  │Vantage   │ │MF NAVs   │ │Gold      │ │News      │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 20 Core Components

### TIER 1 — Foundation (Phase 1: Weeks 1-3)

#### 1. Financial Health Score (0–100)
```
Sub-scores (weighted):
  CashflowScore   = clamp((savings_rate / 0.20) * 100, 0, 100)     × 0.20
  EMIScore         = clamp(((0.40 - emi_ratio) / 0.40) * 100, 0, 100) × 0.20
  EmergencyScore   = clamp((months_cover / 6) * 100, 0, 100)       × 0.15
  DebtScore        = clamp((1 - debt_to_assets) * 100, 0, 100)     × 0.15
  InsuranceScore   = adequacy weighted model                         × 0.15
  CreditScore      = clamp(((0.30 - credit_util) / 0.30) * 100, 0, 100) × 0.10
  InvestmentScore  = clamp((sip_monthly / (0.15 * income)) * 100, 0, 100) × 0.05
```
**API**: `POST /api/health-score`  
**Priority**: P0

#### 2. Risk Scoring Engine (1–100)
```
RiskScore =
  0.25 × EMIRisk +
  0.20 × LiquidityRisk +
  0.20 × CashflowRisk +
  0.15 × DebtRisk +
  0.10 × InsuranceRisk +
  0.10 × VolatilityAdjustment

Categories: 0–25 Stable | 26–50 Watchlist | 51–75 High | 76–100 Critical
```
**API**: `POST /api/risk-score`  
**Priority**: P0

#### 4. Smart EMI + Alert System
```
Detects: EMIs next 7/30 days, low balance risk, overspending trend,
         insurance gap, rising debt ratio, savings drop
Returns: alerts[] with severity (info/warning/critical)
```
**API**: `POST /api/alerts`  
**Priority**: P0

#### 15. Behavioral Finance + Motivation Engine
```
Returns: motivational_message, short_quote, progress_highlight
Rules: 1-2 line, empowering, discipline-focused, no unrealistic promises
```
**Priority**: P0 (integrated into all responses)


### TIER 2 — Core Intelligence (Phase 2: Weeks 4-6)

#### 3. Debt Optimization Engine
```
Generates: Amortization schedule, Snowball vs Avalanche vs Hybrid comparison,
           Interest saved estimate, Debt-free year, Optimal extra EMI suggestion
```
**API**: `POST /api/debt-optimize`  
**Priority**: P1

#### 5. 20-Year Monte Carlo Forecast
```
10,000 simulations using:
  Equity: mean 11%, stdev 18%
  Debt: mean 7%
  Gold: mean 8%
  Inflation: 6%, Medical inflation: 10%
Returns: P5, P50, P95, retirement readiness score, financial freedom year
```
**API**: `POST /api/forecast`  
**Priority**: P1

#### 6. Insurance Intelligence
```
Term rule: 10–20× annual income
Health rule: Base 10L + 2L per dependent
Returns: gap analysis + exposure risk
```
**API**: `POST /api/insurance-analysis`  
**Priority**: P1

#### 12. Wealth DNA Profiling
```
Profiles: Conservative Stabilizer | Balanced Builder | Aggressive Accelerator |
          Debt-Focused Rebuilder | Pre-Retirement Optimizer
Strategy adapts to profile classification
```
**Priority**: P1 (integrated into health score)

#### 10. Life-Stage Adaptive Planning
```
20–30: Foundation focus
30–45: Growth + protection
45–60: Retirement acceleration
60+:   Preservation
```
**Priority**: P1 (integrated into recommendations)

### TIER 3 — Advanced Features (Phase 3: Weeks 7-10)

#### 9. Gamification Engine
```
Streaks: Debt reduction, EMI on-time, Savings growth, Net worth growth, Emergency fund
Badges: Debt Destroyer, Emergency Fund Champion, Investment Builder, Risk Reducer, Freedom Tracker
```
**API**: `POST /api/gamification`  
**Supabase tables**: user_badges, user_streaks, user_milestones  
**Priority**: P2

#### 8. AI Personality Modes
```
Modes: Balanced Advisor | Strict Wealth Builder | Aggressive Growth Strategist
Tone adapts recommendations + motivational_message
```
**Priority**: P2

#### 11. AI Autopilot Mode
```
Monthly recalculation: Auto-adjust SIP, debt prepayment, rebalancing,
risk reduction. Generates monthly "Autopilot Plan"
```
**API**: `POST /api/autopilot-plan`  
**Priority**: P2

#### 13. Family Collaboration Mode
```
Multi-user: Merge net worth, detect spending conflicts,
joint roadmap, role-based actions
```
**Priority**: P2

### TIER 4 — Premium Features (Phase 4: Weeks 11-14)

#### 17. AI Tax Optimization Layer
```
Educational, non-legal. Supports India (old/new regime) + US.
Identifies deduction gaps, tax-loss harvesting candidates,
deadline reminders. Returns Tax Optimization Score (0–100)
```
**API**: `POST /api/tax-optimize`  
**Priority**: P3

#### 18. AI Loan Refinancing Scanner
```
Scans loans for refinance opportunities.
Calculates: EMI reduction, tenure reduction, break-even months,
total interest saved. Returns Refinance Opportunity Score (0–100)
```
**API**: `POST /api/refinance-scan`  
**Priority**: P3

#### 19. AI Investment Recommendation Engine
```
Live-data-aware, risk-aligned, goal-based recommendations.
Target allocation, SIP split, rebalancing triggers,
drawdown response. Returns Portfolio Fit Score (0–100)
```
**API**: `POST /api/invest-recommend`  
**Priority**: P3

#### 7. NRI Return Model
```
Adjusts: income drop, cost index, FX volatility, runway months
Returns: ReturnReadinessScore
```
**API**: `POST /api/nri-model`  
**Priority**: P3

#### 14. Subscription Gating
```
Free:         Basic score, alerts, motivation
Intermediate: Risk scoring, debt comparison, insurance gap
Pro:          Monte Carlo, stress test, NRI, autopilot, tax, refinance, live-data
```
**Priority**: P3

#### 20. Live Data Integration Contract
```json
{
  "live_data": {
    "market": {},
    "rates": {},
    "inflation": {},
    "gold": {},
    "funds": {}
  }
}
```
**Priority**: P3 (already partially built — stock, MF, gold, news APIs exist)

---

## Strict Output Format (All API Responses)

```json
{
  "financial_health_score": 0,
  "risk_score": 0,
  "risk_category": "",
  "wealth_dna_profile": "",
  "personality_mode": "",
  "live_data_status": "available|missing|partial",
  "alerts": [],
  "badges_unlocked": [],
  "streaks": {},
  "debt_strategy": {},
  "investment_projection": {},
  "insurance_analysis": {},
  "retirement_readiness_score": 0,
  "financial_freedom_year": "",
  "return_readiness_score": 0,
  "top_5_actions": [],
  "tax_optimization": {
    "tax_optimization_score": 0,
    "estimated_tax_range": "",
    "top_opportunities": [],
    "tax_assumptions_used": [],
    "tax_assumptions_needed": []
  },
  "refinance_scanner": {
    "refinance_opportunity_score": 0,
    "recommendation": "",
    "break_even_months": "",
    "estimated_interest_saved": "",
    "assumptions_used": []
  },
  "investment_recommendations": {
    "portfolio_fit_score": 0,
    "target_allocation": {},
    "sip_split_suggestion": {},
    "rebalancing_plan": {},
    "notes_and_risks": []
  },
  "motivational_message": "",
  "quote": "",
  "progress_highlight": "",
  "upgrade_suggestion": "",
  "roadmap": {}
}
```

---

## Supabase Schema (New Tables Required)

```sql
-- Health & Risk Score History
CREATE TABLE score_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  score_type TEXT NOT NULL, -- 'health', 'risk', 'tax', 'refinance', 'portfolio'
  score_value NUMERIC NOT NULL,
  sub_scores JSONB,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Gamification: Badges
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Gamification: Streaks
CREATE TABLE user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  streak_type TEXT NOT NULL, -- 'emi_ontime', 'savings_growth', 'debt_reduction'
  current_count INT DEFAULT 0,
  best_count INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Alerts
CREATE TABLE user_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscription Tier
ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
-- Values: 'free', 'intermediate', 'pro'

-- AI Personality Mode
ALTER TABLE profiles ADD COLUMN ai_personality TEXT DEFAULT 'balanced';
-- Values: 'balanced', 'strict', 'aggressive'

-- Autopilot
ALTER TABLE profiles ADD COLUMN autopilot_enabled BOOLEAN DEFAULT false;
```

---

## Implementation Timeline

| Phase | Weeks | Components | Effort |
|-------|-------|-----------|--------|
| **Phase 1** | 1-3 | Health Score, Risk Score, Alerts, Motivation Engine | Foundation |
| **Phase 2** | 4-6 | Debt Engine, Monte Carlo, Insurance, Wealth DNA, Life-Stage | Core Intelligence |
| **Phase 3** | 7-10 | Gamification, Personality Modes, Autopilot, Family Mode | Advanced |
| **Phase 4** | 11-14 | Tax Optimization, Refinance Scanner, Investment Engine, NRI, Subscriptions | Premium |

---

## Reference Apps (Design Inspiration)

| App | Key Feature to Reference |
|-----|------------------------|
| **Mint** | Unified dashboard, spending categories, bill reminders |
| **Personal Capital/Empower** | Net worth tracking, retirement planner, investment analysis |
| **YNAB** | Zero-based budgeting, proactive planning |
| **PocketGuard** | Clean UI, spending overview, "In My Pocket" concept |
| **ET Money** | Indian finance context, investment goals |
| **Money View** | SMS parsing, EMI alerts |
| **Monarch Money** | Modern UI, blended budgeting + wealth tracking |
| **PocketSmith** | Forecasting, scenario projections |

---

## Current State vs Target

| Feature | Current | Target |
|---------|---------|--------|
| Health Score | ❌ None | ✅ 0-100 with 7 sub-scores |
| Risk Score | ❌ None | ✅ 1-100 with 5 categories |
| Debt Optimization | ❌ Basic | ✅ Snowball/Avalanche/Hybrid |
| Monte Carlo | ❌ Skeleton only | ✅ 10K simulations |
| Alerts | ❌ None | ✅ Smart EMI + spending alerts |
| Gamification | ❌ None | ✅ Badges, streaks, milestones |
| Tax Optimization | ❌ None | ✅ India + US support |
| Refinance Scanner | ❌ None | ✅ Break-even analysis |
| Investment Recs | ❌ Basic AI advice | ✅ Live-data-aware engine |
| Subscription Tiers | ❌ None | ✅ Free/Intermediate/Pro |
| Live Data | ✅ Stock/MF/Gold/News APIs | ✅ Integrated into all engines |
| AI Personality | ❌ None | ✅ 3 modes |
| Autopilot | ✅ Basic | ✅ Full monthly recalculation |
| Family Mode | ✅ Basic | ✅ Conflict detection, joint roadmap |
