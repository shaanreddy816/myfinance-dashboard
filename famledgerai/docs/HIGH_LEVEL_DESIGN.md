# FamLedgerAI — High Level Design (HLD)
**Version**: 3.0  
**Date**: March 2, 2026  
**Domain**: Personal Finance Management + AI Advisory  
**Target Users**: Indian families, NRIs, US-based users  

---

## 1. System Overview

FamLedgerAI is an AI-powered family finance management platform that combines budgeting, investment tracking, loan management, insurance intelligence, and multi-AI advisory into a single application. It serves both Indian and US markets with bank connectivity for both regions.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USERS                                       │
│         Browser (Desktop/Mobile) — PWA Capable                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                               │
│                    (CDN + Serverless)                                │
│  ┌─────────────┐  ┌──────────────────────────────────────────────┐  │
│  │ index.html  │  │  /api/[...catchall].js                       │  │
│  │ (SPA)       │  │  (Serverless Function — all API routes)      │  │
│  │ Landing     │  │                                              │  │
│  │ Auth        │  │  40+ route handlers                          │  │
│  │ Dashboard   │  │  AI Router (multi-provider fallback)         │  │
│  │ All Pages   │  │  Rate Limiter                                │  │
│  └─────────────┘  │  Input Sanitization                          │  │
│                   └──────────────────────────────────────────────┘  │
└──────────┬────────────────┬──────────┬──────────┬──────────────────┘
           │                │          │          │
    ┌──────▼──────┐  ┌──────▼────┐ ┌───▼───┐ ┌───▼────────────┐
    │  Supabase   │  │ AI APIs   │ │Market │ │ Bank Connect   │
    │  (Postgres  │  │ Anthropic │ │ Data  │ │ Plaid (US)     │
    │   + Auth    │  │ OpenAI    │ │ Alpha │ │ Setu AA (India)│
    │   + Storage │  │ Gemini    │ │ mfapi │ │ Zerodha        │
    │   + RLS)    │  │           │ │Metals │ │                │
    └─────────────┘  └───────────┘ │Finnhub│ └────────────────┘
                                   └───────┘
```

## 2. Core Modules

| Module | Description | Data Source |
|--------|-------------|-------------|
| Dashboard | Unified financial health view with scores, alerts, actions | All modules |
| Income & Expenses | Track family income (husband/wife/rental), monthly expenses | Supabase user_data |
| Loans | Parse bank statements via AI, track EMIs, prepayment advisor | AI + user_data |
| Insurance | Policy management, claims tracking, PDF parsing | Supabase insurance_policies |
| Investments | MF, stocks, FD, PPF, gold tracking + Zerodha sync | Zerodha API + user_data |
| AI Advisory | Multi-AI financial advice, budget coaching, NRI planning | Anthropic/OpenAI/Gemini |
| Bank Connectivity | Link US banks (Plaid) and Indian banks (Setu AA) | Plaid + Setu APIs |
| Financial Scores | Health Score (0-100), Risk Score (0-100), Wealth DNA | Computed services |
| Gamification | Badges, streaks, milestones | Computed from profile |
| WhatsApp Alerts | Bill reminders, expense alerts via Twilio | Twilio API |
| Government Schemes | PMJJBY, PMSBY, APY, Sukanya Samriddhi tracking | user_data |
| Inflation Analysis | 20-year projection with AI + deterministic fallback | AI + historical data |

## 3. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Single index.html (SPA) | Rapid iteration, zero build step, React migration planned |
| Backend | Vercel Serverless (single catchall) | Free tier, auto-scaling, no server management |
| Database | Supabase (Postgres + Auth + Storage) | RLS security, real-time, generous free tier |
| AI Strategy | Multi-provider with fallback chain | Resilience — if Anthropic fails, try OpenAI, then Gemini, then mock |
| Auth | Supabase Auth (email + password) | Built-in, secure, handles sessions |
| State | localStorage (userData object) + Supabase sync | Offline-first, debounced save to cloud |
| Bank Connect | Plaid (US) + Setu AA (India) | Industry standard for each region |
| Deployment | Vercel + GitHub auto-deploy | Push to main = production in 2-3 minutes |

## 4. Data Flow

```
User Action → Frontend JS → localStorage (immediate)
                          → debounceSave() → Supabase user_data table
                          
API Call → Frontend fetch() → /api/[...catchall].js
         → Route matching → Handler function
         → Service layer (lib/services/*.js)
         → External API / Supabase / AI provider
         → JSON response → Frontend renders
```

## 5. Security Architecture

- All API keys stored in Vercel environment variables (never in frontend)
- Supabase Row Level Security (RLS) on all tables
- CORS restricted to `famledgerai.com`
- Rate limiting on AI endpoints (5 requests/hour per user)
- Input sanitization on AI prompts (prompt injection prevention)
- Policy numbers hashed with SHA-256 before storage
- Plaid access tokens stored server-side only

## 6. Scalability Considerations

| Concern | Current | Future |
|---------|---------|--------|
| Frontend | Single HTML file (~13K lines) | React + code splitting |
| API | Single serverless function | Split into route-specific functions |
| Database | Supabase free tier | Supabase Pro + connection pooling |
| Caching | In-memory (per-invocation) | Redis/Upstash KV |
| AI Costs | Pay-per-call (Haiku/4o-mini) | Batch processing + caching responses |
| Rate Limiting | In-memory Map | Redis-backed distributed limiter |

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page Load | < 3s (first paint) |
| API Response | < 2s (computed), < 10s (AI) |
| Availability | 99.9% (Vercel SLA) |
| Data Freshness | Real-time for user data, 15-min cache for market data |
| Mobile Support | Responsive design, PWA installable |
| Browser Support | Chrome, Safari, Firefox, Edge (latest 2 versions) |
