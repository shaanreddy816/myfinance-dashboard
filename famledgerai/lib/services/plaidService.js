// lib/services/plaidService.js
// Plaid integration for US bank connectivity
// Uses Plaid API v2 (fetch-based, no SDK dependency)

const PLAID_CLIENT_ID     = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET        = process.env.PLAID_SECRET;
const PLAID_ENV           = process.env.PLAID_ENV || 'sandbox'; // sandbox | development | production
const APP_BASE_URL        = process.env.APP_BASE_URL || 'https://famledgerai.com';

const PLAID_BASE_URLS = {
  sandbox:     'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production:  'https://production.plaid.com'
};

function getBaseUrl() {
  return PLAID_BASE_URLS[PLAID_ENV] || PLAID_BASE_URLS.sandbox;
}

function plaidHeaders() {
  return { 'Content-Type': 'application/json' };
}

function plaidAuth() {
  return { client_id: PLAID_CLIENT_ID, secret: PLAID_SECRET };
}

async function plaidRequest(endpoint, body = {}) {
  const url = `${getBaseUrl()}${endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: plaidHeaders(),
    body: JSON.stringify({ ...plaidAuth(), ...body })
  });
  const text = await res.text();
  if (!res.ok) {
    let errMsg = `Plaid error ${res.status}`;
    try {
      const errData = JSON.parse(text);
      errMsg = errData.error_message || errData.display_message || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return JSON.parse(text);
}

// ─── CREATE LINK TOKEN ─────────────────────────────────────────────────────────
// Frontend calls this to get a link_token, then opens Plaid Link UI
export async function createLinkToken(userId, products = ['transactions'], countryCodes = ['US']) {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('Plaid credentials not configured');
  }
  const data = await plaidRequest('/link/token/create', {
    user: { client_user_id: userId },
    client_name: 'FamledgerAI',
    products,
    country_codes: countryCodes,
    language: 'en',
    redirect_uri: `${APP_BASE_URL}/plaid-callback`,
    // Optional: webhook for real-time updates
    webhook: `${APP_BASE_URL}/api/plaid/webhook`
  });
  return { link_token: data.link_token, expiration: data.expiration, request_id: data.request_id };
}

// ─── EXCHANGE PUBLIC TOKEN ──────────────────────────────────────────────────────
// After user completes Plaid Link, frontend sends public_token here
export async function exchangePublicToken(publicToken) {
  const data = await plaidRequest('/item/public_token/exchange', {
    public_token: publicToken
  });
  return { access_token: data.access_token, item_id: data.item_id, request_id: data.request_id };
}

// ─── GET ACCOUNTS ───────────────────────────────────────────────────────────────
export async function getAccounts(accessToken) {
  const data = await plaidRequest('/accounts/get', { access_token: accessToken });
  return (data.accounts || []).map(acc => ({
    account_id:   acc.account_id,
    name:         acc.name,
    official_name: acc.official_name,
    type:         acc.type,           // depository, credit, loan, investment
    subtype:      acc.subtype,        // checking, savings, credit card, etc.
    mask:         acc.mask,           // last 4 digits
    currency:     acc.balances?.iso_currency_code || 'USD',
    balance: {
      current:   acc.balances?.current,
      available: acc.balances?.available,
      limit:     acc.balances?.limit   // for credit cards
    }
  }));
}

// ─── GET BALANCES ───────────────────────────────────────────────────────────────
export async function getBalances(accessToken) {
  const data = await plaidRequest('/accounts/balance/get', { access_token: accessToken });
  return (data.accounts || []).map(acc => ({
    account_id: acc.account_id,
    name:       acc.name,
    type:       acc.type,
    subtype:    acc.subtype,
    mask:       acc.mask,
    current:    acc.balances?.current,
    available:  acc.balances?.available,
    limit:      acc.balances?.limit,
    currency:   acc.balances?.iso_currency_code || 'USD'
  }));
}


// ─── GET TRANSACTIONS ───────────────────────────────────────────────────────────
export async function getTransactions(accessToken, startDate, endDate, count = 100, offset = 0) {
  // Default: last 30 days
  const now = new Date();
  const start = startDate || new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const end   = endDate   || now.toISOString().split('T')[0];

  const data = await plaidRequest('/transactions/get', {
    access_token: accessToken,
    start_date: start,
    end_date: end,
    options: { count, offset }
  });

  return {
    accounts:     data.accounts?.length || 0,
    total:        data.total_transactions,
    transactions: (data.transactions || []).map(tx => ({
      transaction_id: tx.transaction_id,
      account_id:     tx.account_id,
      date:           tx.date,
      name:           tx.name,
      merchant_name:  tx.merchant_name,
      amount:         tx.amount,          // positive = debit, negative = credit
      currency:       tx.iso_currency_code || 'USD',
      category:       tx.category,        // array like ["Food and Drink", "Restaurants"]
      category_id:    tx.category_id,
      pending:        tx.pending,
      payment_channel: tx.payment_channel // online, in store, other
    }))
  };
}

// ─── GET INSTITUTION INFO ───────────────────────────────────────────────────────
export async function getInstitution(institutionId) {
  const data = await plaidRequest('/institutions/get_by_id', {
    institution_id: institutionId,
    country_codes: ['US'],
    options: { include_optional_metadata: true }
  });
  const inst = data.institution;
  return {
    institution_id: inst.institution_id,
    name:           inst.name,
    url:            inst.url,
    logo:           inst.logo,
    primary_color:  inst.primary_color,
    products:       inst.products,
    country_codes:  inst.country_codes
  };
}

// ─── GET ITEM (CONNECTION) INFO ─────────────────────────────────────────────────
export async function getItem(accessToken) {
  const data = await plaidRequest('/item/get', { access_token: accessToken });
  return {
    item_id:          data.item.item_id,
    institution_id:   data.item.institution_id,
    consent_expiration: data.item.consent_expiration_time,
    update_type:      data.item.update_type,
    error:            data.item.error,
    available_products: data.item.available_products,
    billed_products:  data.item.billed_products,
    status:           data.status
  };
}

// ─── REMOVE ITEM (DISCONNECT BANK) ─────────────────────────────────────────────
export async function removeItem(accessToken) {
  const data = await plaidRequest('/item/remove', { access_token: accessToken });
  return { removed: true, request_id: data.request_id };
}

// ─── HANDLE WEBHOOK ─────────────────────────────────────────────────────────────
// Plaid sends webhooks for transaction updates, errors, etc.
export function parseWebhook(body) {
  const { webhook_type, webhook_code, item_id, error, new_transactions, removed_transactions } = body;
  return {
    type:     webhook_type,     // TRANSACTIONS, ITEM, etc.
    code:     webhook_code,     // INITIAL_UPDATE, DEFAULT_UPDATE, HISTORICAL_UPDATE, etc.
    item_id,
    error,
    new_transactions:     new_transactions || 0,
    removed_transactions: removed_transactions || []
  };
}
