# FamLedgerAI — End-to-End Development Document
**Version**: 3.0  
**Date**: March 2, 2026  

---

## 1. Development Timeline

```
Phase 0: Foundation (Completed)
  ├── Single-page app (index.html)
  ├── Supabase auth + database
  ├── Basic budgeting (income, expenses, loans, investments)
  ├── Government schemes tracking
  ├── Vercel deployment pipeline

Phase 1: AI Integration (Completed)
  ├── Multi-AI router (Anthropic, OpenAI, Gemini)
  ├── Financial advice, budget coaching, NRI planning
  ├── Loan statement parsing (AI-powered)
  ├── Insurance PDF parsing
  ├── Autopilot financial planning
  ├── Family insights

Phase 2: Financial Intelligence (Completed)
  ├── Health Score Engine (0-100, 7 sub-scores)
  ├── Risk Score Engine (0-100, 6 dimensions + stress test)
  ├── Smart Alert System (critical/warning/info)
  ├── Debt Optimization (Avalanche/Snowball/Hybrid)
  ├── Gamification (10 badges, 5 streaks)
  ├── Wealth DNA Profiling + Motivation Engine
  ├── Unified Financial Dashboard API

Phase 3: Market Data + Bank Connectivity (Completed)
  ├── Stock quotes (Alpha Vantage)
  ├── Mutual fund NAVs (mfapi.in)
  ├── Gold prices (Metals-API)
  ├── Financial news (Finnhub)
  ├── US bank connectivity (Plaid — 8 endpoints)
  ├── India bank connectivity (Setu AA — 7 endpoints)
  ├── Zerodha broker integration

Phase 4: Polish + Testing (Completed)
  ├── Landing page (original, competitive analysis)
  ├── PocketGuard-inspired sidebar redesign
  ├── Modern registration screen
  ├── Bug fixes (NaN scores, ESM imports, memory leaks)
  ├── Input sanitization (prompt injection prevention)
  ├── Rate limiter memory cleanup
  ├── Comprehensive test suite (130 tests, 100% pass)

Phase 5: Future (Planned)
  ├── React migration
  ├── Monte Carlo simulation
  ├── Tax optimization engine
  ├── Subscription/premium tier
  ├── Mobile app (React Native)
```

## 2. Development Environment Setup

### Prerequisites
```
Node.js 20+
Git
Vercel CLI (optional, for local testing)
```

### Initial Setup
```bash
# Clone repository
git clone https://github.com/shaanreddy816/myfinance-dashboard.git
cd myfinance-dashboard/famledgerai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in your API keys in .env.local

# Run locally
npm run dev
# Opens at http://localhost:5173
```

### Required Accounts
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Supabase | Database + Auth | 500MB DB, 50K auth users |
| Vercel | Hosting + Serverless | 100GB bandwidth, 100K invocations |
| Anthropic | AI (primary) | Pay-per-use (~$0.25/1M input tokens) |
| Alpha Vantage | Stock data | 5 calls/min, 500/day |
| Finnhub | News | 60 calls/min |
| Metals-API | Gold prices | 50 calls/month |

### Optional Accounts
| Service | Purpose | When Needed |
|---------|---------|-------------|
| OpenAI | AI fallback | If Anthropic fails |
| Gemini | AI fallback | If both above fail |
| Plaid | US banks | When building bank UI |
| Setu | India banks | When building bank UI |
| Twilio | WhatsApp | For bill reminders |
| Zerodha | Broker | For portfolio sync |

## 3. Development Workflow

### Feature Development
```
1. Create feature branch (optional — currently using main)
2. Implement in relevant files:
   - Frontend: index.html
   - API handler: api/[...catchall].js
   - Service logic: lib/services/newService.js
   - API utilities: lib/api/newUtil.js
3. Write tests in test-all-services.js
4. Run tests: node test-all-services.js
5. Check diagnostics (no lint/type errors)
6. Commit with descriptive message
7. Push to main: git push origin main
8. Wait 2-3 minutes for Vercel deployment
9. Test on production: famledgerai.com
10. Run production tests: node test-all-services.js --prod
```

### Adding a New API Endpoint
```javascript
// Step 1: Create service (if needed)
// lib/services/myService.js
export function myComputation(input) {
  // Pure function, no side effects
  return { result: 'computed' };
}

// Step 2: Add handler in catchall.js
async function handleMyEndpoint(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const result = myComputation(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Step 3: Add route in handler()
if (path === 'my-endpoint') return handleMyEndpoint(req, res);

// Step 4: Add import at top
import { myComputation } from '../lib/services/myService.js';

// Step 5: Add tests
async function testMyService() {
  const { myComputation } = await import('./lib/services/myService.js');
  assert(myComputation({}).result === 'computed', 'Returns computed result');
}
```

### Adding a New Frontend Page
```javascript
// Step 1: Add page container in HTML
<div id="my-page" class="page" style="display:none">
  <h2>My Page</h2>
  <div id="my-page-content"></div>
</div>

// Step 2: Add sidebar link
<li onclick="showPage('my-page')">
  <div class="nav-icon"><i class="fas fa-icon"></i></div>
  <span>My Page</span>
</li>

// Step 3: Add render function
function renderMyPage() {
  const container = document.getElementById('my-page-content');
  container.innerHTML = `...`;
}

// Step 4: Call render in initApp() or on page show
```

## 4. Deployment Pipeline

### Production Deployment
```
Local Machine → git push → GitHub → Vercel webhook → Build → Deploy

Timeline: ~2-3 minutes from push to live
URL: https://famledgerai.com
```

### Environment Variables (Vercel Dashboard)
```
Settings → Environment Variables → Add:
  SUPABASE_URL = https://ivvkzforsgrhofpekir.supabase.co
  SUPABASE_SERVICE_ROLE_KEY = [secret]
  ANTHROPIC_API_KEY = [secret]
  ALPHA_VANTAGE_API_KEY = [secret]
  FINNHUB_API_KEY = [secret]
  METALS_API_KEY = [secret]
  ... (see .env.example for full list)
```

### Vercel Project Settings
```
Framework: Other
Build Command: (none)
Output Directory: (none — uses root)
Node.js Version: 20.x
Root Directory: famledgerai
```

### Post-Deployment Verification
```bash
# Run production tests
node test-all-services.js --prod

# Manual checks
1. Open https://famledgerai.com — landing page loads
2. Click "Get Started" — registration form appears
3. Login with test account
4. Check dashboard loads with scores
5. Check AI dashboard fetches data
6. Check /api/test-env returns all keys as "defined"
```

## 5. Database Management

### Supabase Migrations
All SQL migrations stored in `docs/supabase/`:
```
HEALTH_INSURANCE_MIGRATION.sql    — insurance_policies, insurance_claims, provider_network_cache
BANK_CONNECTIVITY_MIGRATION.sql   — linked_accounts, aa_consents, plaid_items, plaid_webhooks
RECURRING_EXPENSES_MIGRATION.sql  — master_expenses, recurring_engine_logs
```

### Running Migrations
```
1. Open Supabase Dashboard → SQL Editor
2. Paste migration SQL
3. Run
4. Verify: Check table exists with correct columns
5. Verify: RLS enabled (rowsecurity = true)
```

### RLS Policy Pattern
```sql
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON my_table FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own data"
  ON my_table FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own data"
  ON my_table FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own data"
  ON my_table FOR DELETE
  USING (auth.uid()::text = user_id);
```

## 6. Testing Strategy

### Test Levels
```
Level 1: Unit Tests (run locally, no dependencies)
  node test-all-services.js
  Tests: 100 | Time: <1s

Level 2: API Integration (requires production or local server)
  node test-all-services.js --prod
  Tests: 130 | Time: ~3s

Level 3: Manual E2E (browser)
  - Registration flow
  - Login flow
  - Add income/expenses
  - Add loans (manual + PDF parse)
  - Add insurance (manual + PDF parse)
  - AI dashboard
  - Settings page

Level 4: Cross-Browser (manual)
  - Chrome (primary)
  - Safari (iOS)
  - Firefox
  - Edge
```

### Test Before Every Push
```bash
# Quick check
node test-all-services.js

# Full check (if API changes)
node test-all-services.js --prod
```

## 7. Monitoring and Debugging

### Vercel Logs
```
Vercel Dashboard → Project → Deployments → Functions tab
  - View real-time logs for serverless function
  - Filter by status code (4xx, 5xx)
  - Check cold start times
```

### Common Issues
| Issue | Cause | Fix |
|-------|-------|-----|
| 500 on AI endpoints | API key expired/missing | Check Vercel env vars |
| CORS error | Origin mismatch | Check ALLOWED_ORIGIN env var |
| Stale frontend | Browser cache | Ctrl+Shift+R or clear cache |
| Supabase RLS error | Missing policy | Add RLS policy for the table |
| Rate limit hit | Too many AI calls | Wait or increase limit |
| NaN in scores | Zero/undefined input | Check input validation |

### Debug Checklist
```
1. Check Vercel function logs for errors
2. Check browser console for frontend errors
3. Test API directly: curl https://famledgerai.com/api/test-env
4. Run test suite: node test-all-services.js --prod
5. Check Supabase dashboard for data issues
```

## 8. Code Conventions

### JavaScript
```
- ESM modules (import/export)
- async/await for all async operations
- Consistent error handling: try/catch with JSON error response
- No var — use const/let
- Template literals for string interpolation
- Destructuring for function parameters
```

### API Response Format
```javascript
// Success
{ success: true, ...data }

// Error
{ error: 'Human-readable message', detail: 'Technical detail' }
// or
{ success: false, error: { message: '...', statusCode: 400 } }
```

### File Naming
```
Services: camelCase (healthScoreService.js)
API utils: camelCase (aiRouter.js)
Docs: UPPER_SNAKE_CASE.md
SQL: UPPER_SNAKE_CASE.sql
```

## 9. Dependency Management

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | ^2.97.0 | Database client (server-side) |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^7.3.1 | Local dev server |

### CDN Dependencies (Frontend)
| Library | Purpose |
|---------|---------|
| Supabase JS | Client-side auth + queries |
| Font Awesome | Icons |
| Chart.js | Charts and graphs |
| pdf.js | PDF text extraction |

### Zero-Dependency Services
All `lib/services/*.js` use only Node.js built-ins and `fetch()`. No npm packages required for:
- AI calls (fetch to provider APIs)
- Plaid integration (fetch-based, no SDK)
- Setu AA integration (fetch-based)
- Market data (fetch to external APIs)
- Rate limiting (in-memory Map)
- Caching (in-memory Map)

## 10. Release Checklist

```
Before every production push:
  □ All tests pass: node test-all-services.js
  □ No diagnostic errors on modified files
  □ No hardcoded API keys or secrets
  □ No console.log left in (use console.error/warn for real logging)
  □ Error handling on all new endpoints
  □ Input validation on all new endpoints
  □ Rate limiting on AI endpoints
  □ Descriptive commit message
  □ Production tests pass: node test-all-services.js --prod
  □ Manual smoke test on famledgerai.com
```
