import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { supabase } from '../../lib/supabase'; // we need a shared supabase client

const config = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SANDBOX_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(config);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId } = req.body; // userId should be the Supabase auth user ID (email or UUID)

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'FamLedgerAI',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
}