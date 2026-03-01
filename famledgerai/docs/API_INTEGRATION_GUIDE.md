# 🔌 Financial APIs Integration Guide

Complete guide for integrating stock, mutual fund, gold, and news APIs securely.

---

## 📁 Folder Structure

```
famledgerai/
├── api/
│   ├── lib/
│   │   ├── cache.js              # In-memory caching service
│   │   ├── rateLimit.js          # Rate limiting service
│   │   ├── apiResponse.js        # Standardized response format
│   │   ├── whatsapp.js           # WhatsApp service (existing)
│   │   ├── supabase.js           # Supabase client (existing)
│   │   └── encryption.js         # Encryption utilities (existing)
│   ├── services/
│   │   ├── stockService.js       # Stock price service (Alpha Vantage)
│   │   ├── mutualFundService.js  # Mutual fund NAV service (mfapi.in)
│   │   ├── goldService.js        # Gold price service (Metals-API)
│   │   └── newsService.js        # Financial news service (Finnhub)
│   ├── stocks.js                 # Stock API route
│   ├── mutualfund.js             # Mutual fund API route
│   ├── gold.js                   # Gold price API route
│   └── news.js                   # News API route
├── .env.local                    # Environment variables (DO NOT COMMIT)
└── docs/
    └── API_INTEGRATION_GUIDE.md  # This file
```

---

## 🔐 Environment Variables Setup

Create `.env.local` file in the `famledgerai` directory:

```bash
# Alpha Vantage (Stock Prices)
# Get free API key: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Metals-API (Gold Prices)
# Get free API key: https://metals-api.com/
METALS_API_KEY=your_metals_api_key_here

# Finnhub (Financial News)
# Get free API key: https://finnhub.io/register
FINNHUB_API_KEY=your_finnhub_key_here

# Existing keys
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### ⚠️ Security Rules:
1. **NEVER** commit `.env.local` to Git
2. Add `.env.local` to `.gitignore`
3. Store production keys in Vercel Environment Variables
4. Rotate keys periodically

---

## 🚀 API Endpoints

### 1. Stock Prices

**Endpoint:** `GET /api/stocks`

**Parameters:**
- `symbol` (string): Stock symbol (e.g., "RELIANCE.BSE", "AAPL")
- `symbols` (string): Comma-separated symbols for batch request (max 10)

**Examples:**
```javascript
// Single stock
const response = await fetch('/api/stocks?symbol=RELIANCE.BSE');
const data = await response.json();

// Multiple stocks
const response = await fetch('/api/stocks?symbols=RELIANCE.BSE,TCS.BSE,INFY.BSE');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "Stock quote fetched successfully",
  "data": {
    "symbol": "RELIANCE.BSE",
    "price": 2456.75,
    "change": 12.50,
    "changePercent": "0.51%",
    "volume": 5234567,
    "latestTradingDay": "2026-03-01",
    "previousClose": 2444.25,
    "timestamp": "2026-03-01T10:30:00.000Z",
    "cached": false
  },
  "timestamp": "2026-03-01T10:30:00.000Z"
}
```

**Rate Limits:**
- 5 requests per minute per symbol
- Cached for 5 minutes

---

### 2. Mutual Fund NAV

**Endpoint:** `GET /api/mutualfund`

**Parameters:**
- `code` (string): Scheme code (e.g., "119551")
- `codes` (string): Comma-separated codes for batch request (max 20)

**Examples:**
```javascript
// Single fund
const response = await fetch('/api/mutualfund?code=119551');
const data = await response.json();

// Multiple funds
const response = await fetch('/api/mutualfund?codes=119551,120503');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "Mutual fund NAV fetched successfully",
  "data": {
    "schemeCode": "119551",
    "schemeName": "HDFC Top 100 Fund - Direct Plan - Growth",
    "schemeType": "Open Ended Schemes",
    "schemeCategory": "Equity Scheme - Large Cap Fund",
    "fundHouse": "HDFC Mutual Fund",
    "nav": 845.67,
    "date": "01-03-2026",
    "timestamp": "2026-03-01T10:30:00.000Z",
    "cached": false
  },
  "timestamp": "2026-03-01T10:30:00.000Z"
}
```

**Rate Limits:**
- No official limits (free API)
- Cached for 10 minutes

---

### 3. Gold Prices

**Endpoint:** `GET /api/gold`

**Parameters:**
- `grams` (number, optional): Weight in grams (default: 1)

**Examples:**
```javascript
// Price per gram
const response = await fetch('/api/gold');
const data = await response.json();

// Price for 10 grams
const response = await fetch('/api/gold?grams=10');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "Gold price fetched successfully",
  "data": {
    "pricePerGram": 6234.50,
    "pricePerOunce": 193850.25,
    "currency": "INR",
    "unit": "gram",
    "date": "2026-03-01",
    "timestamp": "2026-03-01T10:30:00.000Z",
    "cached": false
  },
  "timestamp": "2026-03-01T10:30:00.000Z"
}
```

**Rate Limits:**
- 1 request per hour (very conservative)
- Cached for 30 minutes

---

### 4. Financial News

**Endpoint:** `GET /api/news`

**Parameters:**
- `category` (string): News category (general, forex, crypto, merger)
- `limit` (number): Number of articles (1-50, default: 5)
- `symbol` (string): Stock symbol for company-specific news

**Examples:**
```javascript
// General financial news
const response = await fetch('/api/news?category=general&limit=5');
const data = await response.json();

// Company-specific news
const response = await fetch('/api/news?symbol=AAPL');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "News fetched successfully",
  "data": {
    "category": "general",
    "count": 5,
    "articles": [
      {
        "id": 123456,
        "headline": "Market reaches new high",
        "summary": "Stock markets hit record levels...",
        "source": "Reuters",
        "url": "https://...",
        "image": "https://...",
        "category": "general",
        "datetime": "2026-03-01T09:00:00.000Z",
        "related": "AAPL,MSFT"
      }
    ],
    "timestamp": "2026-03-01T10:30:00.000Z",
    "cached": false
  },
  "timestamp": "2026-03-01T10:30:00.000Z"
}
```

**Rate Limits:**
- 10 requests per minute
- Cached for 15 minutes

---

## 💻 Frontend Integration Examples

### React/JavaScript Example

```javascript
// Create a reusable API client
class FinancialAPI {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    async fetchStock(symbol) {
        try {
            const response = await fetch(`${this.baseUrl}/api/stocks?symbol=${symbol}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error.message);
            }
            
            return data.data;
        } catch (error) {
            console.error('Stock fetch error:', error);
            throw error;
        }
    }

    async fetchMutualFund(code) {
        try {
            const response = await fetch(`${this.baseUrl}/api/mutualfund?code=${code}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error.message);
            }
            
            return data.data;
        } catch (error) {
            console.error('Mutual fund fetch error:', error);
            throw error;
        }
    }

    async fetchGoldPrice(grams = 1) {
        try {
            const response = await fetch(`${this.baseUrl}/api/gold?grams=${grams}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error.message);
            }
            
            return data.data;
        } catch (error) {
            console.error('Gold price fetch error:', error);
            throw error;
        }
    }

    async fetchNews(category = 'general', limit = 5) {
        try {
            const response = await fetch(`${this.baseUrl}/api/news?category=${category}&limit=${limit}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error.message);
            }
            
            return data.data;
        } catch (error) {
            console.error('News fetch error:', error);
            throw error;
        }
    }
}

// Usage
const api = new FinancialAPI();

// Fetch stock price
const stock = await api.fetchStock('RELIANCE.BSE');
console.log(`${stock.symbol}: ₹${stock.price}`);

// Fetch mutual fund NAV
const fund = await api.fetchMutualFund('119551');
console.log(`${fund.schemeName}: ₹${fund.nav}`);

// Fetch gold price
const gold = await api.fetchGoldPrice(10);
console.log(`10g Gold: ₹${gold.totalPrice}`);

// Fetch news
const news = await api.fetchNews('general', 5);
news.articles.forEach(article => {
    console.log(article.headline);
});
```

### With Loading & Error States

```javascript
async function displayStockPrice(symbol) {
    const priceElement = document.getElementById('stock-price');
    const errorElement = document.getElementById('stock-error');
    
    try {
        // Show loading
        priceElement.textContent = 'Loading...';
        errorElement.style.display = 'none';
        
        // Fetch data
        const api = new FinancialAPI();
        const stock = await api.fetchStock(symbol);
        
        // Display result
        priceElement.textContent = `₹${stock.price.toLocaleString('en-IN')}`;
        priceElement.style.color = stock.change >= 0 ? 'green' : 'red';
        
    } catch (error) {
        // Show error
        priceElement.textContent = '--';
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    }
}
```

---

## 🔄 Caching Strategy

### In-Memory Cache (Current)
- Simple Map-based cache
- TTL (Time-To-Live) per entry
- Automatic cleanup every 10 minutes
- **Limitation:** Resets on server restart

### Upgrade to Redis (Production)

```javascript
// Install: npm install redis
const redis = require('redis');
const client = redis.createClient({
    url: process.env.REDIS_URL
});

await client.connect();

// Set with expiry
await client.setEx('stock:AAPL', 300, JSON.stringify(data));

// Get
const cached = await client.get('stock:AAPL');
const data = cached ? JSON.parse(cached) : null;
```

---

## ⚡ Rate Limiting

### Current Implementation
- In-memory tracking
- Sliding window algorithm
- Per-key limits

### Production Upgrade

```javascript
// Use Vercel Rate Limit or Upstash
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

const { success } = await ratelimit.limit(identifier);
if (!success) {
  return res.status(429).json({ error: "Rate limit exceeded" });
}
```

---

## 🔧 Error Handling Best Practices

### 1. Standardized Error Responses
All errors follow the same format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "details": null
  },
  "timestamp": "2026-03-01T10:30:00.000Z"
}
```

### 2. Error Types
- **400**: Validation errors (invalid parameters)
- **429**: Rate limit exceeded
- **500**: Server errors
- **503**: Service unavailable (API key not configured)

### 3. Frontend Error Handling
```javascript
try {
    const data = await api.fetchStock('INVALID');
} catch (error) {
    if (error.message.includes('Rate limit')) {
        showToast('Too many requests. Please wait.', 'warning');
    } else if (error.message.includes('Invalid')) {
        showToast('Invalid stock symbol', 'error');
    } else {
        showToast('Something went wrong', 'error');
    }
}
```

---

## 🚀 Upgrading to Real-Time Broker APIs

### Zerodha Kite Connect

```javascript
// Install: npm install kiteconnect
const KiteConnect = require("kiteconnect").KiteConnect;

const kc = new KiteConnect({
    api_key: process.env.KITE_API_KEY
});

// Get quote
const quote = await kc.getQuote(["NSE:RELIANCE"]);

// Get historical data
const historical = await kc.getHistoricalData(
    "NSE:RELIANCE",
    "day",
    from_date,
    to_date
);
```

### Upstox API

```javascript
// Similar to Kite Connect
const upstox = require('upstox');

const client = new upstox.ApiClient();
client.authentications['OAUTH2'].accessToken = process.env.UPSTOX_TOKEN;

const api = new upstox.MarketQuoteApi();
const quote = await api.getLTP('NSE_EQ|INE002A01018');
```

### Migration Path
1. Keep current free APIs for basic features
2. Add broker APIs for premium features
3. Use feature flags to toggle between free/paid
4. Implement fallback mechanism

---

## 📊 Production Hardening Checklist

- [ ] Move to Redis/Vercel KV for caching
- [ ] Implement distributed rate limiting
- [ ] Add request logging and monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add API health checks
- [ ] Implement circuit breakers
- [ ] Add request timeouts
- [ ] Set up alerts for API failures
- [ ] Implement retry logic with exponential backoff
- [ ] Add API usage analytics
- [ ] Set up API key rotation
- [ ] Implement request signing
- [ ] Add CORS configuration
- [ ] Set up CDN for static responses
- [ ] Implement API versioning

---

## 📝 Testing

```javascript
// Test stock API
curl "http://localhost:3000/api/stocks?symbol=AAPL"

// Test mutual fund API
curl "http://localhost:3000/api/mutualfund?code=119551"

// Test gold API
curl "http://localhost:3000/api/gold?grams=10"

// Test news API
curl "http://localhost:3000/api/news?category=general&limit=5"
```

---

## 🔗 Useful Resources

- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [mfapi.in GitHub](https://github.com/aaronjan98/mfapi)
- [Metals-API Docs](https://metals-api.com/documentation)
- [Finnhub Docs](https://finnhub.io/docs/api)
- [Zerodha Kite Connect](https://kite.trade/)
- [Upstox API](https://upstox.com/developer/api-documentation/)

---

**Last Updated:** March 1, 2026
