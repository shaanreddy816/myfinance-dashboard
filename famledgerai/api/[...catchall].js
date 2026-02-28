// api/[...catchall].js
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { callAIWithFallback } from './lib/aiRouter.js';
import { deterministicProjection } from './lib/deterministic.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api\//, '');

  // Merge URL search params into req.query (catch-all routes don't auto-parse them)
  if (!req.query) req.query = {};
  for (const [key, value] of url.searchParams) {
    req.query[key] = value;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (path === 'advice')                             return handleAdvice(req, res);
  if (path === 'nri/plan')                           return handleNriPlan(req, res);
  if (path === 'autopilot/plan')                     return handleAutopilot(req, res);
  if (path === 'family/insights')                    return handleFamily(req, res);
  if (path === 'invest/recommend')                   return handleInvest(req, res);
  if (path === 'budget/coach')                       return handleBudget(req, res);
  if (path === 'integrations/zerodha/callback')      return handleZerodhaCallback(req, res);
  if (path === 'integrations/zerodha/holdings')      return handleZerodhaHoldings(req, res);
  if (path === 'integrations/zerodha/mf-holdings')   return handleZerodhaHoldings(req, res);
  if (path === 'integrations/zerodha/mf-sips')       return handleZerodhaMfSips(req, res);

  // Optional test endpoint – remove in production if desired
  if (path === 'aa/create-consent')                  return handleAaCreateConsent(req, res);
  if (path === 'aa/consent-callback')                return handleAaConsentCallback(req, res);
  if (path === 'aa/fetch-accounts')                  return handleAaFetchAccounts(req, res);
  if (path === 'aa/refresh')                         return handleAaRefresh(req, res);
  if (path === 'accounts')                           return handleAccounts(req, res);

  if (path === 'test-env') {
    return res.status(200).json({
      message: 'Environment check',
      SUPABASE_URL: process.env.SUPABASE_URL || 'undefined',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'defined' : 'undefined',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? 'defined' : 'undefined',
      SETU_CLIENT_ID: process.env.SETU_CLIENT_ID ? 'defined' : 'undefined',
      SETU_CLIENT_SECRET: process.env.SETU_CLIENT_SECRET ? 'defined' : 'undefined',
      SETU_PRODUCT_ID: process.env.SETU_PRODUCT_ID || 'undefined',
      SETU_BASE_URL: process.env.SETU_BASE_URL || 'default',
      NODE_ENV: process.env.NODE_ENV,
    });
  }

  return res.status(404).json({ error: 'Not found' });
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

async function resolveUserId(userIdOrEmail) {
  if (!userIdOrEmail) return null;

  // Already looks like a UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrEmail)) {
    return userIdOrEmail;
  }

  // It's an email – look up the UUID
  const { data, error } = await supabase
    .from('user_data')
    .select('id')
    .eq('email', userIdOrEmail)
    .maybeSingle();

  if (error) {
    console.warn('resolveUserId lookup error:', error.message);
    return null;
  }

  return data?.id || null;
}

async function safeQuery(query) {
  const { data, error } = await query;
  if (error) console.warn('Supabase query warning:', error.message);
  return data ?? [];
}

// ─── ADVICE ────────────────────────────────────────────────────────────────────

async function handleAdvice(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const metrics = req.body;

  const prompt = `You are a certified financial advisor AI. Provide personalized financial advice for an Indian user based on the following metrics:
- Age: ${metrics.age}
- Occupation: ${metrics.occupation}
- Income range: ₹${metrics.incomeRange} lakhs/year
- Goals: ${(metrics.goals || []).join(', ') || 'Not specified'}
- Risk tolerance: ${metrics.risk}
- Monthly income: ₹${metrics.monthlyIncome}
- Monthly expenses: ₹${metrics.monthlyExpenses}
- Monthly savings: ₹${metrics.monthlySavings}
- Emergency fund ratio: ${(metrics.emergencyRatio || 0).toFixed(2)}
- Debt ratio: ${((metrics.debtRatio || 0) * 100).toFixed(1)}%
- Insurance cover ratio: ${(metrics.insuranceRatio || 0).toFixed(2)}
- Savings rate: ${((metrics.savingsRate || 0) * 100).toFixed(1)}%
- Government schemes enrolled: ${metrics.schemesCount}
- Financial health score: ${metrics.healthScore}/100

Return a JSON object with keys: summary, top_actions (array of {action, reason, priority}), plan_7_days (array of strings), plan_30_days (array of strings), disclaimer, confidence (0-1), missingData (array of strings).`;

  try {
    const advice = await callAIWithFallback(prompt, 'advisor');
    return res.status(200).json(advice);
  } catch (e) {
    console.error('Advice error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── NRI PLAN ──────────────────────────────────────────────────────────────────

async function handleNriPlan(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const {
    userId,
    country        = 'US',
    returnYear     = 2028,
    foreignIncome  = 0,
    indianIncome   = 0,
    assets         = 0,
    nreBalance     = 0,
    userProfile    = {},
    loans          = [],
    investments    = {}
  } = req.body;

  // Convert numeric strings to numbers (safe for .toLocaleString)
  const foreignIncomeNum = Number(foreignIncome) || 0;
  const indianIncomeNum  = Number(indianIncome)  || 0;
  const assetsNum        = Number(assets)        || 0;
  const nreBalanceNum    = Number(nreBalance)    || 0;
  const returnYearNum    = Number(returnYear)    || new Date().getFullYear() + 5;

  const yearsUntilReturn = Math.max(0, returnYearNum - new Date().getFullYear());
  const age              = (userProfile && userProfile.age) ? Number(userProfile.age) : 40;
  const projectionYears  = Math.min(yearsUntilReturn + 3, 10);

  const prompt = `You are a certified financial planner specializing in NRI (Non-Resident Indian) finances.
A person currently living in ${country} plans to return to India in ${returnYearNum} (${yearsUntilReturn} years away).

Financial profile:
- Age: ${age}
- Foreign annual income: ₹${foreignIncomeNum.toLocaleString('en-IN')} equivalent
- Expected Indian annual income after return: ₹${indianIncomeNum.toLocaleString('en-IN')}
- Total foreign assets: ₹${assetsNum.toLocaleString('en-IN')} equivalent
- NRE/NRO account balance: ₹${nreBalanceNum.toLocaleString('en-IN')}
- Active loans: ${JSON.stringify(loans)}
- Investments: ${JSON.stringify(investments)}
- Occupation: ${userProfile?.occupation || 'unknown'}
- Risk tolerance: ${userProfile?.risk || 'moderate'}

Provide a comprehensive NRI financial transition plan covering:
1. Tax implications: DTAA treaty benefits with ${country}, RNOR status window (2 years), FEMA repatriation rules, taxation of foreign income during RNOR period.
2. Investment strategy: what to keep abroad vs bring to India, timeline for portfolio rebalancing.
3. Account management: NRE/NRO account operations, how to repatriate funds efficiently.
4. Tax-saving post-return: ELSS under 80C, LTCG harvesting, HRA if applicable.
5. Year-wise cashflow projection for next ${projectionYears} years (from ${new Date().getFullYear()} to ${new Date().getFullYear() + projectionYears - 1}).

Return ONLY a valid JSON object with EXACTLY these keys (no markdown, no explanation outside JSON):
{
  "taxNotes": "comprehensive paragraph on tax planning including DTAA, RNOR, FEMA",
  "investmentSuggestions": ["detailed suggestion 1", "detailed suggestion 2", "detailed suggestion 3", "detailed suggestion 4", "detailed suggestion 5"],
  "repatriationSteps": ["step 1 with specifics", "step 2", "step 3", "step 4"],
  "cashflowProjection": [
    { "year": ${new Date().getFullYear()}, "inflow": 5000000, "outflow": 2000000, "net": 3000000, "note": "Current year - abroad" },
    { "year": ${new Date().getFullYear() + 1}, "inflow": 5200000, "outflow": 2100000, "net": 3100000, "note": "Year 2" }
  ],
  "why": "2-3 sentence explanation of why this plan suits this person",
  "confidence": 0.75,
  "missingData": ["list of data points that would improve plan accuracy"]
}`;

  try {
    const aiResponse = await callAIWithFallback(prompt, 'nri_plan');
    return res.status(200).json(aiResponse);
  } catch (e) {
    console.error('NRI plan error:', e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}

// ─── AUTOPILOT ─────────────────────────────────────────────────────────────────

async function handleAutopilot(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, scenario = 'retirement' } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const isEmail = userIdOrEmail => userIdOrEmail.includes('@');

    let userData = null;
    if (isEmail(userId)) {
      const { data } = await supabase
        .from('user_data')
        .select('loans, investments, profile')
        .eq('email', userId)
        .maybeSingle();
      userData = data;
    }

    let loans       = userData?.loans       || [];
    let investments = userData?.investments  || {};
    let profileData = userData?.profile      || {};

    const investArray = [
      ...(investments.mutualFunds || []).map(f => ({ value: f.value || 0 })),
      ...(investments.stocks      || []).map(f => ({ value: f.value || 0 })),
      ...(investments.fd          || []).map(f => ({ value: f.value || 0 })),
      ...(investments.ppf         || []).map(f => ({ value: f.value || 0 })),
    ];

    const loansNorm = loans.map(l => ({
      emi:         l.emi         || 0,
      outstanding: l.outstanding || 0,
      label:       l.label       || ''
    }));

    const profiles = [{
      income_monthly:   (profileData.income?.husband || 0) + (profileData.income?.wife || 0) + (profileData.income?.rental || 0),
      monthly_expenses: 0,
      age:              profileData.age || 35
    }];

    const deterministic = deterministicProjection({
      loans:       loansNorm,
      investments: investArray,
      profiles,
      goals:       [],
      scenario
    });

    const scenarioNote = {
      retirement:   'targeting retirement at age 60 with 25x annual expense corpus',
      optimistic:   'assuming 12% annual returns and 30% income growth',
      conservative: 'assuming 7% returns with current income levels'
    }[scenario] || '';

    const prompt = `You are a financial planning AI. Based on the following deterministic financial projections for an Indian investor, provide a concise action plan.

Scenario: ${scenario} (${scenarioNote})
Projections: ${JSON.stringify(deterministic.summary)}
Detail: ${JSON.stringify(deterministic.details)}

Provide 3-5 specific, actionable steps to improve this person's financial position.

Return ONLY valid JSON with these keys:
{
  "summary": "2-3 sentence executive summary of their financial situation and trajectory",
  "actions": [
    { "step": "Action title", "amount": 5000, "reason": "Why this matters and expected impact" }
  ],
  "schedule": [
    { "month": 1, "action": "Start SIP of ₹5,000 in large-cap index fund", "amount": 5000 },
    { "month": 2, "action": "Review and top-up emergency fund", "amount": 10000 }
  ],
  "why": "Brief explanation of the overall strategy",
  "confidence": 0.75,
  "missingData": ["income data", "expense breakdown"]
}`;

    const aiResponse = await callAIWithFallback(prompt, 'autopilot_plan');
    return res.status(200).json({ projections: deterministic, ...aiResponse });
  } catch (e) {
    console.error('Autopilot error:', e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}

// ─── FAMILY INSIGHTS ───────────────────────────────────────────────────────────

async function handleFamily(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, profileIds } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const isEmail = s => typeof s === 'string' && s.includes('@');

    let allProfiles = [];
    let userRecord  = null;

    if (isEmail(userId)) {
      const { data } = await supabase
        .from('user_data')
        .select('*')
        .eq('email', userId)
        .maybeSingle();
      userRecord = data;
    }

    if (userRecord) {
      const profile  = userRecord.profile     || {};
      const income   = userRecord.income       || {};
      const expenses = userRecord.expenses     || {};
      const loans    = userRecord.loans        || [];
      const ins      = userRecord.insurance    || {};

      const members = [];

      if (income.husband > 0) {
        members.push({
          name:             profile.name || 'Self',
          income_monthly:   income.husband || 0,
          monthly_expenses: (expenses.monthly || []).reduce((s, e) => s + (e.v || 0), 0) * 0.6,
          age:              profile.age || 35,
          occupation:       profile.occupation || 'salaried'
        });
      }
      if (income.wife > 0) {
        members.push({
          name:             'Spouse',
          income_monthly:   income.wife || 0,
          monthly_expenses: (expenses.monthly || []).reduce((s, e) => s + (e.v || 0), 0) * 0.4,
          age:              (profile.age || 35) - 2,
          occupation:       'salaried'
        });
      }

      if (members.length === 0) {
        members.push({
          name:             profile.name || 'User',
          income_monthly:   (income.husband || 0) + (income.wife || 0),
          monthly_expenses: (expenses.monthly || []).reduce((s, e) => s + (e.v || 0), 0),
          age:              profile.age || 35,
          occupation:       profile.occupation || 'unknown'
        });
      }

      const totalIncome   = members.reduce((s, p) => s + p.income_monthly, 0);
      const totalExpenses = members.reduce((s, p) => s + p.monthly_expenses, 0);
      const totalEmi      = loans.reduce((s, l) => s + (l.emi || 0), 0);
      const savings       = totalIncome - totalExpenses - totalEmi;

      const termCover  = (ins.term    || []).reduce((s, p) => s + (p.cover || 0), 0);
      const healthCover= (ins.health  || []).reduce((s, p) => s + (p.cover || 0), 0);

      const prompt = `You are a family financial advisor AI. Analyse this family's finances and provide insights.

Family members: ${JSON.stringify(members)}

Aggregate figures:
- Combined monthly income: ₹${totalIncome.toLocaleString('en-IN')}
- Combined monthly expenses: ₹${totalExpenses.toLocaleString('en-IN')}
- Total EMI burden: ₹${totalEmi.toLocaleString('en-IN')}
- Monthly savings: ₹${savings.toLocaleString('en-IN')}
- Term insurance cover: ₹${termCover.toLocaleString('en-IN')}
- Health insurance cover: ₹${healthCover.toLocaleString('en-IN')}
- Active loans: ${loans.length}

Identify financial gaps in: insurance coverage, emergency fund, education planning, retirement readiness.
Give specific, actionable recommendations for each family member.

Return ONLY valid JSON with these keys:
{
  "summary": "2-3 sentence overview of family financial health",
  "gaps": [
    { "member": "Self", "issue": "Insufficient health cover", "action": "Increase health cover to ₹20 lakh" },
    { "member": "Spouse", "issue": "No term insurance", "action": "Buy ₹1Cr term plan" }
  ],
  "recommendations": ["Specific recommendation 1", "Specific recommendation 2", "Specific recommendation 3"],
  "why": "Brief explanation of analysis approach",
  "confidence": 0.75,
  "missingData": ["education fund data", "child profiles"]
}`;

      const aiResponse = await callAIWithFallback(prompt, 'family_insights');
      return res.status(200).json({
        aggregateIncome:   totalIncome,
        aggregateExpenses: totalExpenses,
        savings,
        perMember:         members,
        ...aiResponse
      });
    }

    return res.status(200).json({
      aggregateIncome:   0,
      aggregateExpenses: 0,
      savings:           0,
      perMember:         [],
      summary:           'No family data found. Please complete your profile and add income/expense data.',
      gaps:              [],
      recommendations:   ['Complete your profile in Settings', 'Add income sources', 'Add monthly expenses'],
      why:               'Data not yet available.',
      confidence:        0.1,
      missingData:       ['profile', 'income', 'expenses']
    });

  } catch (e) {
    console.error('Family insights error:', e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}

// ─── INVEST RECOMMEND ──────────────────────────────────────────────────────────

async function handleInvest(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, profileId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    let riskScore  = 5;
    let horizon    = 'medium';
    let holdings   = [];
    let goals      = [];

    const isEmail = s => typeof s === 'string' && s.includes('@');
    if (isEmail(userId)) {
      const { data } = await supabase
        .from('user_data')
        .select('profile, investments')
        .eq('email', userId)
        .maybeSingle();

      if (data) {
        const riskMap = { low: 3, moderate: 5, high: 8 };
        riskScore = riskMap[data.profile?.risk] || 5;
        horizon   = data.profile?.goals?.includes('retirement') ? 'long' :
                    data.profile?.goals?.includes('house') ? 'medium' : 'medium';

        const inv = data.investments || {};
        holdings = [
          ...(inv.mutualFunds || []).map(f => ({ type: 'mutual_fund', name: f.name, value: f.value })),
          ...(inv.stocks      || []).map(f => ({ type: 'stock', name: f.name, value: f.value })),
          ...(inv.fd          || []).map(f => ({ type: 'fd', name: f.name, value: f.value })),
          ...(inv.ppf         || []).map(f => ({ type: 'ppf', name: f.name, value: f.value })),
        ];
        goals = data.profile?.goals || [];
      }
    } else {
      const riskData = await safeQuery(
        supabase.from('risk_profiles').select('*')
          .eq('user_id', userId).eq('profile_id', profileId || '')
          .order('calculated_at', { ascending: false }).limit(1).maybeSingle()
      );
      holdings = await safeQuery(
        supabase.from('portfolio_holdings').select('*').eq('user_id', userId)
      );
      goals = await safeQuery(
        supabase.from('goals').select('*').eq('user_id', userId)
      );
      riskScore = riskData?.risk_score || 5;
      horizon   = riskData?.time_horizon || 'medium';
    }

    const prompt = `You are an investment advisor AI for Indian investors.

Client profile:
- Risk score (1-10): ${riskScore}
- Investment horizon: ${horizon}
- Current holdings: ${JSON.stringify(holdings)}
- Financial goals: ${JSON.stringify(goals)}

Recommend a diversified portfolio for an Indian investor. Consider:
- SEBI-registered mutual funds (direct plans via MFCentral/Zerodha Coin)
- Equity: large-cap, mid-cap, flexi-cap index funds
- Debt: corporate bond funds, gilt funds
- Gold: Sovereign Gold Bonds or gold ETFs
- Tax implications: ELSS for 80C, LTCG/STCG on equity

Return ONLY valid JSON:
{
  "allocation": { "equity": 60, "debt": 25, "gold": 10, "cash": 5 },
  "recommendations": [
    {
      "assetClass": "equity",
      "category": "large-cap index",
      "example": "Nifty 50 Index Fund (Direct)",
      "reason": "Low-cost market exposure with proven long-term returns"
    }
  ],
  "why": "Explanation of strategy",
  "confidence": 0.8,
  "missingData": []
}`;

    const aiResponse = await callAIWithFallback(prompt, 'invest_recommend');

    supabase.from('ai_advice_logs').insert({
      user_id:          userId,
      module:           'invest_recommend',
      response_summary: aiResponse.why,
      confidence_score: aiResponse.confidence,
      missing_data:     aiResponse.missingData
    }).then(() => {}).catch(() => {});

    return res.status(200).json(aiResponse);
  } catch (e) {
    console.error('Invest recommend error:', e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}

// ─── BUDGET COACH ──────────────────────────────────────────────────────────────

async function handleBudget(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const isEmail = s => typeof s === 'string' && s.includes('@');
    let totalIncome    = 0;
    let totalExpenses  = 0;
    let categoryBreakdown = [];
    let savingsRate    = 0;

    if (isEmail(userId)) {
      const { data } = await supabase
        .from('user_data')
        .select('income, expenses, loans')
        .eq('email', userId)
        .maybeSingle();

      if (data) {
        const inc  = data.income   || {};
        const exp  = data.expenses || {};
        const loans= data.loans    || [];

        totalIncome   = (inc.husband || 0) + (inc.wife || 0) + (inc.rentalActive ? (inc.rental || 0) : 0);
        totalExpenses = (exp.monthly || []).reduce((s, e) => s + (e.v || 0), 0);
        const totalEmi= loans.reduce((s, l) => s + (l.emi || 0), 0);
        savingsRate   = totalIncome ? (totalIncome - totalExpenses - totalEmi) / totalIncome : 0;

        categoryBreakdown = (exp.monthly || []).map(e => ({
          category: e.label,
          spent:    e.v || 0,
          budget:   (e.v || 0) * 1.1,
          status:   'green'
        }));
      }
    } else {
      const transactions = await safeQuery(
        supabase.from('transactions').select('*').eq('user_id', userId)
          .gte('transaction_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
      );
      const budgets = await safeQuery(
        supabase.from('budgets').select('*').eq('user_id', userId)
      );

      totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      savingsRate   = totalIncome ? (totalIncome - totalExpenses) / totalIncome : 0;

      const categorySpent = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
      });
      categoryBreakdown = budgets.map(b => {
        const spent = categorySpent[b.category] || 0;
        return {
          category: b.category,
          spent,
          budget:   b.amount,
          status:   spent > b.amount ? 'red' : spent > b.amount * 0.8 ? 'yellow' : 'green'
        };
      });
    }

    const prompt = `You are a budget coaching AI for an Indian family.

Monthly finances:
- Income: ₹${totalIncome.toLocaleString('en-IN')}
- Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
- Savings rate: ${(savingsRate * 100).toFixed(1)}%
- Category breakdown: ${JSON.stringify(categoryBreakdown)}

Provide 3 specific, actionable budgeting suggestions. Consider Indian context: SIP investments, PPF contributions, emergency fund building, and typical Indian family expenses.

Return ONLY valid JSON:
{
  "suggestions": [
    { "action": "Specific action", "reason": "Why this helps and expected saving/benefit", "priority": "high" }
  ],
  "missingData": ["what data would help refine these suggestions"],
  "confidence": 0.8
}`;

    const aiResponse = await callAIWithFallback(prompt, 'budget_coach');

    supabase.from('ai_advice_logs').insert({
      user_id:          userId,
      module:           'budget_coach',
      response_summary: aiResponse.suggestions?.[0]?.action,
      confidence_score: aiResponse.confidence || 0.8,
      missing_data:     aiResponse.missingData
    }).then(() => {}).catch(() => {});

    return res.status(200).json({
      analysis: { totalIncome, totalExpenses, savingsRate, categoryBreakdown },
      suggestions:   aiResponse.suggestions || [],
      why:           'Based on your income and expense patterns.',
      confidence:    aiResponse.confidence || 0.8,
      missingData:   aiResponse.missingData || []
    });
  } catch (e) {
    console.error('Budget coach error:', e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}

// ─── ZERODHA ───────────────────────────────────────────────────────────────────

/**
 * Enhanced callback that uses the 'state' parameter to identify the user
 * and stores the access token in the Supabase 'integrations' table.
 */
async function handleZerodhaCallback(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { request_token, user_email } = req.query;
  const userEmail = user_email || req.query.state;  // fallback to state for safety
  console.log('Zerodha callback query:', JSON.stringify(req.query));
  const apiKey    = process.env.KITE_API_KEY;
  const apiSecret = process.env.KITE_API_SECRET;

  if (!apiKey || !apiSecret) return res.status(500).send('Missing KITE_API_KEY or KITE_API_SECRET');
  if (!request_token)        return res.status(400).send('Missing request_token');
  if (!userEmail)            return res.status(400).send('Missing user_email. Query: ' + JSON.stringify(req.query));

  try {
    const checksum = crypto.createHash('sha256')
      .update(apiKey + request_token + apiSecret)
      .digest('hex');

    const response = await fetch('https://api.kite.trade/session/token', {
      method:  'POST',
      headers: { 'X-Kite-Version': '3', 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({ api_key: apiKey, request_token, checksum })
    });
    const data = await response.json();

    if (data.status === 'success') {
      const accessToken = data.data.access_token;

      // Delete existing row first, then insert (avoids onConflict issues)
      await supabase.from('integrations')
        .delete()
        .eq('user_id', userEmail)
        .eq('provider', 'zerodha');

      const { error } = await supabase
        .from('integrations')
        .insert({
          user_id: userEmail,
          provider: 'zerodha',
          access_token: accessToken,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store Zerodha token:', JSON.stringify(error));
        return res.status(500).send('Failed to store token: ' + error.message);
      }

      return res.redirect(`https://famledgerai.com/zerodha-success.html?status=success`);
    }
    return res.status(400).send(`Kite API error: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('Callback error:', error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
}

async function handleZerodhaHoldings(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'zerodha')
      .maybeSingle();

    if (!integration) return res.status(404).json({ error: 'Zerodha not connected' });

    const authHeader = {
      'X-Kite-Version': '3',
      'Authorization':  `token ${process.env.KITE_API_KEY}:${integration.access_token}`
    };

    // Fetch both equity and MF holdings in parallel
    const [equityRes, mfRes] = await Promise.all([
      fetch('https://api.kite.trade/portfolio/holdings', { headers: authHeader }),
      fetch('https://api.kite.trade/mf/holdings', { headers: authHeader })
    ]);

    const equityData = await equityRes.json();
    const mfData     = await mfRes.json();

    // If token is expired/invalid, tell frontend to re-auth
    if (equityData.error_type === 'TokenException' || mfData.error_type === 'TokenException') {
      // Clear stale token
      await supabase.from('integrations').delete()
        .eq('user_id', userId).eq('provider', 'zerodha').catch(() => {});
      return res.status(401).json({ error: 'Zerodha session expired. Please reconnect.', needsReauth: true });
    }

    const holdings = [];

    // Equity holdings
    if (equityData.status === 'success' && equityData.data) {
      for (const stock of equityData.data) {
        holdings.push({
          source:         'zerodha',
          asset_type:     'stock',
          fund_name:      stock.tradingsymbol,
          quantity:       stock.quantity,
          purchase_price: stock.average_price,
          current_price:  stock.last_price,
          pnl:            stock.pnl,
          last_synced:    new Date().toISOString()
        });
      }
    }

    // MF holdings
    if (mfData.status === 'success' && mfData.data) {
      for (const fund of mfData.data) {
        holdings.push({
          source:         'zerodha',
          asset_type:     'mutual_fund',
          fund_name:      fund.tradingsymbol || fund.scheme,
          quantity:       fund.quantity,
          purchase_price: fund.average_price,
          current_price:  fund.last_price,
          pnl:            fund.pnl,
          last_synced:    new Date().toISOString()
        });
      }
    }

    return res.status(200).json(holdings);
  } catch (error) {
    console.error('Holdings fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleZerodhaMfSips(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'zerodha')
      .maybeSingle();

    if (!integration) return res.status(404).json({ error: 'Zerodha not connected' });

    const response = await fetch('https://api.kite.trade/mf/sips', {
      headers: {
        'X-Kite-Version': '3',
        'Authorization':  `token ${process.env.KITE_API_KEY}:${integration.access_token}`
      }
    });
    const data = await response.json();
    if (data.status !== 'success') return res.status(500).json({ error: 'Zerodha API error', details: data });

    const sips = data.data.map(sip => ({
      fund_name:        sip.scheme,
      status:           sip.status,
      next_instalment:  sip.next_instalment,
      frequency:        sip.frequency,
      amount:           sip.amount
    }));

    return res.status(200).json(sips);
  } catch (error) {
    console.error('SIPs fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── SETU ACCOUNT AGGREGATOR ───────────────────────────────────────────────────

const SETU_BASE_URL        = process.env.SETU_BASE_URL      || 'https://fiu-uat.setu.co';
const SETU_CLIENT_ID       = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET   = process.env.SETU_CLIENT_SECRET;
const SETU_PRODUCT_ID      = process.env.SETU_PRODUCT_ID;
const APP_BASE_URL         = process.env.APP_BASE_URL       || 'https://famledgerai.com';

async function getSetuToken() {
  // Setu auth is at a separate service, not on the FIU domain
  const tokenUrl = 'https://accountservice.setu.co/v1/users/login';
  console.log('Fetching Setu token from:', tokenUrl);
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'client': 'bridge'
    },
    body: JSON.stringify({ clientID: SETU_CLIENT_ID, secret: SETU_CLIENT_SECRET, grant_type: 'client_credentials' })
  });
  const responseText = await res.text();
  console.log('Setu token response:', res.status, responseText.substring(0, 300));
  if (!res.ok) throw new Error(`Setu token error ${res.status}: ${responseText.substring(0, 500)}`);
  const d = JSON.parse(responseText);
  const token = d.access_token || d.accessToken || d.token;
  if (!token) throw new Error(`No token in response: ${responseText.substring(0, 300)}`);
  return token;
}

function setuHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'x-product-instance-id': SETU_PRODUCT_ID
  };
}

async function handleAaCreateConsent(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  if (!SETU_CLIENT_ID || !SETU_CLIENT_SECRET)
    return res.status(500).json({ error: 'Setu credentials not configured.' });
  if (!SETU_PRODUCT_ID)
    return res.status(500).json({ error: 'SETU_PRODUCT_ID not configured.' });
  try {
    const accessToken = await getSetuToken();
    const now = new Date();

    // Setu v2 consent body format (per docs.setu.co)
    const consentBody = {
      redirectUrl: `${APP_BASE_URL}/api/aa/consent-callback`,
      consentDuration: {
        unit: 'MONTH',
        value: 12
      },
      dataRange: {
        from: new Date(now.getTime() - 2 * 365 * 24 * 3600 * 1000).toISOString(),
        to: now.toISOString()
      },
      context: []
    };

    console.log('Creating Setu consent:', JSON.stringify(consentBody));

    const cr = await fetch(`${SETU_BASE_URL}/consents`, {
      method: 'POST',
      headers: setuHeaders(accessToken),
      body: JSON.stringify(consentBody)
    });

    const responseText = await cr.text();
    console.log('Setu consent response:', cr.status, responseText.substring(0, 500));

    if (!cr.ok) throw new Error(`Setu error ${cr.status}: ${responseText.substring(0, 500)}`);

    const cd = JSON.parse(responseText);
    const consentId  = cd.id || cd.ConsentHandle;
    const consentUrl = cd.url;
    if (!consentId || !consentUrl) throw new Error(`Missing id/url in response: ${responseText.substring(0, 300)}`);

    await supabase.from('aa_consents').insert({
      user_id: userId, consent_id: consentId, status: 'PENDING',
      consent_detail: cd, created_at: new Date().toISOString()
    }).catch(() => {});

    return res.status(200).json({ consentId, consentUrl });
  } catch (e) {
    console.error('AA create-consent error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

async function handleAaConsentCallback(req, res) {
  const { consentId, status } = req.query;
  if (!consentId) return res.redirect(`${APP_BASE_URL}/?error=missing_consent_id`);
  if (status === 'REJECTED') {
    await supabase.from('aa_consents').update({ status: 'REJECTED', updated_at: new Date().toISOString() }).eq('consent_id', consentId).catch(()=>{});
    return res.redirect(`${APP_BASE_URL}/?page=accounts&error=consent_rejected`);
  }
  try {
    const accessToken = await getSetuToken();
    const dr = await fetch(`${SETU_BASE_URL}/api/v2/consents/${consentId}`, {
      headers: setuHeaders(accessToken)
    });
    const detail = dr.ok ? await dr.json() : {};
    await supabase.from('aa_consents').upsert({
      consent_id: consentId, status: detail.status || 'ACTIVE',
      consent_artefact: detail.consentArtefact, consent_detail: detail,
      updated_at: new Date().toISOString()
    }, { onConflict: 'consent_id' }).catch(()=>{});
    return res.redirect(`${APP_BASE_URL}/?page=accounts&consent=success`);
  } catch(e) { return res.redirect(`${APP_BASE_URL}/?page=accounts&error=callback_failed`); }
}

async function handleAaFetchAccounts(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const { data: consents } = await supabase.from('aa_consents').select('*')
      .eq('user_id', userId).eq('status', 'ACTIVE')
      .order('created_at', { ascending: false }).limit(1);
    if (!consents || consents.length === 0)
      return res.status(200).json({ accounts: [], needsConsent: true });
    const { data: accounts } = await supabase.from('accounts').select('*').eq('user_id', userId);
    return res.status(200).json({ accounts: accounts || [], consentId: consents[0].consent_id });
  } catch(e) { return res.status(500).json({ error: e.message, accounts: [] }); }
}

async function handleAaRefresh(req, res) {
  return res.status(200).json({ message: 'Refresh scheduled', refreshed: 0 });
}

async function handleAccounts(req, res) {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const { data: accounts } = await supabase.from('accounts').select('*').eq('user_id', userId);
    return res.status(200).json(accounts || []);
  } catch(e) { return res.status(200).json([]); }
}