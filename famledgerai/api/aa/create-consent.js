// api/aa/create-consent.js
// Creates a consent request with Setu AA and returns redirect URL

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SETU_BASE_URL    = process.env.SETU_BASE_URL    || 'https://fiu-uat.setu.co';
const SETU_CLIENT_ID   = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const APP_BASE_URL     = process.env.APP_BASE_URL     || 'https://famledgerai.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  if (!SETU_CLIENT_ID || !SETU_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Setu credentials not configured. Set SETU_CLIENT_ID and SETU_CLIENT_SECRET.' });
  }

  try {
    // Step 1: Get Setu access token
    const tokenRes = await fetch(`${SETU_BASE_URL}/api/v2/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientID:     SETU_CLIENT_ID,
        secret:       SETU_CLIENT_SECRET,
        grant_type:   'client_credentials'
      })
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Setu token error ${tokenRes.status}: ${err}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.accessToken || tokenData.access_token;
    if (!accessToken) throw new Error('No access token in Setu response');

    // Step 2: Build consent request
    // Dates: consent valid for 1 year, fetch data from last 2 years
    const now         = new Date();
    const consentStart= new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
    const consentEnd  = new Date(now.getTime() + 1 * 365 * 24 * 60 * 60 * 1000); // 1 year ahead
    const dataStart   = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
    const dataEnd     = now;

    const consentBody = {
      redirectUrl: `${APP_BASE_URL}/api/aa/consent-callback`,
      Detail: {
        consentStart: consentStart.toISOString(),
        consentExpiry: consentEnd.toISOString(),
        consentMode: 'STORE',
        fetchType: 'PERIODIC',
        consentTypes: ['TRANSACTIONS', 'SUMMARY', 'PROFILE'],
        fiTypes: ['DEPOSIT', 'MUTUAL_FUNDS', 'INSURANCE_POLICIES', 'TERM_DEPOSIT', 'RECURRING_DEPOSIT', 'SIP', 'CP', 'GOVT_SECURITIES', 'EQUITIES', 'BONDS', 'DEBENTURES', 'ETF'],
        DataConsumer: { id: SETU_CLIENT_ID },
        Customer: { id: userId },
        Purpose: {
          code: '101',
          refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
          text: 'Wealth management service',
          Category: { type: 'Personal Finance' }
        },
        FIDataRange: {
          from: dataStart.toISOString(),
          to:   dataEnd.toISOString()
        },
        DataLife: { unit: 'YEAR', value: 1 },
        Frequency: { unit: 'MONTH', value: 1 },
        DataFilter: [{ type: 'TRANSACTIONAMOUNT', operator: '>=', value: '1' }]
      }
    };

    // Step 3: Create consent with Setu
    const consentRes = await fetch(`${SETU_BASE_URL}/api/v2/consents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'x-client-id': SETU_CLIENT_ID
      },
      body: JSON.stringify(consentBody)
    });

    if (!consentRes.ok) {
      const err = await consentRes.text();
      throw new Error(`Setu consent creation error ${consentRes.status}: ${err}`);
    }

    const consentData = await consentRes.json();
    const consentId  = consentData.id || consentData.consentId;
    const consentUrl = consentData.url || consentData.redirectUrl || consentData.consentUrl;

    if (!consentId || !consentUrl) {
      throw new Error(`Setu response missing id or url: ${JSON.stringify(consentData)}`);
    }

    // Step 4: Store pending consent in Supabase
    const { error: dbError } = await supabase.from('aa_consents').insert({
      user_id:    userId,
      consent_id: consentId,
      status:     'PENDING',
      created_at: new Date().toISOString(),
      consent_detail: consentData
    });

    if (dbError) {
      console.warn('Failed to store consent in DB (non-fatal):', dbError.message);
    }

    return res.status(200).json({
      consentId,
      consentUrl,
      message: 'Consent created. Redirect user to consentUrl.'
    });

  } catch (error) {
    console.error('Create consent error:', error);
    return res.status(500).json({ error: error.message });
  }
}
