# FamLedgerAI — Test-Driven Development (TDD) Document
**Version**: 3.0  
**Date**: March 2, 2026  
**Test Runner**: Node.js native (no framework dependency)  
**Test File**: `test-all-services.js`  

---

## 1. Testing Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    TEST PYRAMID                          │
│                                                         │
│                    ┌─────────┐                          │
│                    │  E2E    │  API Integration (30)     │
│                   ┌┴─────────┴┐                         │
│                   │ Integration│  Service + DB (20)      │
│                  ┌┴────────────┴┐                        │
│                  │  Unit Tests   │  Pure functions (80)   │
│                  └───────────────┘                        │
│                                                         │
│  Total: 130 tests | Pass Rate Target: 100%              │
└─────────────────────────────────────────────────────────┘
```

### Test Categories

| Category | Count | Scope | Dependencies |
|----------|-------|-------|--------------|
| Unit Tests | ~80 | Pure service functions | None (in-process) |
| Structure Tests | ~20 | Module exports, function signatures | Import only |
| API Integration | ~30 | Live endpoint testing | Running server |
| Edge Cases | ~10 | Boundary values, NaN, negatives | None |

## 2. Test Coverage Matrix

### 2.1 Health Score Service — 12 Tests
| # | Test Case | Input | Expected | Type |
|---|-----------|-------|----------|------|
| 1 | Healthy profile scores >= 60 | High income, low debt | Score >= 60 | Unit |
| 2 | Grade is Good or Excellent | High income, low debt | "Good" or "Excellent" | Unit |
| 3 | Has 7 sub-scores | Any profile | 7 keys in sub_scores | Unit |
| 4 | Has derived_metrics | Any profile | Object with 4 metrics | Unit |
| 5 | Poor profile scores < 40 | Low income, high debt | Score < 40 | Unit |
| 6 | Grade is Poor or Critical | Low income, high debt | "Poor" or "Critical" | Unit |
| 7 | Handles zero income | income=0, expenses=0 | No crash, valid number | Edge |
| 8 | Score is not NaN for zero income | income=0 | !isNaN(score) | Edge |
| 9 | Score is non-negative | income=0 | score >= 0 | Edge |
| 10 | Handles empty profile | {} | Valid score object | Edge |
| 11 | Has color string | Any | typeof color === 'string' | Unit |
| 12 | Handles negative income | income=-50000 | score >= 0 | Edge |

### 2.2 Risk Score Service — 8 Tests
| # | Test Case | Expected | Type |
|---|-----------|----------|------|
| 1 | Low risk profile <= 50 | Stable or Watchlist | Unit |
| 2 | Has risk_dimensions | 6 dimension objects | Unit |
| 3 | Has stress_test | job_loss, rate_hike, recession | Unit |
| 4 | High risk profile > 50 | High or Critical | Unit |
| 5 | Empty profile handled | Valid number | Edge |
| 6 | Score in 0-100 range | 0 <= score <= 100 | Edge |
| 7 | Extreme equity allocation | score <= 100 | Edge |
| 8 | Score capped at 100 | Never exceeds 100 | Edge |

### 2.3 Alert Service — 6 Tests
| # | Test Case | Expected | Type |
|---|-----------|----------|------|
| 1 | Critical alerts generated | total > 0, critical > 0 | Unit |
| 2 | Critical sorted first | alerts[0].severity === 'critical' | Unit |
| 3 | Positive alerts for healthy | info alerts present | Unit |
| 4 | Overspending detection | overspending alert found | Unit |
| 5 | Empty profile handled | typeof total === 'number' | Edge |
| 6 | String numeric values | No crash | Edge |

### 2.4 Debt Optimization Service — 8 Tests
| # | Test Case | Expected | Type |
|---|-----------|----------|------|
| 1 | Multiple loans — best strategy | Returns strategy name | Unit |
| 2 | Compares 3 strategies | comparison.length === 3 | Unit |
| 3 | Calculates totals | outstanding > 0, emi > 0 | Unit |
| 4 | Avalanche saves interest | interest_saved >= 0 | Unit |
| 5 | Empty loans | strategy === 'none' | Edge |
| 6 | Single loan | Still 3 strategies | Unit |
| 7 | All loans cleared | strategy === 'none' | Edge |
| 8 | Zero-rate loan | No crash | Edge |

### 2.5 Gamification Service — 8 Tests
| # | Test Case | Expected | Type |
|---|-----------|----------|------|
| 1 | Qualified profile unlocks badges | earned > 0 | Unit |
| 2 | Total matches BADGES constant | Correct count | Unit |
| 3 | Debt Destroyer when no debt | Badge present | Unit |
| 4 | Freedom Tracker at health >= 80 | Badge present | Unit |
| 5 | Empty profile handled | typeof earned === 'number' | Edge |
| 6 | Correct EMI streak | Matches input | Unit |
| 7 | Correct savings streak | Matches input | Unit |
| 8 | Default streaks to 0 | All zeros | Edge |

### 2.6 Wealth DNA Service — 9 Tests
| # | Test Case | Expected | Type |
|---|-----------|----------|------|
| 1 | Aggressive profile classified | 'Aggressive Accelerator' | Unit |
| 2 | Correct life stage (age 28) | 'Foundation (20-30)' | Unit |
| 3 | Debt-heavy classified | 'Debt-Focused Rebuilder' | Unit |
| 4 | Pre-retirement classified | 'Pre-Retirement Optimizer' | Unit |
| 5 | Correct life stage (age 58) | 'Acceleration (45-60)' | Unit |
| 6 | High score motivation | Contains 'excellent' | Unit |
| 7 | Returns quote | typeof === 'string' | Unit |
| 8 | Highlights EMI streak | Contains streak count | Unit |
| 9 | Low score encouragement | Contains 'journey' | Unit |

### 2.7 Rate Limiter — 10 Tests
| # | Test Case | Expected | Type |
|---|-----------|----------|------|
| 1 | Allows within limit | true × 3 | Unit |
| 2 | Blocks over limit | false on 4th | Unit |
| 3 | Valid retry-after | 0 < seconds <= 60 | Unit |
| 4 | Clear works | Allows after clear | Unit |
| 5 | Keys are independent | A blocked, B allowed | Unit |
| 6 | Has _cleanup method | typeof === 'function' | Structure |
| 7 | Cleanup runs without error | No throw | Unit |

### 2.8 Service Structure Tests — 27 Tests
| Service | Tests | Validates |
|---------|-------|-----------|
| AI Router | 2 | Module loads, function exported |
| Plaid Service | 13 | 9 exports + 4 parseWebhook tests |
| AA Service | 5 | 5 function exports |
| Insurance Service | 12 | 9 exports + 3 sha256Server tests |

### 2.9 API Integration Tests — 30 Tests
| # | Endpoint | Method | Test | Expected |
|---|----------|--------|------|----------|
| 1 | test-env | GET | Responds | 200 |
| 2 | test-env | GET | Supabase configured | URL present |
| 3 | nonexistent | GET | Not found | 404 |
| 4 | advice | GET | Wrong method | 405 |
| 5 | health-score | POST | Valid profile | 200 + score |
| 6 | risk-score | POST | Valid profile | 200 + score |
| 7 | alerts | POST | Critical profile | 200 + array |
| 8 | debt-optimize | POST | Loans array | 200 + strategy |
| 9 | gamification | POST | Profile + scores | 200 + badges |
| 10-16 | financial-dashboard | POST | Full profile | All fields present |
| 17 | stocks | GET | With symbol | 200 or rate-limited |
| 18 | stocks | GET | No symbol | 400 |
| 19 | mutualfund | GET | No code | 400 |
| 20 | mutualfund | GET | Non-numeric code | 400 |
| 21 | news | GET | Invalid category | 400 |
| 22 | budget/coach | POST | No userId | 400 |
| 23 | invest/recommend | POST | No userId | 400 |
| 24 | test-env | OPTIONS | CORS preflight | 200 |

## 3. Running Tests

```bash
# Unit tests only (no server needed)
node test-all-services.js

# Full suite including API integration (against production)
node test-all-services.js --prod

# Expected output:
# ╔══════════════════════════════════════════════════════════════╗
# ║  RESULTS: 130 passed, 0 failed, 0 skipped (2.95s)
# ║  Pass Rate: 100.0%
# ╚══════════════════════════════════════════════════════════════╝
```

## 4. TDD Workflow

### For New Features
```
1. Write test case in test-all-services.js
2. Run tests → confirm new test FAILS (red)
3. Implement minimum code to pass
4. Run tests → confirm ALL tests PASS (green)
5. Refactor if needed
6. Run tests → confirm still green
7. Commit
```

### For Bug Fixes
```
1. Write test that reproduces the bug
2. Run tests → confirm it FAILS
3. Fix the bug
4. Run tests → confirm ALL pass
5. Commit with test + fix together
```

### Example: Health Score NaN Bug (actual fix from this codebase)
```javascript
// Step 1: Test written
const zero = computeHealthScore({ income: 0, expenses: 0 });
assert(!isNaN(zero.financial_health_score), 'Score is not NaN for zero income');

// Step 2: Test FAILED — score was NaN because 0/0 = NaN

// Step 3: Fix applied in healthScoreService.js
// Before: const emi_ratio = income > 0 ? total_emi / income : 1;
// After:  const emi_ratio = income > 0 ? total_emi / income : (total_emi > 0 ? 1 : 0);

// Step 4: All 130 tests pass
```

## 5. Test Data Profiles

### Healthy Indian Family
```javascript
{
  income: 200000, expenses: 100000, total_emi: 30000,
  total_debt_outstanding: 500000, liquid_assets: 600000,
  total_assets: 5000000, term_cover: 30000000, health_cover: 2000000,
  dependents: 2, sip_monthly: 30000, credit_utilization: 0.15, age: 35
}
// Expected: Health 60+, Risk <50, multiple info alerts, several badges
```

### Financially Stressed Profile
```javascript
{
  income: 50000, expenses: 48000, total_emi: 30000,
  total_debt_outstanding: 3000000, liquid_assets: 5000,
  total_assets: 100000, term_cover: 0, health_cover: 0,
  dependents: 4, credit_utilization: 0.80, age: 40
}
// Expected: Health <40, Risk >50, critical alerts, few badges
```

### Edge Case — Empty Profile
```javascript
{}
// Expected: No crashes, valid defaults, score = 0 or near-zero
```

## 6. Continuous Integration

Currently manual (`node test-all-services.js` before each push). Future plan:

```yaml
# .github/workflows/test.yml (planned)
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd famledgerai && node test-all-services.js
```

## 7. Known Test Gaps (Future)

| Area | Current Coverage | Needed |
|------|-----------------|--------|
| Frontend JS | 0% | Playwright/Puppeteer E2E tests |
| AI response quality | Mock only | Golden-file comparison tests |
| Supabase RLS | Manual | Automated RLS policy tests |
| WhatsApp delivery | Structure only | Sandbox integration test |
| Zerodha OAuth | Structure only | Mock OAuth flow test |
| Performance | None | Load testing with k6 |
| Accessibility | None | axe-core automated scans |
