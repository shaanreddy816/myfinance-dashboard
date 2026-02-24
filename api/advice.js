// api/advice.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

    if (!CLAUDE_API_KEY) {
        return res.status(500).json({ error: 'Claude API key not configured' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Claude API error');
        }

        res.status(200).json({ advice: data.content[0].text });
    } catch (error) {
        console.error('Claude API error:', error);
        res.status(500).json({ error: error.message });
    }
}