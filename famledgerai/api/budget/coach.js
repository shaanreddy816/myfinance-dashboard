import { createClient } from '@supabase/supabase-js';
import { callAIWithFallback } from '../_lib/aiRouter';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, timeframe = 'month' } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    // Fetch transactions and budgets for the user
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
    if (txError) throw txError;

    const { data: budgets, error: bError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);
    if (bError) throw bError;

    // Compute analysis
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savingsRate = totalIncome ? (totalIncome - totalExpenses) / totalIncome : 0;

    const categorySpent = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
    });

    const categoryBreakdown = budgets.map(b => {
      const spent = categorySpent[b.category] || 0;
      let status = 'green';
      if (spent > b.amount) status = 'red';
      else if (spent > b.amount * 0.8) status = 'yellow';
      return { category: b.category, spent, budget: b.amount, status };
    });

    // Use AI to generate suggestions
    const prompt = `Analyze the following user data and provide 2-3 short actionable budgeting suggestions:
- Total income: ${totalIncome}
- Total expenses: ${totalExpenses}
- Savings rate: ${(savingsRate * 100).toFixed(1)}%
- Category breakdown: ${JSON.stringify(categoryBreakdown)}
Return a JSON object with keys "suggestions" (array of {action, reason, priority}) and "missingData" (array of strings).`;

    const aiResponse = await callAIWithFallback(prompt, 'budget_coach');

    // Log to ai_advice_logs (sanitized)
    await supabase.from('ai_advice_logs').insert({
      user_id: userId,
      module: 'budget_coach',
      response_summary: aiResponse.suggestions?.[0]?.action,
      confidence_score: aiResponse.confidence || 0.8,
      missing_data: aiResponse.missingData
    });

    res.status(200).json({
      analysis: { totalIncome, totalExpenses, savingsRate, categoryBreakdown },
      suggestions: aiResponse.suggestions,
      why: "Based on your recent spending compared to your set budgets.",
      confidence: aiResponse.confidence || 0.8,
      missingData: aiResponse.missingData || []
    });
  } catch (error) {
    console.error('Budget coach error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}