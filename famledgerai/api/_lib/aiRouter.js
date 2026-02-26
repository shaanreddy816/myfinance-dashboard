export async function callAIWithFallback(prompt, module) {
  const provider = process.env.AI_PROVIDER || 'anthropic';
  const maxRetries = 2;
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      if (provider === 'anthropic') {
        return await callAnthropic(prompt);
      } else if (provider === 'openai') {
        return await callOpenAI(prompt);
      } else {
        throw new Error('Unknown AI provider');
      }
    } catch (err) {
      lastError = err;
      console.warn(`AI call attempt ${i+1} failed:`, err);
      if (i === maxRetries) break;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // exponential backoff
    }
  }

  // Fallback to mock advice
  console.error('All AI attempts failed, serving mock advice for module', module);
  return getMockAdvice(module);
}

async function callAnthropic(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic error: ${error}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[0]);
}

async function callOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[0]);
}

function getMockAdvice(module) {
  const mockMap = {
    budget_coach: {
      suggestions: [
        { action: 'Reduce dining out', reason: 'You spent 20% more than your budget last month.', priority: 'medium' }
      ],
      missingData: [],
      confidence: 0.5
    },
    invest_recommend: {
      allocation: { equity: 60, debt: 30, gold: 5, cash: 5 },
      recommendations: [
        { assetClass: 'equity', category: 'large‑cap index', example: 'Nippon India Index Fund', reason: 'Low cost diversification' }
      ],
      why: 'Based on your moderate risk profile.',
      confidence: 0.6,
      missingData: []
    },
    nri_plan: {
      taxNotes: 'Consult a CA for cross‑border tax.',
      investmentSuggestions: ['Consider switching foreign retirement accounts to Indian funds gradually.'],
      cashflowProjection: [],
      why: 'Generic NRI advice.',
      confidence: 0.4,
      missingData: ['detailed_assets']
    },
    autopilot_plan: {
      summary: 'Your plan is on track.',
      actions: [],
      why: 'Based on typical retirement rules.',
      confidence: 0.5,
      missingData: []
    },
    family_insights: {
      summary: 'Family finances look healthy.',
      gaps: [],
      recommendations: [],
      why: 'Based on provided profiles.',
      confidence: 0.5,
      missingData: []
    },
    advisor: {
      summary: 'Here is your personalized advice.',
      top_actions: [],
      plan_7_days: [],
      plan_30_days: [],
      disclaimer: 'Mock advice.',
      confidence: 0.5,
      missingData: []
    }
  };
  return mockMap[module] || {
    error: 'No mock available',
    confidence: 0,
    missingData: []
  };
}