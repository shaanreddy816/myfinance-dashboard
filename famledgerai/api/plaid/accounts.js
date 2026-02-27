import { plaidClient } from './create-link-token';
import { supabase } from '../../lib/supabase';
import { decrypt } from '../../lib/encryption';

export default async function handler(req, res) {
  const userId = req.headers['x-user-id']; // or from auth token
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data: providers } = await supabase
    .from('accounts_providers')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'plaid');

  const accounts = [];
  for (const prov of providers) {
    const accessToken = decrypt(prov.access_token, process.env.ENCRYPTION_KEY);
    const plaidRes = await plaidClient.accountsGet({ access_token: accessToken });
    for (const acc of plaidRes.data.accounts) {
      // Update last_balance in accounts table
      await supabase
        .from('accounts')
        .update({ last_balance: acc.balances.current, last_refreshed_at: new Date() })
        .eq('provider_id', prov.id)
        .eq('name', acc.name); // or match by plaid account_id
      accounts.push(acc);
    }
  }
  res.json(accounts);
}