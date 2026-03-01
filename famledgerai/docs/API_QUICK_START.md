# 🚀 API Integration Quick Start

Get your financial APIs up and running in 5 minutes!

---

## Step 1: Get API Keys (5 minutes)

### Alpha Vantage (Stock Prices)
1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Copy the API key

### Metals-API (Gold Prices)
1. Visit: https://metals-api.com/
2. Click "Get Free API Key"
3. Sign up and copy the key

### Finnhub (Financial News)
1. Visit: https://finnhub.io/register
2. Create account
3. Copy API key from dashboard

---

## Step 2: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your keys
nano .env.local
```

Add your keys:
```bash
ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE
METALS_API_KEY=YOUR_KEY_HERE
FINNHUB_API_KEY=YOUR_KEY_HERE
```

---

## Step 3: Deploy to Vercel

### Add Environment Variables in Vercel Dashboard

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable:
   - `ALPHA_VANTAGE_API_KEY`
   - `METALS_API_KEY`
   - `FINNHUB_API_KEY`
4. Click "Save"

### Deploy
```bash
git add .
git commit -m "feat: Add financial APIs integration"
git push origin main
```

Vercel will auto-deploy!

---

## Step 4: Test Your APIs

### Test Stock API
```bash
curl "https://your-app.vercel.app/api/stocks?symbol=AAPL"
```

### Test Mutual Fund API
```bash
curl "https://your-app.vercel.app/api/mutualfund?code=119551"
```

### Test Gold API
```bash
curl "https://your-app.vercel.app/api/gold"
```

### Test News API
```bash
curl "https://your-app.vercel.app/api/news?category=general&limit=5"
```

---

## Step 5: Use in Frontend

```javascript
// Add to your index.html or create a separate file

// Fetch stock price
async function getStockPrice(symbol) {
    try {
        const response = await fetch(`/api/stocks?symbol=${symbol}`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`${data.data.symbol}: ₹${data.data.price}`);
            return data.data;
        } else {
            console.error('Error:', data.error.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Fetch mutual fund NAV
async function getMutualFundNav(code) {
    try {
        const response = await fetch(`/api/mutualfund?code=${code}`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`${data.data.schemeName}: ₹${data.data.nav}`);
            return data.data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Fetch gold price
async function getGoldPrice() {
    try {
        const response = await fetch('/api/gold');
        const data = await response.json();
        
        if (data.success) {
            console.log(`Gold: ₹${data.data.pricePerGram}/gram`);
            return data.data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Fetch financial news
async function getFinancialNews() {
    try {
        const response = await fetch('/api/news?category=general&limit=5');
        const data = await response.json();
        
        if (data.success) {
            data.data.articles.forEach(article => {
                console.log(article.headline);
            });
            return data.data;
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Test all APIs
async function testAllAPIs() {
    console.log('Testing Stock API...');
    await getStockPrice('RELIANCE.BSE');
    
    console.log('Testing Mutual Fund API...');
    await getMutualFundNav('119551');
    
    console.log('Testing Gold API...');
    await getGoldPrice();
    
    console.log('Testing News API...');
    await getFinancialNews();
}

// Run tests
testAllAPIs();
```

---

## 🎉 You're Done!

Your financial APIs are now integrated and ready to use!

### Next Steps:
1. Add UI components to display the data
2. Implement auto-refresh for real-time updates
3. Add error handling and loading states
4. Monitor API usage to stay within free tier limits

### Need Help?
- Check the full guide: `docs/API_INTEGRATION_GUIDE.md`
- Test locally: `npm run dev` or `vercel dev`
- Check logs: Vercel Dashboard → Functions → Logs

---

**Pro Tips:**
- APIs are cached to save on rate limits
- Stock prices: 5 min cache
- Mutual funds: 10 min cache (NAV updates once daily)
- Gold: 30 min cache
- News: 15 min cache

**Rate Limits:**
- Alpha Vantage: 5 calls/min, 500/day
- Metals-API: 50 calls/month (use sparingly!)
- Finnhub: 60 calls/min
- mfapi.in: No limits (free forever!)
