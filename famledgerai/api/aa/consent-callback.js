// api/aa/consent-callback.js
// Handles redirect from Setu after user approves/rejects consent

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SETU_BASE_URL    = process.env.SETU_BASE_URL    || 'https://fiu-uat.setu.co';
const SETU_CLIENT_ID   = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const APP_BASE_URL     = process.env.APP_BASE_URL     || 'https://famledgerai.com';

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
  // Setu sends a GET redirect with query params
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Setu callback params: consentId, status, errorcode (if rejected)
  const { consentId, status, errorcode, userId } = req.query;

  if (!consentId) {
    return res.redirect(`${APP_BASE_URL}/?error=missing_consent_id`);
  }

  // User rejected consent
  if (status === 'REJECTED' || errorcode) {
    await supabase.from('aa_consents')
      .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
      .eq('consent_id', consentId);

    return res.redirect(`${APP_BASE_URL}/?page=accounts&error=consent_rejected`);
  }

  try {
    // Step 1: Get Setu token
    const accessToken = await getSetuToken();

    // Step 2: Fetch consent details to get artefact + user info
    const detailRes = await fetch(`${SETU_BASE_URL}/api/v2/consents/${consentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-client-id': SETU_CLIENT_ID
      }
    });

    if (!detailRes.ok) {
      throw new Error(`Failed to fetch consent details: ${await detailRes.text()}`);
    }

    const detail = await detailRes.json();
    const consentArtefact = detail.consentArtefact || detail.signedConsent;
    const consentStatus   = detail.status || 'ACTIVE';
    const customerId      = detail.Detail?.Customer?.id;

    // Step 3: Update consent record in DB
    const { data: existing } = await supabase
      .from('aa_consents')
      .select('id, user_id')
      .eq('consent_id', consentId)
      .maybeSingle();

    const userId_resolved = existing?.user_id || customerId || 'unknown';

    if (existing) {
      await supabase.from('aa_consents').update({
        status:           consentStatus,
        consent_artefact: consentArtefact,
        consent_detail:   detail,
        updated_at:       new Date().toISOString()
      }).eq('consent_id', consentId);
    } else {
      // Consent created outside our flow (e.g. direct from AA app)
      await supabase.from('aa_consents').insert({
        user_id:          userId_resolved,
        consent_id:       consentId,
        status:           consentStatus,
        consent_artefact: consentArtefact,
        consent_detail:   detail,
        created_at:       new Date().toISOString(),
        updated_at:       new Date().toISOString()
      });
    }

    // Step 4: Trigger initial data fetch (non-blocking)
    fetchAccountsInBackground(consentId, userId_resolved, accessToken)
      .catch(e => console.error('Background fetch error:', e));

    // Step 5: Redirect back to app
    return res.redirect(`${APP_BASE_URL}/?page=accounts&consent=success`);

  } catch (error) {
    console.error('Consent callback error:', error);

    // Mark consent as errored but don't block user
    await supabase.from('aa_consents')
      .update({ status: 'ERROR', error_message: error.message, updated_at: new Date().toISOString() })
      .eq('consent_id', consentId)
      .catch(() => {});

    return res.redirect(`${APP_BASE_URL}/?page=accounts&error=callback_failed`);
  }
}

// Non-blocking: fetch FI data after consent approval
async function fetchAccountsInBackground(consentId, userId, accessToken) {
  try {
    // Create a data session (FI request)
    const sessionRes = await fetch(`${SETU_BASE_URL}/api/v2/fip/data/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'x-client-id': SETU_CLIENT_ID
      },
      body: JSON.stringify({
        consentId,
        DataRange: {
          from: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          to:   new Date().toISOString()
        },
        format: { type: 'json', version: '1.1.2' }
      })
    });

    if (!sessionRes.ok) {
      throw new Error(`Session creation failed: ${await sessionRes.text()}`);
    }

    const session = await sessionRes.json();
    const sessionId = session.id || session.sessionId;

    // Store session ID for later polling
    await supabase.from('aa_consents').update({
      session_id: sessionId,
      updated_at: new Date().toISOString()
    }).eq('consent_id', consentId);

    console.log(`FI data session created: ${sessionId} for consent ${consentId}`);
  } catch (e) {
    console.error('fetchAccountsInBackground error:', e);
  }
}
