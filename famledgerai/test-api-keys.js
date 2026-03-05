#!/usr/bin/env node

/**
 * API Keys Testing Script
 * Tests all external API integrations
 * Run: node test-api-keys.js
 */

import 'dotenv/config';

const tests = [];
let passed = 0;
let failed = 0;

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, message = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  log(`${icon} ${name}`, color);
  if (message) log(`   ${message}`, 'cyan');
  
  if (status === 'pass') passed++;
  if (status === 'fail') failed++;
}

// Test 1: Alpha Vantage (Stock Prices)
async function testAlphaVantage() {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!key) {
    logTest('Alpha Vantage', 'skip', 'ALPHA_VANTAGE_API_KEY not set');
    return;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${key}`
    );
    const data = await response.json();
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const price = data['Global Quote']['05. price'];
      logTest('Alpha Vantage', 'pass', `AAPL price: $${price}`);
    } else if (data.Note) {
      logTest('Alpha Vantage', 'fail', 'Rate limit exceeded (25 calls/day)');
    } else {
      logTest('Alpha Vantage', 'fail', 'Invalid API key or unexpected response');
    }
  } catch (error) {
    logTest('Alpha Vantage', 'fail', error.message);
  }
}

// Test 2: Metals-API (Gold Prices)
async function testMetalsAPI() {
  const key = process.env.METALS_API_KEY;
  
  if (!key) {
    logTest('Metals-API', 'skip', 'METALS_API_KEY not set');
    return;
  }

  try {
    const response = await fetch(
      `https://metals-api.com/api/latest?access_key=${key}&base=USD&symbols=XAU`
    );
    const data = await response.json();
    
    if (data.success && data.rates && data.rates.XAU) {
      const goldPrice = (1 / data.rates.XAU).toFixed(2);
      logTest('Metals-API', 'pass', `Gold: $${goldPrice}/oz`);
    } else {
      logTest('Metals-API', 'fail', data.error?.info || 'Invalid API key');
    }
  } catch (error) {
    logTest('Metals-API', 'fail', error.message);
  }
}

// Test 3: Finnhub (Financial News)
async function testFinnhub() {
  const key = process.env.FINNHUB_API_KEY;
  
  if (!key) {
    logTest('Finnhub', 'skip', 'FINNHUB_API_KEY not set');
    return;
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${key}`
    );
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      logTest('Finnhub', 'pass', `Retrieved ${data.length} news articles`);
    } else if (data.error) {
      logTest('Finnhub', 'fail', 'Invalid API key');
    } else {
      logTest('Finnhub', 'fail', 'No news data returned');
    }
  } catch (error) {
    logTest('Finnhub', 'fail', error.message);
  }
}

// Test 4: Plaid (US Banks)
async function testPlaid() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = process.env.PLAID_ENV || 'sandbox';
  
  if (!clientId || !secret) {
    logTest('Plaid', 'skip', 'PLAID_CLIENT_ID or PLAID_SECRET not set');
    return;
  }

  try {
    const response = await fetch(`https://${env}.plaid.com/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        user: { client_user_id: 'test-user-' + Date.now() },
        client_name: 'FamLedgerAI Test',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en'
      })
    });
    
    const data = await response.json();
    
    if (data.link_token) {
      logTest('Plaid', 'pass', `Environment: ${env}`);
    } else {
      logTest('Plaid', 'fail', data.error_message || 'Invalid credentials');
    }
  } catch (error) {
    logTest('Plaid', 'fail', error.message);
  }
}

// Test 5: Setu Account Aggregator (Indian Banks)
async function testSetu() {
  const clientId = process.env.SETU_CLIENT_ID;
  const clientSecret = process.env.SETU_CLIENT_SECRET;
  const baseUrl = process.env.SETU_BASE_URL || 'https://fiu-uat.setu.co';
  
  if (!clientId || !clientSecret) {
    logTest('Setu AA', 'skip', 'SETU_CLIENT_ID or SETU_CLIENT_SECRET not set');
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret
      })
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      logTest('Setu AA', 'pass', 'Authentication successful');
    } else {
      logTest('Setu AA', 'fail', data.message || 'Invalid credentials');
    }
  } catch (error) {
    logTest('Setu AA', 'fail', error.message);
  }
}

// Test 6: Twilio (WhatsApp)
async function testTwilio() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    logTest('Twilio', 'skip', 'TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set');
    return;
  }

  try {
    // Test by fetching account info (doesn't send message)
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: { 'Authorization': `Basic ${auth}` }
      }
    );
    
    const data = await response.json();
    
    if (data.sid === accountSid) {
      logTest('Twilio', 'pass', `Account: ${data.friendly_name || 'Active'}`);
    } else {
      logTest('Twilio', 'fail', data.message || 'Invalid credentials');
    }
  } catch (error) {
    logTest('Twilio', 'fail', error.message);
  }
}

// Test 7: Supabase (Already configured)
async function testSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    logTest('Supabase', 'skip', 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return;
  }

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (response.ok) {
      logTest('Supabase', 'pass', 'Connection successful');
    } else {
      logTest('Supabase', 'fail', 'Invalid credentials');
    }
  } catch (error) {
    logTest('Supabase', 'fail', error.message);
  }
}

// Test 8: Anthropic (Already configured)
async function testAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  
  if (!key) {
    logTest('Anthropic', 'skip', 'ANTHROPIC_API_KEY not set');
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });
    
    const data = await response.json();
    
    if (data.content) {
      logTest('Anthropic', 'pass', 'AI responding correctly');
    } else {
      logTest('Anthropic', 'fail', data.error?.message || 'Invalid API key');
    }
  } catch (error) {
    logTest('Anthropic', 'fail', error.message);
  }
}

// Main execution
async function runTests() {
  log('\n🔑 FamLedgerAI - API Keys Testing\n', 'cyan');
  log('Testing all external API integrations...\n', 'blue');

  // Run all tests
  await testSupabase();
  await testAnthropic();
  await testAlphaVantage();
  await testMetalsAPI();
  await testFinnhub();
  await testPlaid();
  await testSetu();
  await testTwilio();

  // Summary
  log('\n' + '─'.repeat(50), 'cyan');
  log(`\n📊 Results: ${passed} passed, ${failed} failed\n`, 'blue');

  if (failed === 0 && passed > 0) {
    log('🎉 All configured APIs are working!\n', 'green');
  } else if (failed > 0) {
    log('⚠️  Some APIs failed. Check the errors above.\n', 'yellow');
  } else {
    log('ℹ️  No APIs configured yet. See API_KEYS_SETUP_GUIDE.md\n', 'yellow');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}\n`, 'red');
  process.exit(1);
});
