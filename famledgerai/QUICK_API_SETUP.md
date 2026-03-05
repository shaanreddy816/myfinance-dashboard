# 🚀 Quick API Setup - Get Started in 15 Minutes

## Already Working ✅
- Supabase (Database)
- Anthropic AI (Claude)
- Zerodha (Indian Stocks)

## Quick Setup (Priority Order)

### 1. Alpha Vantage - Stock Prices (2 min) ⭐ START HERE
```bash
# 1. Visit: https://www.alphavantage.co/support/#api-key
# 2. Enter email, get instant key
# 3. Add to .env.local:
ALPHA_VANTAGE_API_KEY=your_key_here

# 4. Test:
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY"
```

### 2. Finnhub - Financial News (2 min)
```bash
# 1. Visit: https://finnhub.io/register
# 2. Sign up, verify email
# 3. Add to .env.local:
FINNHUB_API_KEY=your_key_here

# 4. Test:
curl "https://finnhub.io/api/v1/news?category=general&token=YOUR_KEY"
```

### 3. Metals-API - Gold Prices (3 min)
```bash
# 1. Visit: https://metals-api.com/
# 2. Sign up, verify email
# 3. Add to .env.local:
METALS_API_KEY=your_key_here

# 4. Test:
curl "https://metals-api.com/api/latest?access_key=YOUR_KEY&base=USD&symbols=XAU"
```

### 4. Plaid - US Banks (10 min)
```bash
# 1. Visit: https://dashboard.plaid.com/signup
# 2. Sign up, complete onboarding
# 3. Dashboard → Keys → Copy sandbox credentials
# 4. Add to .env.local:
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox
```

### 5. Setu - Indian Banks (15 min + approval)
```bash
# 1. Visit: https://setu.co/
# 2. Sign up, complete KYC
# 3. Wait for approval (1-2 hours)
# 4. Dashboard → AA → Credentials
# 5. Add to .env.local:
SETU_CLIENT_ID=your_client_id
SETU_CLIENT_SECRET=your_client_secret
SETU_PRODUCT_ID=your_product_id
SETU_BASE_URL=https://fiu-uat.setu.co
```

### 6. Twilio - WhatsApp (10 min)
```bash
# 1. Visit: https://www.twilio.com/try-twilio
# 2. Sign up, verify phone
# 3. Console → Account Info
# 4. Add to .env.local:
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# 5. Enable WhatsApp sandbox:
# Send "join <code>" to Twilio WhatsApp number
```

## Testing Your Keys

### Test All APIs at Once
```bash
npm run test:apis
```

### Test Individual APIs
```bash
# Stock prices
curl "http://localhost:5173/api/stocks?symbol=AAPL"

# Gold prices
curl "http://localhost:5173/api/gold"

# Financial news
curl "http://localhost:5173/api/news?category=general"

# Plaid link token
curl -X POST "http://localhost:5173/api/plaid/create-link-token" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user"

# Setu consent
curl -X POST "http://localhost:5173/api/aa/create-consent" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","vua":"test@onemoney"}'

# WhatsApp test
curl -X POST "http://localhost:5173/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{"to":"+91YOUR_PHONE"}'
```

## Your .env.local Should Look Like This

```env
# Already configured ✅
SUPABASE_URL=https://ivvkzforsgruhofpekir.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_existing_key
VITE_SUPABASE_URL=https://ivvkzforsgruhofpekir.supabase.co
VITE_SUPABASE_ANON_KEY=your_existing_key
ANTHROPIC_API_KEY=your_existing_key
KITE_API_KEY=your_existing_key
KITE_API_SECRET=your_existing_key

# Add these (NEW) 👇
ALPHA_VANTAGE_API_KEY=
METALS_API_KEY=
FINNHUB_API_KEY=
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox
SETU_CLIENT_ID=
SETU_CLIENT_SECRET=
SETU_PRODUCT_ID=
SETU_BASE_URL=https://fiu-uat.setu.co
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## After Adding Keys

1. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test APIs:**
   ```bash
   npm run test:apis
   ```

3. **Open app:**
   ```
   http://localhost:5173/
   ```

## Troubleshooting

### "API key invalid"
- Check for typos (no spaces before/after)
- Verify key is active in provider dashboard
- Some keys take 5-10 min to activate

### "Rate limit exceeded"
- Alpha Vantage: 25 calls/day (wait 24 hours)
- Metals-API: 50 calls/month (wait for reset)
- Finnhub: 60 calls/min (wait 1 minute)

### "Connection refused"
- Make sure dev server is running
- Check URL is http://localhost:5173/
- Verify .env.local is in famledgerai/ folder

## Need More Help?

📖 **Detailed Guide:** See `API_KEYS_SETUP_GUIDE.md`  
🧪 **Test Script:** Run `npm run test:apis`  
🔧 **Setup Wizard:** Run `npm run setup`

## Free Tier Limits

| Service | Free Tier | Enough For |
|---------|-----------|------------|
| Alpha Vantage | 25/day | 100 users |
| Metals-API | 50/month | 50 users |
| Finnhub | 60/min | 1000+ users |
| Plaid Sandbox | Unlimited | Development |
| Setu UAT | Unlimited | Development |
| Twilio Trial | $15 credit | ~1000 messages |

**Perfect for development and testing!** 🎉

---

**Questions?** bhatinishanthanreddy@gmail.com
