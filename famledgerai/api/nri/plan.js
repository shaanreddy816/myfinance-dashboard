import { createClient } from '@supabase/supabase-js';
import { callAIWithFallback } from '../_lib/aiRouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, currentCountry, returnYear, incomeInIndia, assets } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const prompt = `You are an NRI return advisor. User plans to return to India from ${currentCountry} in ${returnYear}. Expected annual income in India: ₹${incomeInIndia}. Current assets: ${JSON.stringify(assets)}. Provide a high‑level plan covering tax considerations, investment restructuring, and cashflow projection. Return JSON with keys "taxNotes", "investmentSuggestions" (array), "cashflowProjection" (array of {year,balance}), "why", "confidence", "missingData".`;

    const aiResponse = await callAIWithFallback(prompt, 'nri_plan');

    await supabase.from('ai_advice_logs').insert({
      user_id: userId,
      module: 'nri_plan',
      response_summary: aiResponse.why,
      confidence_score: aiResponse.confidence,
      missing_data: aiResponse.missingData
    });

    res.status(200).json(aiResponse);
  } catch (error) {
    console.error('NRI plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}