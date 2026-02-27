import { plaidClient } from './create-link-token';
import { supabase } from '../../lib/supabase';
import { decrypt } from '../../lib/encryption';

export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: providers } = await supabase
    .from('accounts_providers')
    .select('*')
    .eq('provider', 'plaid')
    .eq('is_active', true);

  for (const prov of providers) {
    const accessToken = decrypt(prov.access_token, process.env.ENCRYPTION_KEY);
    try {
      const plaidRes = await plaidClient.accountsGet({ access_token: accessToken });
      for (const acc of plaidRes.data.accounts) {
        // Find the corresponding internal account (you may need to store plaid_account_id)
        const { data: account } = await supabase
          .from('accounts')
          .select('id')
          .eq('provider_id', prov.id)
          .eq('name', acc.name)
          .single();

        if (account) {
          await supabase
            .from('accounts')
            .update({ last_balance: acc.balances.current, last_refreshed_at: new Date() })
            .eq('id', account.id);

          await supabase.from('balance_snapshots').insert({
            account_id: account.id,
            user_id: prov.user_id,
            balance: acc.balances.current,
            snapshot_date: new Date().toISOString().split('T')[0],
          });
        }
      }
    } catch (err) {
      console.error(`Failed to refresh provider ${prov.id}:`, err);
    }
  }
  res.json({ done: true });
}