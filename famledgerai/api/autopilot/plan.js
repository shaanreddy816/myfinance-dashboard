import { createClient } from '@supabase/supabase-js';
import { deterministicProjection } from '../_lib/deterministic';
import { callAIWithFallback } from '../_lib/aiRouter';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, scenario } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    // Fetch all user data
    const { data: loans } = await supabase.from('loans').select('*').eq('user_id', userId);
    const { data: investments } = await supabase.from('portfolio_holdings').select('*').eq('user_id', userId);
    const { data: profiles } = await supabase.from('profiles').select('*').eq('user_id', userId);
    const { data: goals } = await supabase.from('goals').select('*').eq('user_id', userId);

    // Run deterministic calculations (retirement, cashflow, etc.)
    const deterministic = deterministicProjection({ loans, investments, profiles, goals });

    // Use AI to generate narrative
    const prompt = `Based on the following deterministic financial projections, write a short summary and 3-5 actionable steps for the user. Projections: ${JSON.stringify(deterministic)}. Return JSON with keys "summary", "actions" (array of {step, amount, reason}), "why", "confidence", "missingData".`;

    const aiResponse = await callAIWithFallback(prompt, 'autopilot_plan');

    res.status(200).json({
      projections: deterministic,
      ...aiResponse
    });
  } catch (error) {
    console.error('Autopilot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}