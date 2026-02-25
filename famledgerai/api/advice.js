// api/advice.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
        age, occupation, incomeRange, goals, risk,
        monthlyIncome, monthlyExpenses, monthlySavings,
        emergencyRatio, debtRatio, insuranceRatio, savingsRate,
        schemesCount, healthScore
    } = req.body;

    // Build a prompt for Claude
    const prompt = `
You are a certified financial advisor AI. Provide personalized financial advice for an Indian user based on the following metrics:

- Age: ${age}
- Occupation: ${occupation}
- Income range: ₹${incomeRange} lakhs/year
- Goals: ${goals?.join(', ') || 'Not specified'}
- Risk tolerance: ${risk}
- Monthly income: ₹${monthlyIncome}
- Monthly expenses: ₹${monthlyExpenses}
- Monthly savings: ₹${monthlySavings}
- Emergency fund ratio (current / 6-month need): ${emergencyRatio.toFixed(2)}
- Debt ratio (EMI / income): ${(debtRatio*100).toFixed(1)}%
- Insurance cover ratio (current / ideal 12x annual income): ${insuranceRatio.toFixed(2)}
- Savings rate: ${(savingsRate*100).toFixed(1)}%
- Government schemes enrolled: ${schemesCount}
- Financial health score: ${healthScore}/100

Return a JSON object with the following keys:
- summary: a 2‑3 sentence overview of their financial situation.
- top_actions: an array of up to 5 objects, each with { action, reason, priority } (priority low/medium/high).
- plan_7_days: an array of 3‑5 actionable steps they can take in the next week.
- plan_30_days: an array of 3‑5 steps for the next month.
- disclaimer: a standard disclaimer that this is educational advice and they should consult a professional.

Guidelines:
- Be positive and encouraging.
- Do NOT recommend specific mutual funds or stocks.
- Do NOT promise guaranteed returns.
- Use Indian context (rupees, government schemes, etc.).
`;

    try {
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
            console.error('Claude API error:', error);
            return res.status(500).json({ error: 'Failed to get advice from AI' });
        }

        const data = await response.json();
        const adviceText = data.content[0].text;

        // Attempt to parse the JSON from the response (Claude may include extra text)
        const jsonMatch = adviceText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return res.status(500).json({ error: 'AI response was not valid JSON' });
        }
        const advice = JSON.parse(jsonMatch[0]);

        res.status(200).json(advice);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}