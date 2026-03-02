// lib/services/aaService.js
// Setu Account Aggregator (AA) service for Indian bank connectivity
// Completes the FI data fetch flow that was missing from the catchall handlers

const SETU_BASE_URL      = process.env.SETU_BASE_URL    || 'https://fiu-uat.setu.co';
const SETU_CLIENT_ID     = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const SETU_PRODUCT_ID    = process.env.SETU_PRODUCT_ID;

// ─── AUTH ───────────────────────────────────────────────────────────────────────
export async function getSetuToken() {
  const tokenUrl = 'https://accountservice.setu.co/v1/users/login';
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'client': 'bridge' },
    body: JSON.stringify({ clientID: SETU_CLIENT_ID, secret: SETU_CLIENT_SECRET, grant_type: 'client_credentials' })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Setu token error ${res.status}: ${text.substring(0, 300)}`);
  }
  const d = await res.json();
  const token = d.access_token || d.accessToken || d.token;
  if (!token) throw new Error('No token in Setu auth response');
  return token;
}

function setuHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'x-product-instance-id': SETU_PRODUCT_ID
  };
}

// ─── CHECK CONSENT STATUS ───────────────────────────────────────────────────────
export async function getConsentStatus(consentId) {
  const token = await getSetuToken();
  const res = await fetch(`${SETU_BASE_URL}/consents/${consentId}`, {
    headers: setuHeaders(token)
  });
  if (!res.ok) throw new Error(`Consent status error: ${res.status}`);
  return res.json();
}

// ─── CREATE DATA SESSION (FI REQUEST) ───────────────────────────────────────────
// After consent is ACTIVE, create a data session to fetch financial data
export async function createDataSession(consentId, dateFrom, dateTo) {
  const token = await getSetuToken();
  const now = new Date();
  const body = {
    consentId,
    DataRange: {
      from: dateFrom || new Date(now.getTime() - 365 * 24 * 3600 * 1000).toISOString(),
      to:   dateTo   || now.toISOString()
    },
    format: 'json'
  };

  const res = await fetch(`${SETU_BASE_URL}/sessions`, {
    method: 'POST',
    headers: setuHeaders(token),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Data session error ${res.status}: ${text.substring(0, 300)}`);
  }
  const data = await res.json();
  return {
    sessionId: data.id || data.sessionId,
    status:    data.status,
    format:    data.format,
    data
  };
}

// ─── FETCH FI DATA (FINANCIAL INFORMATION) ──────────────────────────────────────
// Poll or fetch the data session result
export async function fetchFIData(sessionId) {
  const token = await getSetuToken();
  const res = await fetch(`${SETU_BASE_URL}/sessions/${sessionId}`, {
    headers: setuHeaders(token)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FI data fetch error ${res.status}: ${text.substring(0, 300)}`);
  }
  const data = await res.json();

  // Normalize the FI data into a usable format
  if (data.status === 'COMPLETED' && data.Payload) {
    return {
      status: 'COMPLETED',
      accounts: normalizeFIPayload(data.Payload)
    };
  }

  return {
    status: data.status || 'PENDING',
    accounts: []
  };
}


// ─── NORMALIZE FI PAYLOAD ───────────────────────────────────────────────────────
// Setu returns FI data in ReBIT schema — normalize to our app format
function normalizeFIPayload(payload) {
  const accounts = [];

  for (const fi of (Array.isArray(payload) ? payload : [payload])) {
    const fiType = fi.fipId || 'unknown';
    const accs   = fi.Accounts || fi.accounts || [];

    for (const acc of accs) {
      const profile = acc.Profile || acc.profile || {};
      const summary = acc.Summary || acc.summary || {};
      const txns    = acc.Transactions || acc.transactions || [];

      accounts.push({
        source:         'setu_aa',
        fip_id:         fiType,
        linked_acc_ref: acc.linkedAccRef || acc.linkRefNumber,
        maskedAccNumber: acc.maskedAccNumber || profile.maskedAccNumber,
        type:           profile.type || mapFIType(fi.fiType),
        holder_name:    profile.holders?.holder?.[0]?.name || null,
        bank_name:      profile.holders?.holder?.[0]?.nominee || fiType,
        // Summary data
        current_balance: parseFloat(summary.currentBalance) || 0,
        currency:        summary.currency || 'INR',
        branch:          summary.branch || profile.branch || null,
        ifsc:            summary.ifscCode || profile.ifscCode || null,
        status:          summary.status || 'ACTIVE',
        opening_date:    summary.openingDate || null,
        // Transactions (last N)
        transactions: txns.slice(0, 100).map(tx => ({
          txn_id:    tx.txnId,
          date:      tx.valueDate || tx.transactionTimestamp,
          narration: tx.narration,
          amount:    parseFloat(tx.amount) || 0,
          type:      tx.type,  // DEBIT or CREDIT
          mode:      tx.mode,  // UPI, NEFT, IMPS, etc.
          balance:   parseFloat(tx.currentBalance) || 0,
          reference: tx.reference
        }))
      });
    }
  }

  return accounts;
}

function mapFIType(fiType) {
  const map = {
    'DEPOSIT':    'Savings',
    'TERM_DEPOSIT': 'Fixed Deposit',
    'RECURRING_DEPOSIT': 'Recurring Deposit',
    'CREDIT_CARD': 'Credit Card',
    'MUTUAL_FUND': 'Mutual Fund',
    'INSURANCE':   'Insurance',
    'NPS':         'NPS',
    'PPF':         'PPF',
    'EQUITIES':    'Equities'
  };
  return map[fiType] || fiType || 'Unknown';
}

// ─── REFRESH ACCOUNTS ───────────────────────────────────────────────────────────
// Re-fetch data for an existing consent
export async function refreshAccounts(consentId) {
  // Check consent is still active
  const consent = await getConsentStatus(consentId);
  if (consent.status !== 'ACTIVE') {
    return { status: 'CONSENT_EXPIRED', accounts: [], message: 'Consent is no longer active. Please re-link.' };
  }

  // Create new data session
  const session = await createDataSession(consentId);

  // For real-time: poll until complete (max 30s)
  let attempts = 0;
  const maxAttempts = 6;
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 5000)); // wait 5s
    const result = await fetchFIData(session.sessionId);
    if (result.status === 'COMPLETED') {
      return result;
    }
    if (result.status === 'FAILED' || result.status === 'EXPIRED') {
      return { status: result.status, accounts: [], message: 'Data fetch failed' };
    }
    attempts++;
  }

  return { status: 'TIMEOUT', accounts: [], message: 'Data fetch timed out. Try again later.' };
}
