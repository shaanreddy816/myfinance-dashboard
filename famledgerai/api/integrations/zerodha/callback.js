import crypto from 'crypto';

export default async function handler(req, res) {
  const { request_token } = req.query;
  const apiKey = process.env.KITE_API_KEY;
  const apiSecret = process.env.KITE_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).send('Missing KITE_API_KEY or KITE_API_SECRET');
  }

  if (!request_token) {
    return res.status(400).send('Missing request_token');
  }

  try {
    const checksum = crypto
      .createHash('sha256')
      .update(apiKey + request_token + apiSecret)
      .digest('hex');

    const response = await fetch('https://api.kite.trade/session/token', {
      method: 'POST',
      headers: {
        'X-Kite-Version': '3',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: apiKey,
        request_token,
        checksum,
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      const accessToken = data.data.access_token;
      res.redirect(`https://famledgerai.com/zerodha-success.html?access_token=${accessToken}`);
    } else {
      res.status(400).send(`Kite API error: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    res.status(500).send(`Server error: ${error.message}`);
  }
}