// api/autopilot/plan.js
import { createClient } from '@supabase/supabase-js';
import { deterministicProjection } from '../_lib/deterministic';
import { callAIWithFallback } from '../_lib/aiRouter';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, scenario = 'retirement' } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    // Fetch all relevant user data from Supabase
    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId);
    const { data: investments } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    // Run deterministic projections (you need to implement this function)
    const deterministic = deterministicProjection({
      loans: loans || [],
      investments: investments || [],
      profiles: profiles || [],
      goals: goals || [],
      scenario
    });

    // Prepare a prompt for the AI to generate a narrative summary and actions
    const prompt = `
You are a financial autopilot AI. Based on the following deterministic financial projections, write a short summary (2‑3 sentences) and 3‑5 actionable steps for the user. Return a JSON object with keys "summary" (string), "actions" (array of {step, amount, reason}), "why" (string explanation), "confidence" (0‑1), and "missingData" (array).

Projections: ${JSON.stringify(deterministic)}
    `;

    // Call AI with fallback (mock if credits exhausted)
    const aiResponse = await callAIWithFallback(prompt, 'autopilot_plan');

    // Combine deterministic data with AI narrative
    res.status(200).json({
      projections: deterministic,
      ...aiResponse
    });
  } catch (error) {
    console.error('Autopilot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}