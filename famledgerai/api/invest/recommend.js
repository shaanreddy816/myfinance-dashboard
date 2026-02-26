import { createClient } from '@supabase/supabase-js';
import { callAIWithFallback } from '../_lib/aiRouter';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, profileId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    // Fetch risk profile
    const { data: riskProfile } = await supabase
      .from('risk_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch current holdings
    const { data: holdings } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_id', profileId);

    // Fetch goals
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_id', profileId);

    const riskScore = riskProfile?.risk_score || 5;
    const horizon = riskProfile?.time_horizon || 'medium';

    const prompt = `Given:
- Risk score (1-10): ${riskScore}
- Investment horizon: ${horizon}
- Current holdings: ${JSON.stringify(holdings)}
- Goals: ${JSON.stringify(goals)}
Recommend an asset allocation and 3-5 diversified investment options suitable for an Indian investor. Return JSON with keys "allocation" (object with equity,debt,gold,cash percentages), "recommendations" (array of {assetClass, category, example, reason}), "why" (string), "confidence" (0-1), "missingData" (array).`;

    const aiResponse = await callAIWithFallback(prompt, 'invest_recommend');

    await supabase.from('ai_advice_logs').insert({
      user_id: userId,
      module: 'invest_recommend',
      response_summary: aiResponse.why,
      confidence_score: aiResponse.confidence,
      missing_data: aiResponse.missingData
    });

    res.status(200).json(aiResponse);
  } catch (error) {
    console.error('Invest recommend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}