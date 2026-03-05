#!/usr/bin/env node

/**
 * FamLedgerAI API Keys Setup Wizard
 * Interactive script to help you set up all API keys
 * Run: node setup-wizard.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function writeEnvFile(env) {
  const envPath = path.join(__dirname, '.env.local');
  const lines = [];
  
  // Group by category
  const categories = {
    'Supabase': ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    'AI': ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY'],
    'Zerodha': ['KITE_API_KEY', 'KITE_API_SECRET'],
    'Financial APIs': ['ALPHA_VANTAGE_API_KEY', 'METALS_API_KEY', 'FINNHUB_API_KEY'],
    'US Banks (Plaid)': ['PLAID_CLIENT_ID', 'PLAID_SECRET', 'PLAID_ENV'],
    'Indian Banks (Setu)': ['SETU_CLIENT_ID', 'SETU_CLIENT_SECRET', 'SETU_PRODUCT_ID', 'SETU_BASE_URL'],
    'WhatsApp (Twilio)': ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM'],
    'Other': []
  };
  
  Object.entries(categories).forEach(([category, keys]) => {
    const categoryKeys = keys.filter(k => env[k]);
    if (categoryKeys.length > 0) {
      lines.push(`# ${category}`);
      categoryKeys.forEach(key => {
        lines.push(`${key}=${env[key]}`);
      });
      lines.push('');
    }
  });
  
  // Add any other keys not in categories
  Object.keys(env).forEach(key => {
    const inCategory = Object.values(categories).flat().includes(key);
    if (!inCategory) {
      lines.push(`${key}=${env[key]}`);
    }
  });
  
  fs.writeFileSync(envPath, lines.join('\n'));
}

const apiServices = [
  {
    name: 'Alpha Vantage',
    key: 'ALPHA_VANTAGE_API_KEY',
    description: 'Stock prices (25 calls/day free)',
    signupUrl: 'https://www.alphavantage.co/support/#api-key',
    testUrl: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY',
    example: 'ABCD1234EFGH5678',
    time: '2 min'
  },
  {
    name: 'Metals-API',
    key: 'METALS_API_KEY',
    description: 'Gold prices (50 calls/month free)',
    signupUrl: 'https://metals-api.com/',
    testUrl: 'https://metals-api.com/api/latest?access_key=YOUR_KEY&base=USD&symbols=XAU',
    example: 'abcdef123456789',
    time: '3 min'
  },
  {
    name: 'Finnhub',
    key: 'FINNHUB_API_KEY',
    description: 'Financial news (60 calls/min free)',
    signupUrl: 'https://finnhub.io/register',
    testUrl: 'https://finnhub.io/api/v1/news?category=general&token=YOUR_KEY',
    example: 'c123abc456def789',
    time: '2 min'
  },
  {
    name: 'Plaid',
    keys: ['PLAID_CLIENT_ID', 'PLAID_SECRET'],
    description: 'US bank connectivity (sandbox unlimited)',
    signupUrl: 'https://dashboard.plaid.com/signup',
    example: 'client_id: 5f8a9b2c3d4e5f6g, secret: 1a2b3c4d5e6f7g8h',
    time: '10 min',
    extraKeys: { 'PLAID_ENV': 'sandbox' }
  },
  {
    name: 'Setu',
    keys: ['SETU_CLIENT_ID', 'SETU_CLIENT_SECRET', 'SETU_PRODUCT_ID'],
    description: 'Indian bank connectivity (UAT unlimited)',
    signupUrl: 'https://setu.co/',
    example: 'Requires approval (1-2 hours)',
    time: '15 min',
    extraKeys: { 'SETU_BASE_URL': 'https://fiu-uat.setu.co' }
  },
  {
    name: 'Twilio',
    keys: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
    description: 'WhatsApp alerts ($15 trial credit)',
    signupUrl: 'https://www.twilio.com/try-twilio',
    example: 'SID: AC1234..., Token: abc123...',
    time: '10 min',
    extraKeys: { 'TWILIO_WHATSAPP_FROM': 'whatsapp:+14155238886' }
  }
];

function displayMenu(env) {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        🔑 FamLedgerAI API Keys Setup Wizard              ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');
  
  log('Current Status:\n', 'blue');
  
  // Already configured
  log('✅ Already Configured:', 'green');
  if (env.SUPABASE_URL) log('   • Supabase (Database)', 'green');
  if (env.ANTHROPIC_API_KEY) log('   • Anthropic AI (Claude)', 'green');
  if (env.KITE_API_KEY) log('   • Zerodha (Indian Stocks)', 'green');
  
  log('\n📋 Need to Configure:\n', 'yellow');
  
  apiServices.forEach((service, index) => {
    const keys = service.keys || [service.key];
    const allConfigured = keys.every(k => env[k]);
    const icon = allConfigured ? '✅' : '⏳';
    const color = allConfigured ? 'green' : 'yellow';
    
    log(`${icon} ${index + 1}. ${service.name} - ${service.description}`, color);
    log(`   Time: ${service.time} | Signup: ${service.signupUrl}`, 'cyan');
  });
  
  log('\n' + '─'.repeat(60), 'cyan');
  log('\nOptions:', 'blue');
  log('  [1-6] Configure specific service', 'white');
  log('  [t]   Test all configured APIs', 'white');
  log('  [g]   Open setup guide', 'white');
  log('  [q]   Quit\n', 'white');
}

function showServiceSetup(service, env) {
  console.clear();
  log(`\n🔧 Setting up: ${service.name}\n`, 'cyan');
  log(`Description: ${service.description}`, 'blue');
  log(`Signup URL: ${service.signupUrl}`, 'blue');
  log(`Estimated time: ${service.time}\n`, 'blue');
  
  if (service.testUrl) {
    log('Test command:', 'yellow');
    log(`  curl "${service.testUrl.replace('YOUR_KEY', '<your-key>')}"`, 'cyan');
  }
  
  log('\nExample format:', 'yellow');
  log(`  ${service.example}\n`, 'cyan');
  
  log('─'.repeat(60), 'cyan');
  log('\nSteps:', 'green');
  log('1. Open the signup URL in your browser', 'white');
  log('2. Create an account and get your API key(s)', 'white');
  log('3. Come back here and paste the key(s)\n', 'white');
  
  const keys = service.keys || [service.key];
  
  keys.forEach(key => {
    const current = env[key];
    if (current) {
      log(`${key}: ${current.substring(0, 20)}... (already set)`, 'green');
    } else {
      log(`${key}: Not set`, 'red');
    }
  });
  
  log('\n[Enter] to continue, [b] to go back', 'yellow');
}

async function main() {
  const env = readEnvFile();
  
  displayMenu(env);
  
  log('This wizard will help you set up all API keys.', 'white');
  log('For detailed instructions, see: API_KEYS_SETUP_GUIDE.md\n', 'cyan');
  
  log('Quick Start:', 'green');
  log('1. Choose a service from the list (1-6)', 'white');
  log('2. Follow the signup link to get your API key', 'white');
  log('3. Add the key to your .env.local file', 'white');
  log('4. Test with: node test-api-keys.js\n', 'white');
  
  log('💡 Tip: Start with Alpha Vantage (easiest, 2 min setup)\n', 'yellow');
  
  log('─'.repeat(60), 'cyan');
  log('\nManual Setup:', 'blue');
  log('1. Open .env.local in your editor', 'white');
  log('2. Add keys following the format in .env.example', 'white');
  log('3. Save and restart your dev server\n', 'white');
  
  log('Need help? Read API_KEYS_SETUP_GUIDE.md for step-by-step instructions.\n', 'cyan');
  
  log('Press Ctrl+C to exit', 'yellow');
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}\n`, 'red');
  process.exit(1);
});
