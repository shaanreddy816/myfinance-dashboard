import { createClient } from '@supabase/supabase-js';
import { callAIWithFallback } from '../_lib/aiRouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, profileIds } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*, transactions(*)')
      .eq('user_id', userId)
      .in('id', profileIds);

    const totalIncome = profiles.reduce((sum, p) => sum + (p.income_monthly || 0), 0);
    const totalExpenses = profiles.reduce((sum, p) => {
      const pExp = (p.transactions || []).filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return sum + pExp;
    }, 0);
    const savings = totalIncome - totalExpenses;

    const prompt = `Provide family finance insights for the following profiles: ${JSON.stringify(profiles)}. Aggregate income: ${totalIncome}, expenses: ${totalExpenses}, savings: ${savings}. Identify gaps (insurance, education, retirement) and give recommendations. Return JSON with keys "summary", "gaps" (array of {member, issue, action}), "recommendations" (array), "why", "confidence", "missingData".`;

    const aiResponse = await callAIWithFallback(prompt, 'family_insights');

    res.status(200).json({
      aggregateIncome: totalIncome,
      aggregateExpenses: totalExpenses,
      savings,
      perMember: profiles,
      ...aiResponse
    });
  } catch (error) {
    console.error('Family insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}