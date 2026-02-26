import { callAIWithFallback } from '../_lib/aiRouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const metrics = req.body;

  const prompt = `You are a certified financial advisor AI. Provide personalized financial advice for an Indian user based on the following metrics:
- Age: ${metrics.age}
- Occupation: ${metrics.occupation}
- Income range: ₹${metrics.incomeRange} lakhs/year
- Goals: ${metrics.goals?.join(', ') || 'Not specified'}
- Risk tolerance: ${metrics.risk}
- Monthly income: ₹${metrics.monthlyIncome}
- Monthly expenses: ₹${metrics.monthlyExpenses}
- Monthly savings: ₹${metrics.monthlySavings}
- Emergency fund ratio: ${metrics.emergencyRatio.toFixed(2)}
- Debt ratio: ${(metrics.debtRatio*100).toFixed(1)}%
- Insurance cover ratio: ${metrics.insuranceRatio.toFixed(2)}
- Savings rate: ${(metrics.savingsRate*100).toFixed(1)}%
- Government schemes enrolled: ${metrics.schemesCount}
- Financial health score: ${metrics.healthScore}/100

Return a JSON object with keys: summary, top_actions (array of {action, reason, priority}), plan_7_days (array), plan_30_days (array), disclaimer, confidence, missingData.`;

  try {
    const advice = await callAIWithFallback(prompt, 'advisor');
    res.status(200).json(advice);
  } catch (error) {
    console.error('Advice endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}