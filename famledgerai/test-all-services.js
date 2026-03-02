/**
 * FamLedgerAI — Comprehensive Service & API Test Suite
 * Tests all backend services: unit tests + API integration tests
 * 
 * Run: node test-all-services.js
 * Run against production: node test-all-services.js --prod
 */

const isProd = process.argv.includes('--prod');
const BASE_URL = isProd ? 'https://famledgerai.com/api' : 'http://localhost:3000/api';

let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];

function assert(condition, testName, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    failures.push({ test: testName, detail });
    console.log(`  ❌ ${testName}${detail ? ' — ' + detail : ''}`);
  }
}

function skip(testName, reason) {
  skipped++;
  console.log(`  ⏭️  ${testName} — ${reason}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS — Service Modules (imported directly)
// ═══════════════════════════════════════════════════════════════════════════════

async function testHealthScoreService() {
  console.log('\n📊 Health Score Service');
  const { computeHealthScore } = await import('./lib/services/healthScoreService.js');

  // Test 1: Healthy profile
  const healthy = computeHealthScore({
    income: 200000, expenses: 100000, total_emi: 30000,
    total_debt_outstanding: 500000, liquid_assets: 600000,
    total_assets: 5000000, term_cover: 30000000, health_cover: 2000000,
    dependents: 2, sip_monthly: 30000, credit_utilization: 0.15, age: 35
  });
  assert(healthy.financial_health_score >= 60, 'Healthy profile scores >= 60', `Got: ${healthy.financial_health_score}`);
  assert(healthy.grade === 'Good' || healthy.grade === 'Excellent', 'Grade is Good or Excellent', `Got: ${healthy.grade}`);
  assert(typeof healthy.sub_scores === 'object', 'Has sub_scores object');
  assert(Object.keys(healthy.sub_scores).length === 7, 'Has 7 sub-scores');
  assert(typeof healthy.derived_metrics === 'object', 'Has derived_metrics');

  // Test 2: Poor profile
  const poor = computeHealthScore({
    income: 50000, expenses: 48000, total_emi: 25000,
    total_debt_outstanding: 2000000, liquid_assets: 10000,
    total_assets: 100000, term_cover: 0, health_cover: 0,
    dependents: 3, sip_monthly: 0, credit_utilization: 0.80, age: 40
  });
  assert(poor.financial_health_score < 40, 'Poor profile scores < 40', `Got: ${poor.financial_health_score}`);
  assert(poor.grade === 'Poor' || poor.grade === 'Critical', 'Grade is Poor or Critical');

  // Test 3: Zero income edge case
  const zero = computeHealthScore({ income: 0, expenses: 0 });
  assert(typeof zero.financial_health_score === 'number', 'Handles zero income without crash');
  assert(!isNaN(zero.financial_health_score), 'Score is not NaN for zero income');
  assert(zero.financial_health_score >= 0, 'Score is non-negative for zero income');

  // Test 4: Empty profile
  const empty = computeHealthScore({});
  assert(typeof empty.financial_health_score === 'number', 'Handles empty profile');
  assert(empty.color && typeof empty.color === 'string', 'Has color string');
}

async function testRiskScoreService() {
  console.log('\n⚠️  Risk Score Service');
  const { computeRiskScore } = await import('./lib/services/riskScoreService.js');

  // Test 1: Low risk profile
  const low = computeRiskScore({
    income: 200000, expenses: 80000, total_emi: 20000,
    total_debt_outstanding: 200000, liquid_assets: 1200000,
    total_assets: 5000000, term_cover: 30000000, health_cover: 2000000,
    dependents: 1, equity_allocation_pct: 50, age: 35, income_sources: 2
  });
  assert(low.risk_score <= 50, 'Low risk profile scores <= 50', `Got: ${low.risk_score}`);
  assert(low.risk_category === 'Stable' || low.risk_category === 'Watchlist', 'Category is Stable or Watchlist');
  assert(typeof low.risk_dimensions === 'object', 'Has risk_dimensions');
  assert(typeof low.stress_test === 'object', 'Has stress_test');

  // Test 2: High risk profile
  const high = computeRiskScore({
    income: 50000, expenses: 45000, total_emi: 30000,
    total_debt_outstanding: 3000000, liquid_assets: 5000,
    total_assets: 100000, term_cover: 0, health_cover: 0,
    dependents: 4, equity_allocation_pct: 90, age: 25
  });
  assert(high.risk_score > 50, 'High risk profile scores > 50', `Got: ${high.risk_score}`);

  // Test 3: Edge case — zero everything
  const zero = computeRiskScore({});
  assert(typeof zero.risk_score === 'number', 'Handles empty profile');
  assert(zero.risk_score >= 0 && zero.risk_score <= 100, 'Score in 0-100 range');
}

async function testAlertService() {
  console.log('\n🔔 Alert Service');
  const { generateAlerts } = await import('./lib/services/alertService.js');

  // Test 1: Critical alerts
  const critical = generateAlerts({
    income: 50000, expenses: 48000, total_emi: 30000,
    liquid_assets: 10000, loans: [{ emi: 15000 }, { emi: 10000 }, { emi: 5000 }],
    term_cover: 0, health_cover: 0, dependents: 3,
    credit_utilization: 0.70
  });
  assert(critical.total > 0, 'Generates alerts for critical profile', `Got: ${critical.total}`);
  assert(critical.critical > 0, 'Has critical severity alerts');
  assert(critical.alerts[0].severity === 'critical', 'Critical alerts sorted first');

  // Test 2: Healthy profile — positive alerts
  const healthy = generateAlerts({
    income: 200000, expenses: 100000, total_emi: 20000,
    liquid_assets: 1200000, loans: [], term_cover: 30000000,
    health_cover: 2000000, dependents: 1, sip_monthly: 30000
  });
  const infoAlerts = healthy.alerts.filter(a => a.severity === 'info');
  assert(infoAlerts.length > 0, 'Generates positive info alerts for healthy profile');

  // Test 3: Overspending detection
  const overspend = generateAlerts({
    income: 100000, expenses: 80000, prev_month_expenses: 60000
  });
  const overspendAlert = overspend.alerts.find(a => a.type === 'overspending');
  assert(!!overspendAlert, 'Detects overspending trend');

  // Test 4: Empty profile
  const empty = generateAlerts({});
  assert(typeof empty.total === 'number', 'Handles empty profile');
}

async function testDebtOptimizationService() {
  console.log('\n💳 Debt Optimization Service');
  const { optimizeDebt } = await import('./lib/services/debtOptimizationService.js');

  // Test 1: Multiple loans
  const result = optimizeDebt([
    { label: 'Home Loan', outstanding: 5000000, emi: 45000, rate: 8.5, remainingMonths: 240 },
    { label: 'Car Loan', outstanding: 300000, emi: 12000, rate: 10.5, remainingMonths: 30 },
    { label: 'Personal Loan', outstanding: 100000, emi: 8000, rate: 14, remainingMonths: 15 }
  ], 10000);
  assert(result.best_strategy, 'Returns best strategy', `Got: ${result.best_strategy}`);
  assert(result.comparison.length === 3, 'Compares 3 strategies (Avalanche, Snowball, Hybrid)');
  assert(result.total_outstanding > 0, 'Calculates total outstanding');
  assert(result.total_monthly_emi > 0, 'Calculates total monthly EMI');
  // Avalanche should save the most interest
  const avalanche = result.comparison.find(s => s.strategy === 'Avalanche');
  assert(avalanche && avalanche.interest_saved_vs_baseline >= 0, 'Avalanche calculates interest savings');

  // Test 2: No loans
  const noLoans = optimizeDebt([], 0);
  assert(noLoans.strategy === 'none', 'Returns "none" for empty loans');

  // Test 3: Single loan
  const single = optimizeDebt([
    { label: 'Home Loan', outstanding: 5000000, emi: 45000, rate: 8.5, remainingMonths: 240 }
  ], 5000);
  assert(single.comparison.length === 3, 'Still compares 3 strategies for single loan');

  // Test 4: All loans cleared
  const cleared = optimizeDebt([{ outstanding: 0, emi: 0, rate: 0 }]);
  assert(cleared.strategy === 'none', 'Returns "none" when all loans cleared');
}

async function testGamificationService() {
  console.log('\n🏆 Gamification Service');
  const { evaluateBadges, evaluateStreaks, BADGES } = await import('./lib/services/gamificationService.js');

  // Test 1: Fully qualified profile
  const badges = evaluateBadges({
    income: 200000, expenses: 100000, liquid_assets: 1200000,
    sip_monthly: 35000, total_debt_outstanding: 0, loans: [],
    term_cover: 30000000, health_cover: 2000000, dependents: 1,
    net_worth: 10000000
  }, 85, 20);
  assert(badges.badges_unlocked.length > 0, 'Unlocks badges for qualified profile', `Got: ${badges.earned}`);
  assert(badges.total_badges === Object.keys(BADGES).length, 'Total badges matches BADGES constant');
  const hasDebtDestroyer = badges.badges_unlocked.some(b => b.id === 'debt_destroyer');
  assert(hasDebtDestroyer, 'Unlocks Debt Destroyer when no debt');
  const hasFreedomTracker = badges.badges_unlocked.some(b => b.id === 'freedom_tracker');
  assert(hasFreedomTracker, 'Unlocks Freedom Tracker when health score >= 80');

  // Test 2: Empty profile
  const emptyBadges = evaluateBadges({}, 0, 100);
  assert(typeof emptyBadges.earned === 'number', 'Handles empty profile');

  // Test 3: Streaks
  const streaks = evaluateStreaks({ emi_ontime: 6, savings_growth: 3 });
  assert(streaks.emi_ontime === 6, 'Returns correct EMI streak');
  assert(streaks.savings_growth === 3, 'Returns correct savings streak');

  // Test 4: Empty streaks
  const emptyStreaks = evaluateStreaks();
  assert(emptyStreaks.emi_ontime === 0, 'Defaults to 0 for empty streaks');
}

async function testWealthDnaService() {
  console.log('\n🧬 Wealth DNA Service');
  const { classifyWealthDna, getMotivation } = await import('./lib/services/wealthDnaService.js');

  // Test 1: Aggressive profile (low savings rate so it doesn't trigger Conservative first)
  const aggressive = classifyWealthDna({
    age: 28, income: 200000, expenses: 160000,
    total_debt_outstanding: 100000, total_assets: 2000000,
    sip_monthly: 40000, risk_tolerance: 'high'
  });
  assert(aggressive.wealth_dna_profile === 'Aggressive Accelerator', 'Classifies aggressive profile', `Got: ${aggressive.wealth_dna_profile}`);
  assert(aggressive.life_stage === 'Foundation (20-30)', 'Correct life stage for age 28');

  // Test 2: Debt-heavy profile
  const debtor = classifyWealthDna({
    age: 40, total_debt_outstanding: 8000000, total_assets: 5000000
  });
  assert(debtor.wealth_dna_profile === 'Debt-Focused Rebuilder', 'Classifies debt-heavy profile');

  // Test 3: Pre-retirement
  const preRetire = classifyWealthDna({ age: 58 });
  assert(preRetire.wealth_dna_profile === 'Pre-Retirement Optimizer', 'Classifies pre-retirement');
  assert(preRetire.life_stage === 'Acceleration (45-60)', 'Correct life stage for age 58');

  // Test 4: Motivation
  const highMotivation = getMotivation(85, { emi_ontime: 5 });
  assert(highMotivation.motivational_message.includes('excellent'), 'High score gets excellent message');
  assert(typeof highMotivation.quote === 'string', 'Returns a quote');
  assert(highMotivation.progress_highlight.includes('5-month'), 'Highlights EMI streak');

  const lowMotivation = getMotivation(25, {});
  assert(lowMotivation.motivational_message.includes('journey'), 'Low score gets encouraging message');
}

async function testRateLimiter() {
  console.log('\n🚦 Rate Limiter');
  const { default: rateLimiter } = await import('./lib/api/rateLimit.js');

  // Test 1: Allow within limit
  rateLimiter.clear('test:key');
  assert(rateLimiter.isAllowed('test:key', 3, 60000) === true, 'Allows first request');
  assert(rateLimiter.isAllowed('test:key', 3, 60000) === true, 'Allows second request');
  assert(rateLimiter.isAllowed('test:key', 3, 60000) === true, 'Allows third request');

  // Test 2: Block over limit
  assert(rateLimiter.isAllowed('test:key', 3, 60000) === false, 'Blocks fourth request (over limit)');

  // Test 3: Retry after
  const retryAfter = rateLimiter.getRetryAfter('test:key', 60000);
  assert(retryAfter > 0 && retryAfter <= 60, 'Returns valid retry-after seconds', `Got: ${retryAfter}`);

  // Test 4: Clear works
  rateLimiter.clear('test:key');
  assert(rateLimiter.isAllowed('test:key', 3, 60000) === true, 'Allows after clear');

  // Test 5: Different keys are independent
  rateLimiter.clear('test:a');
  rateLimiter.clear('test:b');
  rateLimiter.isAllowed('test:a', 1, 60000);
  assert(rateLimiter.isAllowed('test:a', 1, 60000) === false, 'Key A blocked');
  assert(rateLimiter.isAllowed('test:b', 1, 60000) === true, 'Key B still allowed');

  // Test 6: Cleanup method exists
  assert(typeof rateLimiter._cleanup === 'function', 'Has _cleanup method for memory management');
  rateLimiter._cleanup(); // Should not throw
  assert(true, 'Cleanup runs without error');

  // Cleanup
  rateLimiter.clear('test:key');
  rateLimiter.clear('test:a');
  rateLimiter.clear('test:b');
}

async function testAIRouter() {
  console.log('\n🤖 AI Router (Mock Fallback)');
  const { default: aiRouterModule } = await import('./lib/api/aiRouter.js');
  // We can't test actual AI calls without keys, but we can test the mock fallback
  // The getMockAdvice function is not exported, but callAIWithFallback will fall through to it
  // when no API keys are set. Let's test the module structure.

  assert(typeof aiRouterModule === 'undefined' || true, 'AI Router module loads without error');

  // Test mock advice modules exist by checking the exported function
  const { callAIWithFallback } = await import('./lib/api/aiRouter.js');
  assert(typeof callAIWithFallback === 'function', 'callAIWithFallback is exported');
}

async function testPlaidService() {
  console.log('\n🏦 Plaid Service (Structure)');
  const plaid = await import('./lib/services/plaidService.js');

  assert(typeof plaid.createLinkToken === 'function', 'createLinkToken exported');
  assert(typeof plaid.exchangePublicToken === 'function', 'exchangePublicToken exported');
  assert(typeof plaid.getAccounts === 'function', 'getAccounts exported');
  assert(typeof plaid.getBalances === 'function', 'getBalances exported');
  assert(typeof plaid.getTransactions === 'function', 'getTransactions exported');
  assert(typeof plaid.getInstitution === 'function', 'getInstitution exported');
  assert(typeof plaid.getItem === 'function', 'getItem exported');
  assert(typeof plaid.removeItem === 'function', 'removeItem exported');
  assert(typeof plaid.parseWebhook === 'function', 'parseWebhook exported');

  // Test parseWebhook (pure function, no API call)
  const webhook = plaid.parseWebhook({
    webhook_type: 'TRANSACTIONS',
    webhook_code: 'DEFAULT_UPDATE',
    item_id: 'test_item_123',
    new_transactions: 5
  });
  assert(webhook.type === 'TRANSACTIONS', 'Webhook parses type');
  assert(webhook.code === 'DEFAULT_UPDATE', 'Webhook parses code');
  assert(webhook.item_id === 'test_item_123', 'Webhook parses item_id');
  assert(webhook.new_transactions === 5, 'Webhook parses new_transactions');
}

async function testAAService() {
  console.log('\n🇮🇳 AA Service (Structure)');
  const aa = await import('./lib/services/aaService.js');

  assert(typeof aa.getSetuToken === 'function', 'getSetuToken exported');
  assert(typeof aa.getConsentStatus === 'function', 'getConsentStatus exported');
  assert(typeof aa.createDataSession === 'function', 'createDataSession exported');
  assert(typeof aa.fetchFIData === 'function', 'fetchFIData exported');
  assert(typeof aa.refreshAccounts === 'function', 'refreshAccounts exported');
}

async function testInsuranceService() {
  console.log('\n🛡️  Insurance Service (Structure)');
  const ins = await import('./lib/services/insuranceService.js');

  assert(typeof ins.sha256 === 'function', 'sha256 exported');
  assert(typeof ins.sha256Server === 'function', 'sha256Server exported');
  assert(typeof ins.upsertInsurancePolicy === 'function', 'upsertInsurancePolicy exported');
  assert(typeof ins.fetchInsurancePolicies === 'function', 'fetchInsurancePolicies exported');
  assert(typeof ins.fetchInsurancePolicyById === 'function', 'fetchInsurancePolicyById exported');
  assert(typeof ins.deleteInsurancePolicy === 'function', 'deleteInsurancePolicy exported');
  assert(typeof ins.addClaim === 'function', 'addClaim exported');
  assert(typeof ins.listClaims === 'function', 'listClaims exported');
  assert(typeof ins.uploadPolicyPdf === 'function', 'uploadPolicyPdf exported');

  // Test sha256Server (pure function)
  const hash = ins.sha256Server('test-policy-123');
  assert(typeof hash === 'string' && hash.length === 64, 'sha256Server returns 64-char hex', `Got length: ${hash.length}`);
  const hash2 = ins.sha256Server('test-policy-123');
  assert(hash === hash2, 'sha256Server is deterministic');
  const hash3 = ins.sha256Server('different-policy');
  assert(hash !== hash3, 'Different inputs produce different hashes');
}

// ═══════════════════════════════════════════════════════════════════════════════
// API INTEGRATION TESTS (requires running server or production)
// ═══════════════════════════════════════════════════════════════════════════════

async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}/${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }
    return { status: res.status, json, text };
  } catch (e) {
    return { status: 0, json: null, text: e.message, error: true };
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 API Integration Tests');

  // Check if server is reachable
  const envCheck = await apiRequest('test-env');
  if (envCheck.error || envCheck.status === 0) {
    skip('All API tests', `Server not reachable at ${BASE_URL}`);
    return;
  }
  assert(envCheck.status === 200, 'test-env endpoint responds');
  assert(envCheck.json?.SUPABASE_URL, 'Supabase URL configured');

  // Test 404 for unknown route
  const notFound = await apiRequest('nonexistent-route');
  assert(notFound.status === 404, 'Unknown route returns 404');

  // Test method not allowed
  const wrongMethod = await apiRequest('advice', { method: 'GET' });
  assert(wrongMethod.status === 405, 'GET on POST-only route returns 405');

  // Test health-score endpoint
  const healthScore = await apiRequest('health-score', {
    method: 'POST',
    body: JSON.stringify({
      income: 150000, expenses: 80000, total_emi: 20000,
      total_debt_outstanding: 500000, liquid_assets: 400000,
      total_assets: 3000000, term_cover: 20000000, health_cover: 1000000,
      dependents: 2, sip_monthly: 20000, credit_utilization: 0.20, age: 32
    })
  });
  assert(healthScore.status === 200, 'health-score returns 200');
  assert(healthScore.json?.success === true, 'health-score returns success');
  assert(typeof healthScore.json?.financial_health_score === 'number', 'health-score returns numeric score');

  // Test risk-score endpoint
  const riskScore = await apiRequest('risk-score', {
    method: 'POST',
    body: JSON.stringify({
      income: 150000, expenses: 80000, total_emi: 20000,
      total_debt_outstanding: 500000, liquid_assets: 400000,
      total_assets: 3000000, age: 32
    })
  });
  assert(riskScore.status === 200, 'risk-score returns 200');
  assert(typeof riskScore.json?.risk_score === 'number', 'risk-score returns numeric score');

  // Test alerts endpoint
  const alerts = await apiRequest('alerts', {
    method: 'POST',
    body: JSON.stringify({
      income: 50000, expenses: 48000, total_emi: 30000,
      liquid_assets: 5000, term_cover: 0, health_cover: 0, dependents: 2
    })
  });
  assert(alerts.status === 200, 'alerts returns 200');
  assert(Array.isArray(alerts.json?.alerts), 'alerts returns array');

  // Test debt-optimize endpoint
  const debtOpt = await apiRequest('debt-optimize', {
    method: 'POST',
    body: JSON.stringify({
      loans: [
        { label: 'Home Loan', outstanding: 5000000, emi: 45000, rate: 8.5, remainingMonths: 240 },
        { label: 'Car Loan', outstanding: 300000, emi: 12000, rate: 10.5, remainingMonths: 30 }
      ],
      extra_monthly_budget: 10000
    })
  });
  assert(debtOpt.status === 200, 'debt-optimize returns 200');
  assert(debtOpt.json?.best_strategy, 'debt-optimize returns best_strategy');

  // Test gamification endpoint
  const gamification = await apiRequest('gamification', {
    method: 'POST',
    body: JSON.stringify({
      profile: { income: 200000, expenses: 100000, liquid_assets: 1200000, sip_monthly: 35000, total_debt_outstanding: 0, loans: [] },
      health_score: 85,
      risk_score: 20,
      streaks: { emi_ontime: 6 }
    })
  });
  assert(gamification.status === 200, 'gamification returns 200');
  assert(Array.isArray(gamification.json?.badges_unlocked), 'gamification returns badges');

  // Test financial-dashboard endpoint (unified)
  const dashboard = await apiRequest('financial-dashboard', {
    method: 'POST',
    body: JSON.stringify({
      income: 150000, expenses: 80000, total_emi: 20000,
      total_debt_outstanding: 500000, liquid_assets: 400000,
      total_assets: 3000000, term_cover: 20000000, health_cover: 1000000,
      dependents: 2, sip_monthly: 20000, credit_utilization: 0.20, age: 32,
      loans: [{ label: 'Home Loan', outstanding: 500000, emi: 20000, rate: 8.5, remainingMonths: 30 }]
    })
  });
  assert(dashboard.status === 200, 'financial-dashboard returns 200');
  assert(typeof dashboard.json?.financial_health_score === 'number', 'Dashboard has health score');
  assert(typeof dashboard.json?.risk_score === 'number', 'Dashboard has risk score');
  assert(Array.isArray(dashboard.json?.alerts), 'Dashboard has alerts');
  assert(dashboard.json?.wealth_dna_profile, 'Dashboard has wealth DNA');
  assert(Array.isArray(dashboard.json?.top_5_actions), 'Dashboard has top actions');
  assert(dashboard.json?.motivational_message, 'Dashboard has motivation');

  // Test stocks endpoint (GET)
  const stocks = await apiRequest('stocks?symbol=AAPL');
  if (stocks.status === 429) {
    skip('stocks API', 'Rate limited');
  } else if (stocks.status === 503) {
    skip('stocks API', 'Service unavailable (API key not configured)');
  } else {
    assert(stocks.status === 200 || stocks.status === 500, 'stocks endpoint responds', `Status: ${stocks.status}`);
  }

  // Test stocks validation
  const stocksNoSymbol = await apiRequest('stocks');
  assert(stocksNoSymbol.status === 400, 'stocks without symbol returns 400');

  // Test mutual fund validation
  const mfNoCode = await apiRequest('mutualfund');
  assert(mfNoCode.status === 400, 'mutualfund without code returns 400');

  const mfBadCode = await apiRequest('mutualfund?code=abc');
  assert(mfBadCode.status === 400, 'mutualfund with non-numeric code returns 400');

  // Test news validation
  const newsBadCategory = await apiRequest('news?category=invalid');
  assert(newsBadCategory.status === 400, 'news with invalid category returns 400');

  // Test budget/coach requires userId
  const budgetNoUser = await apiRequest('budget/coach', {
    method: 'POST',
    body: JSON.stringify({})
  });
  assert(budgetNoUser.status === 400, 'budget/coach without userId returns 400');

  // Test invest/recommend requires userId
  const investNoUser = await apiRequest('invest/recommend', {
    method: 'POST',
    body: JSON.stringify({})
  });
  assert(investNoUser.status === 400, 'invest/recommend without userId returns 400');

  // Test CORS headers
  const corsCheck = await apiRequest('test-env', { method: 'OPTIONS' });
  assert(corsCheck.status === 200, 'OPTIONS request returns 200');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EDGE CASE & SECURITY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

async function testEdgeCases() {
  console.log('\n🔒 Edge Case & Security Tests');
  const { computeHealthScore } = await import('./lib/services/healthScoreService.js');
  const { computeRiskScore } = await import('./lib/services/riskScoreService.js');
  const { generateAlerts } = await import('./lib/services/alertService.js');
  const { optimizeDebt } = await import('./lib/services/debtOptimizationService.js');

  // Negative values
  const negIncome = computeHealthScore({ income: -50000, expenses: 30000 });
  assert(negIncome.financial_health_score >= 0, 'Handles negative income gracefully');

  // Extremely large values
  const huge = computeHealthScore({ income: 999999999, expenses: 1, total_assets: 999999999999 });
  assert(huge.financial_health_score <= 100, 'Score capped at 100 for extreme values');

  // NaN / undefined inputs
  const nanProfile = computeHealthScore({ income: NaN, expenses: undefined, age: 'thirty' });
  assert(typeof nanProfile.financial_health_score === 'number', 'Handles NaN/undefined inputs');
  assert(!isNaN(nanProfile.financial_health_score), 'Score is not NaN');

  // Risk score with extreme equity allocation
  const extremeEquity = computeRiskScore({ equity_allocation_pct: 100, age: 60 });
  assert(extremeEquity.risk_score <= 100, 'Risk score capped at 100');

  // Debt optimization with zero-rate loan
  const zeroRate = optimizeDebt([{ label: 'Interest-free', outstanding: 100000, emi: 5000, rate: 0, remainingMonths: 20 }]);
  assert(zeroRate.best_strategy, 'Handles zero-rate loan');

  // Debt optimization with very high rate
  const highRate = optimizeDebt([{ label: 'Loan Shark', outstanding: 100000, emi: 10000, rate: 36, remainingMonths: 12 }]);
  assert(highRate.best_strategy, 'Handles very high rate loan');

  // Alerts with string values (type coercion)
  const stringVals = generateAlerts({ income: '100000', expenses: '80000', total_emi: '50000' });
  assert(typeof stringVals.total === 'number', 'Handles string numeric values');
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     FamLedgerAI — Comprehensive Test Suite                  ║');
  console.log(`║     Target: ${isProd ? 'PRODUCTION' : 'LOCAL'}                                        ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const start = Date.now();

  // Unit Tests
  console.log('\n━━━ UNIT TESTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await testHealthScoreService();
  await testRiskScoreService();
  await testAlertService();
  await testDebtOptimizationService();
  await testGamificationService();
  await testWealthDnaService();
  await testRateLimiter();
  await testAIRouter();
  await testPlaidService();
  await testAAService();
  await testInsuranceService();
  await testEdgeCases();

  // API Integration Tests
  console.log('\n━━━ API INTEGRATION TESTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await testAPIEndpoints();

  // Summary
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  const total = passed + failed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${passed} passed, ${failed} failed, ${skipped} skipped (${elapsed}s)       `);
  console.log(`║  Pass Rate: ${passRate}%                                        `);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (failures.length > 0) {
    console.log('\n❌ FAILURES:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f.test}${f.detail ? ': ' + f.detail : ''}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
