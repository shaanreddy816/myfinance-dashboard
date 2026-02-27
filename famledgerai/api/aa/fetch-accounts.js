// api/aa/fetch-accounts.js
// Fetches account data and transactions using an active Setu consent

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SETU_BASE_URL      = process.env.SETU_BASE_URL    || 'https://fiu-uat.setu.co';
const SETU_CLIENT_ID     = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;

async function getSetuToken() {
  const res = await fetch(`${SETU_BASE_URL}/api/v2/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientID:   SETU_CLIENT_ID,
      secret:     SETU_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${await res.text()}`);
  const data = await res.json();
  return data.accessToken || data.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, consentId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const accessToken = await getSetuToken();

    // Find active consent(s) for this user
    let query = supabase
      .from('aa_consents')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (consentId) query = query.eq('consent_id', consentId);

    const { data: consents, error: dbErr } = await query;
    if (dbErr) throw new Error('DB error: ' + dbErr.message);
    if (!consents || consents.length === 0) {
      return res.status(404).json({
        error: 'No active consent found. Please connect your bank first.',
        accounts: [],
        needsConsent: true
      });
    }

    const consent = consents[0];
    const results = [];

    // If we have a session_id, poll for data
    if (consent.session_id) {
      const dataRes = await fetch(
        `${SETU_BASE_URL}/api/v2/fip/data/sessions/${consent.session_id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-client-id': SETU_CLIENT_ID
          }
        }
      );

      if (dataRes.ok) {
        const sessionData = await dataRes.json();
        const fiData = sessionData.FIDataHeader?.fiData || sessionData.fiData || [];

        for (const fi of fiData) {
          const accounts = fi.data || [];
          for (const account of accounts) {
            results.push(normalizeAccount(account, fi.fipID));
          }
        }
      }
    } else {
      // No session yet — create one now
      const sessionRes = await fetch(`${SETU_BASE_URL}/api/v2/fip/data/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-client-id': SETU_CLIENT_ID
        },
        body: JSON.stringify({
          consentId: consent.consent_id,
          DataRange: {
            from: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            to:   new Date().toISOString()
          },
          format: { type: 'json', version: '1.1.2' }
        })
      });

      if (sessionRes.ok) {
        const session = await sessionRes.json();
        const sessionId = session.id || session.sessionId;
        await supabase.from('aa_consents')
          .update({ session_id: sessionId, updated_at: new Date().toISOString() })
          .eq('consent_id', consent.consent_id);

        return res.status(202).json({
          message: 'Data fetch initiated. Please check back in a few seconds.',
          sessionId,
          accounts: [],
          pending: true
        });
      }
    }

    // Upsert accounts into DB
    for (const account of results) {
      await supabase.from('accounts').upsert({
        user_id:        userId,
        provider:       'setu_aa',
        account_id:     account.accountId,
        account_type:   account.accountType,
        account_name:   account.accountName,
        bank_name:      account.bankName,
        balance:        account.balance,
        currency:       account.currency || 'INR',
        last_synced:    new Date().toISOString(),
        raw_data:       account
      }, { onConflict: 'account_id' }).catch(() => {});
    }

    // Update last fetched timestamp
    await supabase.from('aa_consents')
      .update({ last_fetched: new Date().toISOString() })
      .eq('consent_id', consent.consent_id);

    return res.status(200).json({
      accounts:  results,
      consentId: consent.consent_id,
      lastSynced: new Date().toISOString(),
      count:     results.length
    });

  } catch (error) {
    console.error('Fetch accounts error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Normalize different FI types into a common account shape
function normalizeAccount(raw, fipId) {
  const profile  = raw.Profile?.Holders?.Holder?.[0] || {};
  const summary  = raw.Summary || {};
  const linkedAccount = raw.Account || {};

  return {
    accountId:   raw.maskedAccNumber || raw.linkRefNumber || `${fipId}-${Date.now()}`,
    accountType: raw.accType || linkedAccount.accType || 'DEPOSIT',
    accountName: profile.name || summary.bankName || fipId || 'Bank Account',
    bankName:    fipId || summary.bankName || 'Unknown Bank',
    balance:     parseFloat(summary.currentBalance || summary.balance || '0'),
    currency:    summary.currency || 'INR',
    ifsc:        summary.ifscCode || '',
    pan:         profile.pan || '',
    mobile:      profile.mobile || '',
    transactions: (raw.Transactions?.Transaction || []).map(tx => ({
      txnId:     tx.txnId,
      date:      tx.valueDate || tx.transactionTimestamp,
      amount:    parseFloat(tx.amount || '0'),
      type:      tx.type,          // DEBIT or CREDIT
      mode:      tx.mode,          // NEFT, UPI, etc.
      narration: tx.narration,
      balance:   parseFloat(tx.currentBalance || '0')
    }))
  };
}
