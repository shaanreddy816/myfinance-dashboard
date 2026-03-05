# 🔑 API Keys Setup Guide - Complete Walkthrough

**Last Updated:** March 3, 2026  
**Estimated Time:** 30-45 minutes total

This guide will walk you through getting ALL the API keys needed for FamLedgerAI.

---

## 📊 Quick Overview

| Service | Purpose | Free Tier | Time to Setup |
|---------|---------|-----------|---------------|
| Alpha Vantage | Stock prices | 25 calls/day | 2 min |
| Metals-API | Gold prices | 50 calls/month | 3 min |
| Finnhub | Financial news | 60 calls/min | 2 min |
| Plaid | US bank connectivity | Sandbox unlimited | 10 min |
| Setu | Indian bank connectivity | Test mode unlimited | 15 min |
| Twilio | WhatsApp alerts | Trial credits | 10 min |

**Total:** All services have generous free tiers perfect for development and testing!

---

## 1️⃣ Alpha Vantage (Stock Prices)

### What You Get
- Real-time and historical stock prices
- 25 API calls per day (free tier)
- Global stock markets coverage

### Setup Steps

1. **Visit:** https://www.alphavantage.co/support/#api-key

2. **Fill the form:**
   - Email: your email
   - Organization: FamLedgerAI (or your name)
   - Click "GET FREE API KEY"

3. **Copy your API key** (looks like: `ABCD1234EFGH5678`)

4. **Test it:**
   ```bash
   curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY"
   ```

5. **Add to .env.local:**
   ```env
   ALPHA_VANTAGE_API_KEY=your_key_here
   ```

**Time:** 2 minutes ⏱️

---

## 2️⃣ Metals-API (Gold Prices)

### What You Get
- Real-time gold, silver, platinum prices
- 50 API calls per month (free tier)
- Multiple currencies support

### Setup Steps

1. **Visit:** https://metals-api.com/

2. **Click "Get Free API Key"**

3. **Sign up:**
   - Email: your email
   - Password: create one
   - Verify email

4. **Dashboard → API Key** (looks like: `abcdef123456789`)

5. **Test it:**
   ```bash
   curl "https://metals-api.com/api/latest?access_key=YOUR_KEY&base=USD&symbols=XAU"
   ```

6. **Add to .env.local:**
   ```env
   METALS_API_KEY=your_key_here
   ```

**Time:** 3 minutes ⏱️

---

## 3️⃣ Finnhub (Financial News)

### What You Get
- Real-time financial news
- 60 API calls per minute (free tier)
- Company news, market news, press releases

### Setup Steps

1. **Visit:** https://finnhub.io/register

2. **Sign up:**
   - Email: your email
   - Password: create one
   - Verify email

3. **Dashboard → API Keys**
   - Copy your API key (looks like: `c123abc456def789`)

4. **Test it:**
   ```bash
   curl "https://finnhub.io/api/v1/news?category=general&token=YOUR_KEY"
   ```

5. **Add to .env.local:**
   ```env
   FINNHUB_API_KEY=your_key_here
   ```

**Time:** 2 minutes ⏱️

---

## 4️⃣ Plaid (US Bank Connectivity)

### What You Get
- Connect to 12,000+ US banks
- Sandbox mode (unlimited, fake data for testing)
- Account balances, transactions, identity

### Setup Steps

1. **Visit:** https://dashboard.plaid.com/signup

2. **Sign up:**
   - Email: your email
   - Company: FamLedgerAI (or your name)
   - Use case: Personal Finance Management
   - Country: United States

3. **Verify email and complete onboarding**

4. **Dashboard → Team Settings → Keys**
   - Copy `client_id` (looks like: `5f8a9b2c3d4e5f6g7h8i`)
   - Copy `sandbox secret` (looks like: `1a2b3c4d5e6f7g8h9i0j`)

5. **Test it:**
   ```bash
   curl -X POST https://sandbox.plaid.com/link/token/create \
     -H 'Content-Type: application/json' \
     -d '{
       "client_id": "YOUR_CLIENT_ID",
       "secret": "YOUR_SECRET",
       "user": {"client_user_id": "test-user"},
       "client_name": "FamLedgerAI",
       "products": ["auth", "transactions"],
       "country_codes": ["US"],
       "language": "en"
     }'
   ```

6. **Add to .env.local:**
   ```env
   PLAID_CLIENT_ID=your_client_id_here
   PLAID_SECRET=your_sandbox_secret_here
   PLAID_ENV=sandbox
   ```

**Time:** 10 minutes ⏱️

**Note:** Start with `sandbox` environment. When ready for production, request production access (takes 1-2 days approval).

---

## 5️⃣ Setu Account Aggregator (Indian Banks)

### What You Get
- Connect to all major Indian banks
- RBI-approved Account Aggregator framework
- UAT (test) environment for development

### Setup Steps

1. **Visit:** https://setu.co/

2. **Click "Get Started" → Sign Up**
   - Email: your email
   - Company: FamLedgerAI
   - Use case: Personal Finance Management

3. **Complete KYC:**
   - Business details
   - Contact information
   - Wait for approval (usually 1-2 hours)

4. **Dashboard → Account Aggregator → Credentials**
   - Copy `Client ID`
   - Copy `Client Secret`
   - Copy `Product ID`

5. **Test it:**
   ```bash
   curl -X POST https://fiu-uat.setu.co/auth/token \
     -H 'Content-Type: application/json' \
     -d '{
       "client_id": "YOUR_CLIENT_ID",
       "client_secret": "YOUR_CLIENT_SECRET"
     }'
   ```

6. **Add to .env.local:**
   ```env
   SETU_CLIENT_ID=your_client_id_here
   SETU_CLIENT_SECRET=your_client_secret_here
   SETU_PRODUCT_ID=your_product_id_here
   SETU_BASE_URL=https://fiu-uat.setu.co
   ```

**Time:** 15 minutes (+ approval wait) ⏱️

**Note:** Start with UAT environment. Production access requires additional compliance documentation.

---

## 6️⃣ Twilio (WhatsApp Alerts)

### What You Get
- Send WhatsApp messages
- Trial account: $15 credit (enough for ~1000 messages)
- SMS fallback option

### Setup Steps

1. **Visit:** https://www.twilio.com/try-twilio

2. **Sign up:**
   - Email: your email
   - Password: create one
   - Verify phone number

3. **Complete onboarding:**
   - Select "Messaging" as use case
   - Select "WhatsApp" as product

4. **Get credentials:**
   - Dashboard → Account Info
   - Copy `Account SID` (looks like: `AC1234567890abcdef`)
   - Copy `Auth Token` (click to reveal)

5. **Enable WhatsApp:**
   - Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to connect your WhatsApp sandbox
   - Send "join [your-sandbox-code]" to the Twilio WhatsApp number

6. **Test it:**
   ```bash
   curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
     --data-urlencode "From=whatsapp:+14155238886" \
     --data-urlencode "To=whatsapp:+91YOUR_PHONE" \
     --data-urlencode "Body=Test from FamLedgerAI" \
     -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
   ```

7. **Add to .env.local:**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

**Time:** 10 minutes ⏱️

**Note:** Sandbox mode requires users to opt-in by sending "join" message. For production, apply for WhatsApp Business API approval.

---

## 🎯 Final .env.local File

After completing all steps, your `.env.local` should look like this:

```env
# Supabase (Already configured ✅)
SUPABASE_URL=https://ivvkzforsgruhofpekir.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_existing_key
VITE_SUPABASE_URL=https://ivvkzforsgruhofpekir.supabase.co
VITE_SUPABASE_ANON_KEY=your_existing_key

# AI (Already configured ✅)
ANTHROPIC_API_KEY=your_existing_key

# Zerodha (Already configured ✅)
KITE_API_KEY=your_existing_key
KITE_API_SECRET=your_existing_key

# Financial APIs (NEW - Add these)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
METALS_API_KEY=your_metals_api_key
FINNHUB_API_KEY=your_finnhub_key

# US Bank Connectivity (NEW - Add these)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox

# Indian Bank Connectivity (NEW - Add these)
SETU_CLIENT_ID=your_setu_client_id
SETU_CLIENT_SECRET=your_setu_client_secret
SETU_PRODUCT_ID=your_setu_product_id
SETU_BASE_URL=https://fiu-uat.setu.co

# WhatsApp Alerts (NEW - Add these)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## ✅ Verification Checklist

After adding all keys, test each service:

### Test Stock Prices
```bash
curl "http://localhost:5173/api/stocks?symbol=AAPL"
```
Expected: Stock price data for Apple

### Test Gold Prices
```bash
curl "http://localhost:5173/api/gold"
```
Expected: Current gold price in USD

### Test Financial News
```bash
curl "http://localhost:5173/api/news?category=general"
```
Expected: Array of recent financial news articles

### Test Plaid (US Banks)
```bash
curl -X POST "http://localhost:5173/api/plaid/create-link-token" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{}'
```
Expected: Link token for Plaid Link UI

### Test Setu (Indian Banks)
```bash
curl -X POST "http://localhost:5173/api/aa/create-consent" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "vua": "test@onemoney"
  }'
```
Expected: Consent handle and redirect URL

### Test WhatsApp
```bash
curl -X POST "http://localhost:5173/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+91YOUR_PHONE_NUMBER"
  }'
```
Expected: Success message (check your WhatsApp)

---

## 🚨 Troubleshooting

### "API key invalid" errors
- Double-check you copied the entire key (no spaces)
- Verify the key is active in the provider's dashboard
- Some keys take 5-10 minutes to activate after creation

### "Rate limit exceeded"
- Free tiers have limits (see table at top)
- Wait for the limit to reset (usually daily or monthly)
- Consider upgrading to paid tier if needed

### Plaid "invalid credentials"
- Make sure you're using `sandbox` secret, not development/production
- Client ID and secret must be from the same environment

### Setu "unauthorized"
- Verify your account is approved (check email)
- UAT credentials are different from production
- Token expires after 1 hour, request new one

### Twilio "not authorized"
- Verify phone number is verified in Twilio console
- For WhatsApp, ensure you sent "join" message to sandbox
- Check Account SID and Auth Token are correct

---

## 💰 Cost Estimates

### Free Tier Limits (Monthly)
- Alpha Vantage: 750 calls/month (25/day)
- Metals-API: 50 calls/month
- Finnhub: ~180,000 calls/month (60/min)
- Plaid Sandbox: Unlimited (fake data)
- Setu UAT: Unlimited (test mode)
- Twilio Trial: $15 credit (~1000 messages)

### When to Upgrade
- Alpha Vantage: $50/month for 500 calls/day
- Metals-API: $10/month for 1000 calls
- Finnhub: $60/month for unlimited
- Plaid: $0.50 per connected account/month
- Setu: Custom pricing (contact sales)
- Twilio: Pay-as-you-go ($0.005/message)

**For 100 active users:** Estimated $100-200/month total

---

## 🔐 Security Best Practices

1. **Never commit .env.local to Git** (already in .gitignore ✅)
2. **Use different keys for dev/staging/production**
3. **Rotate keys every 90 days**
4. **Monitor usage in each provider's dashboard**
5. **Set up billing alerts to avoid surprise charges**
6. **Use environment-specific keys in Vercel:**
   - Development: Sandbox/test keys
   - Production: Live keys with rate limits

---

## 📞 Support Links

- **Alpha Vantage:** support@alphavantage.co
- **Metals-API:** https://metals-api.com/contact
- **Finnhub:** support@finnhub.io
- **Plaid:** https://dashboard.plaid.com/support
- **Setu:** support@setu.co
- **Twilio:** https://support.twilio.com

---

## 🎉 Next Steps

After setting up all API keys:

1. ✅ Restart your dev server (`npm run dev`)
2. ✅ Test each endpoint using the verification commands above
3. ✅ Try the features in the UI (Dashboard → Investments, News, etc.)
4. ✅ Add the same keys to Vercel for production deployment
5. ✅ Monitor usage in each provider's dashboard

---

**Questions?** Contact: bhatinishanthanreddy@gmail.com

**Last Updated:** March 3, 2026
