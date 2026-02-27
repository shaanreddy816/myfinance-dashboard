// test-api.js — Run with: node test-api.js
// Make sure your Vercel dev server is running: npx vercel dev

const BASE = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com'; // use a real email from your Supabase auth

const tests = [];
let passed = 0;
let failed = 0;

async function test(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const ms = Date.now() - start;
    console.log(`✅ PASS [${ms}ms] ${name}`);
    passed++;
  } catch (e) {
    const ms = Date.now() - start;
    console.error(`❌ FAIL [${ms}ms] ${name}`);
    console.error('   ', e.message);
    failed++;
  }
}

async function post(path, body) {
  const res = await fetch(`${BASE}/api/${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function assertKey(obj, key) {
  if (!(key in obj)) throw new Error(`Missing key "${key}" in response: ${JSON.stringify(obj).substring(0, 200)}`);
}

// ─── TESTS ─────────────────────────────────────────────────────────────────────

tests.push(['NRI Plan — basic', async () => {
  const data = await post('nri/plan', {
    userId:       TEST_EMAIL,
    country:      'US',
    returnYear:   2028,
    foreignIncome: 5000000,
    indianIncome:  2500000,
    assets:        10000000,
    nreBalance:    500000,
    userProfile:  { age: 40, risk: 'moderate', occupation: 'salaried' }
  });
  assertKey(data, 'taxNotes');
  assertKey(data, 'investmentSuggestions');
  assertKey(data, 'repatriationSteps');
  assertKey(data, 'cashflowProjection');
  assertKey(data, 'confidence');
  if (!Array.isArray(data.investmentSuggestions)) throw new Error('investmentSuggestions should be array');
  if (!Array.isArray(data.repatriationSteps))     throw new Error('repatriationSteps should be array');
  if (!Array.isArray(data.cashflowProjection))    throw new Error('cashflowProjection should be array');
  console.log(`   → taxNotes: ${data.taxNotes?.substring(0, 80)}…`);
  console.log(`   → confidence: ${data.confidence}`);
  console.log(`   → suggestions: ${data.investmentSuggestions?.length}`);
}]);

tests.push(['Autopilot Plan — empty user', async () => {
  const data = await post('autopilot/plan', {
    userId:   TEST_EMAIL,
    scenario: 'retirement'
  });
  assertKey(data, 'summary');
  assertKey(data, 'actions');
  assertKey(data, 'projections');
  if (!Array.isArray(data.actions)) throw new Error('actions should be array');
  console.log(`   → summary: ${data.summary?.substring(0, 80)}…`);
  console.log(`   → actions: ${data.actions?.length}`);
}]);

tests.push(['Autopilot Plan — optimistic scenario', async () => {
  const data = await post('autopilot/plan', {
    userId:   TEST_EMAIL,
    scenario: 'optimistic'
  });
  assertKey(data, 'summary');
  assertKey(data, 'projections');
}]);

tests.push(['Family Insights — empty profileIds', async () => {
  const data = await post('family/insights', {
    userId:     TEST_EMAIL,
    profileIds: []
  });
  assertKey(data, 'summary');
  assertKey(data, 'aggregateIncome');
  assertKey(data, 'aggregateExpenses');
  assertKey(data, 'savings');
  assertKey(data, 'gaps');
  assertKey(data, 'recommendations');
  if (!Array.isArray(data.gaps))            throw new Error('gaps should be array');
  if (!Array.isArray(data.recommendations)) throw new Error('recommendations should be array');
  console.log(`   → summary: ${data.summary?.substring(0, 80)}…`);
  console.log(`   → gaps: ${data.gaps?.length}`);
}]);

tests.push(['Budget Coach — email user', async () => {
  const data = await post('budget/coach', {
    userId: TEST_EMAIL
  });
  assertKey(data, 'suggestions');
  assertKey(data, 'analysis');
  assertKey(data, 'confidence');
  if (!Array.isArray(data.suggestions)) throw new Error('suggestions should be array');
  console.log(`   → suggestions: ${data.suggestions?.length}`);
  console.log(`   → confidence: ${data.confidence}`);
}]);

tests.push(['AI Advisor — full metrics', async () => {
  const data = await post('advice', {
    age:             40,
    occupation:      'salaried',
    incomeRange:     '12-25',
    goals:           ['retirement', 'house'],
    risk:            'moderate',
    monthlyIncome:   150000,
    monthlyExpenses: 80000,
    monthlySavings:  70000,
    emergencyRatio:  0.5,
    debtRatio:       0.2,
    insuranceRatio:  0.8,
    savingsRate:     0.47,
    schemesCount:    1,
    totalInvested:   500000,
    healthScore:     65
  });
  assertKey(data, 'summary');
  assertKey(data, 'top_actions');
  assertKey(data, 'plan_7_days');
  assertKey(data, 'plan_30_days');
  assertKey(data, 'disclaimer');
  if (!Array.isArray(data.top_actions))  throw new Error('top_actions should be array');
  if (!Array.isArray(data.plan_7_days))  throw new Error('plan_7_days should be array');
  if (!Array.isArray(data.plan_30_days)) throw new Error('plan_30_days should be array');
  console.log(`   → summary: ${data.summary?.substring(0, 80)}…`);
  console.log(`   → actions: ${data.top_actions?.length}`);
}]);

tests.push(['Invest Recommend — email user', async () => {
  const data = await post('invest/recommend', {
    userId:    TEST_EMAIL,
    profileId: null
  });
  assertKey(data, 'allocation');
  assertKey(data, 'recommendations');
  assertKey(data, 'why');
  assertKey(data, 'confidence');
  if (!Array.isArray(data.recommendations)) throw new Error('recommendations should be array');
  const alloc = data.allocation;
  const total = (alloc.equity || 0) + (alloc.debt || 0) + (alloc.gold || 0) + (alloc.cash || 0);
  if (total < 90 || total > 110) throw new Error(`Allocation percentages don't add up to ~100: ${total}`);
  console.log(`   → allocation: equity=${alloc.equity}% debt=${alloc.debt}% gold=${alloc.gold}% cash=${alloc.cash}%`);
}]);

tests.push(['404 route', async () => {
  const res = await fetch(`${BASE}/api/nonexistent/route`);
  const data = await res.json();
  if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  if (!data.error) throw new Error('Expected error message in 404 response');
}]);

tests.push(['CORS headers present', async () => {
  const res = await fetch(`${BASE}/api/nri/plan`, {
    method:  'OPTIONS',
    headers: { 'Origin': 'http://localhost:5173' }
  });
  if (res.status !== 200) throw new Error(`OPTIONS returned ${res.status}`);
  const cors = res.headers.get('access-control-allow-origin');
  if (!cors) throw new Error('Missing Access-Control-Allow-Origin header');
}]);

// ─── RUN ───────────────────────────────────────────────────────────────────────

console.log(`\n🧪 FamLedgerAI API Test Suite`);
console.log(`   Base URL: ${BASE}`);
console.log(`   Test user: ${TEST_EMAIL}`);
console.log(`   Running ${tests.length} tests...\n`);

(async () => {
  for (const [name, fn] of tests) {
    await test(name, fn);
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log(`\n💡 Common fixes:`);
    console.log(`   • "fetch is not defined" → add: import fetch from 'node-fetch'  (Node < 18)`);
    console.log(`   • HTTP 500 → check your .env.local has ANTHROPIC_API_KEY or other AI key`);
    console.log(`   • HTTP 500 → check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set`);
    console.log(`   • "All AI attempts failed" → AI keys invalid/out of credits, mock data will be used`);
    process.exit(1);
  }
  console.log(`\n🎉 All tests passed!`);
})();
