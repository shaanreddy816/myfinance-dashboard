export default async function handler(req, res) {
  const { access_token } = req.query;
  const apiKey = process.env.KITE_API_KEY;

  if (!access_token) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    const response = await fetch('https://api.kite.trade/mf/sips', {
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${apiKey}:${access_token}`,
      },
    });
    const data = await response.json();
    if (data.status === 'success') {
      res.status(200).json(data.data);
    } else {
      res.status(400).json({ error: data.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}