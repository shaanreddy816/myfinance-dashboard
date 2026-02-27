// api/aa/refresh.js
// Cron job: refreshes balances for all active consents
// Schedule via Vercel Cron: "0 6 * * *" (daily at 6 AM IST)
// Add to vercel.json: { "crons": [{ "path": "/api/aa/refresh", "schedule": "30 0 * * *" }] }

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SETU_BASE_URL      = process.env.SETU_BASE_URL    || 'https://fiu-uat.setu.co';
const SETU_CLIENT_ID     = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const CRON_SECRET        = process.env.CRON_SECRET; // optional: protect the endpoint

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
  // Protect from unauthorized calls
  if (CRON_SECRET) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const results   = { refreshed: 0, failed: 0, skipped: 0, errors: [] };

  try {
    // Get all active consents that haven't been fetched in 6+ hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: consents, error: dbErr } = await supabase
      .from('aa_consents')
      .select('*')
      .eq('status', 'ACTIVE')
      .or(`last_fetched.is.null,last_fetched.lt.${sixHoursAgo}`)
      .limit(50); // process max 50 at a time to stay within timeout

    if (dbErr) throw new Error('DB error: ' + dbErr.message);
    if (!consents || consents.length === 0) {
      return res.status(200).json({ message: 'No consents to refresh', ...results });
    }

    const accessToken = await getSetuToken();

    for (const consent of consents) {
      try {
        // Check if consent is still valid with Setu
        const statusRes = await fetch(
          `${SETU_BASE_URL}/api/v2/consents/${consent.consent_id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'x-client-id': SETU_CLIENT_ID
            }
          }
        );

        if (!statusRes.ok) {
          results.failed++;
          results.errors.push(`${consent.consent_id}: status check failed`);
          continue;
        }

        const statusData = await statusRes.json();
        const currentStatus = statusData.status;

        // If consent expired or revoked, update DB
        if (currentStatus === 'EXPIRED' || currentStatus === 'REVOKED') {
          await supabase.from('aa_consents')
            .update({ status: currentStatus, updated_at: new Date().toISOString() })
            .eq('consent_id', consent.consent_id);
          results.skipped++;
          continue;
        }

        // Create new data session
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
              from: consent.last_fetched
                ? new Date(new Date(consent.last_fetched).getTime() - 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // last 90 days for incremental
              to: new Date().toISOString()
            },
            format: { type: 'json', version: '1.1.2' }
          })
        });

        if (!sessionRes.ok) {
          results.failed++;
          results.errors.push(`${consent.consent_id}: session creation failed`);
          continue;
        }

        const session = await sessionRes.json();
        const sessionId = session.id || session.sessionId;

        // Update DB with new session and last_fetched
        await supabase.from('aa_consents').update({
          session_id:   sessionId,
          last_fetched: new Date().toISOString(),
          updated_at:   new Date().toISOString()
        }).eq('consent_id', consent.consent_id);

        // Wait briefly then poll for data (give Setu time to fetch)
        await new Promise(r => setTimeout(r, 2000));

        const dataRes = await fetch(
          `${SETU_BASE_URL}/api/v2/fip/data/sessions/${sessionId}`,
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

          // Upsert fresh balances
          for (const fi of fiData) {
            for (const account of (fi.data || [])) {
              const balance = parseFloat(
                account.Summary?.currentBalance ||
                account.Summary?.balance || '0'
              );
              const accountId = account.maskedAccNumber || account.linkRefNumber;

              if (accountId) {
                await supabase.from('accounts').upsert({
                  user_id:     consent.user_id,
                  account_id:  accountId,
                  balance,
                  last_synced: new Date().toISOString(),
                  provider:    'setu_aa'
                }, { onConflict: 'account_id' }).catch(() => {});
              }
            }
          }
        }

        results.refreshed++;

        // Throttle: don't hammer Setu API
        await new Promise(r => setTimeout(r, 500));

      } catch (consentErr) {
        console.error(`Error refreshing consent ${consent.consent_id}:`, consentErr);
        results.failed++;
        results.errors.push(`${consent.consent_id}: ${consentErr.message}`);
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(`AA refresh complete in ${elapsed}ms:`, results);

    return res.status(200).json({
      message: `Refresh complete in ${elapsed}ms`,
      total:   consents.length,
      ...results
    });

  } catch (error) {
    console.error('AA refresh cron error:', error);
    return res.status(500).json({ error: error.message, ...results });
  }
}
