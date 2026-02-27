import { plaidClient } from './create-link-token'; // reuse the client
import { supabase } from '../../lib/supabase';
import { encrypt } from '../../lib/encryption'; // we need encryption helpers

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { public_token, userId } = req.body;

  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Encrypt the access token before storing
    const encrypted = encrypt(accessToken, process.env.ENCRYPTION_KEY);

    // Insert into accounts_providers
    const { data: provider, error } = await supabase
      .from('accounts_providers')
      .insert({
        user_id: userId,
        provider: 'plaid',
        provider_account_id: itemId,
        access_token: encrypted, // store encrypted
      })
      .select()
      .single();

    if (error) throw error;

    // Immediately fetch accounts and store them
    const accountsRes = await plaidClient.accountsGet({ access_token: accessToken });
    for (const acc of accountsRes.data.accounts) {
      await supabase.from('accounts').insert({
        provider_id: provider.id,
        user_id: userId,
        name: acc.name,
        last_balance: acc.balances.current,
        last_refreshed_at: new Date(),
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Exchange failed' });
  }
}