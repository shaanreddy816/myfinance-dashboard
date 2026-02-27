// api/lib/aiRouter.js

export async function callAIWithFallback(prompt, module) {
  const provider   = process.env.AI_PROVIDER || 'anthropic';
  const maxRetries = 2;
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      if (provider === 'anthropic') {
        return await callAnthropic(prompt);
      } else if (provider === 'openai') {
        return await callOpenAI(prompt);
      } else if (provider === 'gemini') {
        return await callGemini(prompt);
      } else {
        throw new Error('Unknown AI provider: ' + provider);
      }
    } catch (err) {
      lastError = err;
      console.warn(`AI call attempt ${i + 1} failed for module "${module}":`, err.message);
      if (i === maxRetries) break;
      // Exponential backoff: 1s, 2s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  // All providers failed — try fallback provider once
  try {
    if (provider !== 'openai' && process.env.OPENAI_API_KEY) {
      console.warn('Primary AI failed, trying OpenAI fallback...');
      return await callOpenAI(prompt);
    }
    if (provider !== 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      console.warn('Primary AI failed, trying Anthropic fallback...');
      return await callAnthropic(prompt);
    }
  } catch (fallbackErr) {
    console.error('Fallback AI also failed:', fallbackErr.message);
  }

  console.error('All AI attempts failed, serving mock advice for module:', module);
  return getMockAdvice(module);
}

// ─── PROVIDERS ─────────────────────────────────────────────────────────────────

async function callAnthropic(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-api-key':       process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model:      'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic HTTP ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  // Log token usage to help monitor costs
  if (data.usage) {
    console.log(`Anthropic tokens — input: ${data.usage.input_tokens}, output: ${data.usage.output_tokens}`);
  }

  const text = data.content?.[0]?.text || '';
  return extractJSON(text, 'Anthropic');
}

async function callOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model:       'gpt-4o-mini',   // cheaper than gpt-4, still very capable
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }  // enforce JSON output
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI HTTP ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  if (data.usage) {
    console.log(`OpenAI tokens — prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens}`);
  }

  const text = data.choices?.[0]?.message?.content || '';
  return extractJSON(text, 'OpenAI');
}

async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const model    = 'gemini-1.5-flash'; // fast and cheap
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 1500,
        responseMimeType: 'application/json'  // Gemini 1.5 supports JSON mode
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return extractJSON(text, 'Gemini');
}

// ─── JSON EXTRACTOR ────────────────────────────────────────────────────────────

/**
 * Robustly extract JSON from an AI response.
 * Handles: pure JSON, JSON in ```json fences, JSON embedded in prose.
 */
function extractJSON(text, providerName) {
  if (!text || typeof text !== 'string') {
    throw new Error(`${providerName} returned empty response`);
  }

  // 1. Try direct parse (response is pure JSON)
  try {
    return JSON.parse(text.trim());
  } catch (_) { /* continue */ }

  // 2. Strip ```json ... ``` fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch (_) { /* continue */ }
  }

  // 3. Find the outermost { ... } block
  const firstBrace = text.indexOf('{');
  const lastBrace  = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch (_) { /* continue */ }
  }

  // 4. Find the outermost [ ... ] block (array response)
  const firstBracket = text.indexOf('[');
  const lastBracket  = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    } catch (_) { /* continue */ }
  }

  throw new Error(`${providerName}: Could not extract valid JSON from response: ${text.substring(0, 200)}`);
}

// ─── MOCK ADVICE ───────────────────────────────────────────────────────────────

function getMockAdvice(module) {
  const mockMap = {
    budget_coach: {
      suggestions: [
        { action: 'Start a ₹2,000/month SIP in a liquid fund as emergency reserve', reason: 'You currently have no emergency fund. 6 months of expenses should be your target.', priority: 'high' },
        { action: 'Reduce discretionary spending by 10%', reason: 'Based on typical Indian household patterns, dining and entertainment often have 15–20% savings potential.', priority: 'medium' },
        { action: 'Automate savings on salary day', reason: 'Pay yourself first — transfer savings before spending to avoid month-end shortfall.', priority: 'high' }
      ],
      missingData: ['transaction history', 'budget categories'],
      confidence: 0.5
    },
    invest_recommend: {
      allocation: { equity: 60, debt: 30, gold: 5, cash: 5 },
      recommendations: [
        { assetClass: 'equity', category: 'large-cap index', example: 'Nifty 50 Index Fund — Direct Plan (Zerodha Coin)', reason: 'Low-cost diversification across India\'s top 50 companies. Ideal long-term core holding.' },
        { assetClass: 'equity', category: 'mid-cap', example: 'Nifty Midcap 150 Index Fund — Direct', reason: 'Higher growth potential over 7+ year horizon.' },
        { assetClass: 'debt', category: 'short duration', example: 'HDFC Short Term Debt Fund', reason: 'Stable returns, lower volatility than equity.' },
        { assetClass: 'gold', category: 'sovereign gold bond', example: 'RBI Sovereign Gold Bond (SGB)', reason: 'Tax-free capital gains if held to maturity + 2.5% annual interest.' }
      ],
      why: 'Based on a moderate risk profile, this 60-30-5-5 allocation balances growth and stability for a medium-term Indian investor.',
      confidence: 0.6,
      missingData: ['risk questionnaire', 'investment horizon', 'specific goals with amounts']
    },
    nri_plan: {
      taxNotes: 'As an NRI returning to India, you will enjoy RNOR (Resident but Not Ordinarily Resident) status for 2–3 years. During RNOR, foreign income is not taxable in India. After RNOR ends, you become a full Resident and global income is taxable. India has DTAA with the US, UK, UAE, and most major countries to prevent double taxation. Under FEMA, NRIs can freely repatriate funds held in NRE accounts; NRO accounts have a $1 million/year repatriation cap. Consult a CA specializing in international taxation before your return year.',
      investmentSuggestions: [
        'Start SIP in Indian mutual funds 2–3 years before return to build Indian portfolio gradually',
        'Convert NRE FDs to regular FDs 6 months before return to avoid TDS complications',
        'Invest in ELSS funds post-return to claim 80C deduction of ₹1.5 lakh/year',
        'Consider Sovereign Gold Bonds for gold allocation — tax-free if held 8 years',
        'Open a PPF account immediately after return (NRIs cannot open new PPF accounts)'
      ],
      repatriationSteps: [
        'Notify your foreign bank of change of residency status to avoid penalties',
        'Liquidate foreign retirement accounts (401k/pension) gradually to minimize tax in both countries',
        'Transfer funds via wire to NRE account (fully repatriable) before return date',
        'After return, close NRE/NRO accounts and convert to regular savings/current accounts within 3 months'
      ],
      cashflowProjection: [
        { year: new Date().getFullYear(),     inflow: 5000000, outflow: 2000000, net: 3000000, note: 'Abroad — high earning' },
        { year: new Date().getFullYear() + 1, inflow: 5200000, outflow: 2100000, net: 3100000, note: 'Abroad — saving aggressively' },
        { year: new Date().getFullYear() + 2, inflow: 2500000, outflow: 1800000, net: 700000,  note: 'Return year — income drop' },
        { year: new Date().getFullYear() + 3, inflow: 3000000, outflow: 2000000, net: 1000000, note: 'Post-return stabilization' }
      ],
      why: 'This is a general NRI transition plan. Add your specific financial data for a personalised projection.',
      confidence: 0.4,
      missingData: ['exact foreign income', 'retirement account details', 'real estate holdings', 'country-specific DTAA details']
    },
    autopilot_plan: {
      summary: 'Your financial autopilot is running on default projections. Add your loans, investments, and income data for a personalised plan.',
      actions: [
        { step: 'Build emergency fund', amount: 50000, reason: 'Target 6 months of expenses in a liquid fund before investing elsewhere.' },
        { step: 'Start ₹5,000/month SIP', amount: 5000, reason: 'Consistent investing over 20 years compounds significantly.' },
        { step: 'Review insurance coverage', amount: 0, reason: 'Ensure term cover equals 12× annual income.' }
      ],
      schedule: [
        { month: 1, action: 'Open a liquid fund account (Zerodha Coin / Groww)', amount: 0 },
        { month: 2, action: 'Transfer 1 month expenses to emergency fund', amount: 20000 },
        { month: 3, action: 'Start SIP in Nifty 50 Index Fund', amount: 5000 }
      ],
      why: 'Standard financial planning principles for an Indian investor.',
      confidence: 0.5,
      missingData: ['income data', 'expense data', 'loan details', 'current investments']
    },
    family_insights: {
      summary: 'Family finances look broadly healthy based on available data. Add all family member profiles for detailed insights.',
      gaps: [
        { member: 'Family', issue: 'Insurance adequacy unknown', action: 'Ensure each earning member has term cover of 12× annual income' },
        { member: 'Family', issue: 'Education fund not tracked', action: 'Start a dedicated SIP for each child\'s education goal' }
      ],
      recommendations: [
        'Set up separate emergency funds for each earning member',
        'Review health insurance annually — hospitalisation costs rise 15% per year in India',
        'Create a joint family budget with clear ownership of each expense category'
      ],
      why: 'Based on general Indian family financial planning principles.',
      confidence: 0.5,
      missingData: ['spouse income data', 'children profiles', 'parent health insurance status']
    },
    advisor: {
      summary: 'Your financial profile has been analysed. Focus on building emergency savings, optimising insurance, and starting systematic investment.',
      top_actions: [
        { action: 'Build 6-month emergency fund', reason: 'Foundation of all financial planning', priority: 'high' },
        { action: 'Ensure term insurance = 12× annual income', reason: 'Critical protection for dependents', priority: 'high' },
        { action: 'Start SIP investment', reason: 'Compound growth over time', priority: 'medium' }
      ],
      plan_7_days: [
        'Calculate your exact monthly expenses',
        'Check your current term insurance cover',
        'Open a liquid fund account for emergency savings'
      ],
      plan_30_days: [
        'Set up an automated SIP of at least ₹2,000/month',
        'Review and top up health insurance if below ₹10 lakh per person',
        'File for any government scheme you qualify for (check myscheme.gov.in)'
      ],
      disclaimer: 'This is AI-generated advice for informational purposes. Consult a SEBI-registered financial advisor before making investment decisions.',
      confidence: 0.5,
      missingData: ['detailed expense breakdown', 'investment history', 'tax returns']
    }
  };

  return mockMap[module] || { error: 'No mock available', confidence: 0, missingData: [] };
}
