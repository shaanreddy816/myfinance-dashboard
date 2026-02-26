import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const userId = req.headers['x-user-id']; // You should use proper auth middleware
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Fetch the Zerodha integration record
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'zerodha')
      .single();

    if (!integration) return res.status(404).json({ error: 'Zerodha not connected' });

    let accessToken = integration.access_token;
    // Check if token expired (tokens expire daily at 6am IST)
    const now = new Date();
    if (integration.expires_at && new Date(integration.expires_at) < now) {
      // Refresh token
      const refreshRes = await fetch('https://api.kite.trade/session/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          api_key: process.env.KITE_API_KEY,
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token'
        })
      });
      const refreshData = await refreshRes.json();
      if (refreshData.status === 'success') {
        accessToken = refreshData.data.access_token;
        // Update DB with new token and expiry
        const expiresAt = new Date(Date.now() + refreshData.data.expires_in * 1000);
        await supabase
          .from('integrations')
          .update({ access_token: accessToken, expires_at: expiresAt })
          .eq('id', integration.id);
      } else {
        return res.status(401).json({ error: 'Token refresh failed' });
      }
    }

    // Fetch mutual fund holdings from Zerodha
    const response = await fetch('https://api.kite.trade/mf/holdings', {
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${process.env.KITE_API_KEY}:${accessToken}`
      }
    });
    const data = await response.json();

    if (data.status !== 'success') {
      return res.status(500).json({ error: 'Zerodha API error', details: data });
    }

    // Transform to our app's format
    const holdings = data.data.map(fund => ({
      source: 'zerodha',
      asset_type: 'mutual_fund',
      fund_name: fund.scheme,
      quantity: fund.quantity,
      purchase_price: fund.average_price,
      current_price: fund.last_price,
      last_synced: new Date().toISOString()
    }));

    // Optionally store them in portfolio_holdings
    for (const h of holdings) {
      await supabase.from('portfolio_holdings').upsert({
        user_id: userId,
        ...h
      }, { onConflict: 'fund_name' });
    }

    res.status(200).json(holdings);
  } catch (error) {
    console.error('Holdings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}