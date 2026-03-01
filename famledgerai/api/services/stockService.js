/**
 * Stock Price Service
 * Fetches stock prices from Alpha Vantage API
 * Free tier: 5 API calls per minute, 500 per day
 */

const cache = require('../lib/cache');
const rateLimiter = require('../lib/rateLimit');

class StockService {
    constructor() {
        this.apiKey = process.env.ALPHA_VANTAGE_API_KEY;
        this.baseUrl = 'https://www.alphavantage.co/query';
    }

    /**
     * Get stock quote for a symbol
     * @param {string} symbol - Stock symbol (e.g., 'RELIANCE.BSE', 'AAPL')
     */
    async getQuote(symbol) {
        if (!this.apiKey) {
            throw new Error('Alpha Vantage API key not configured');
        }

        // Validate symbol
        if (!symbol || typeof symbol !== 'string') {
            throw new Error('Invalid stock symbol');
        }

        const cacheKey = `stock:${symbol}`;
        
        // Check cache first (5 minute TTL)
        const cached = cache.get(cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        // Check rate limit (5 requests per minute)
        if (!rateLimiter.isAllowed(cacheKey, 5, 60000)) {
            const retryAfter = rateLimiter.getRetryAfter(cacheKey, 60000);
            throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
        }

        try {
            // Fetch from Alpha Vantage
            const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Check for API errors
            if (data['Error Message']) {
                throw new Error('Invalid stock symbol');
            }

            if (data['Note']) {
                throw new Error('API rate limit reached. Please try again later.');
            }

            const quote = data['Global Quote'];
            
            if (!quote || Object.keys(quote).length === 0) {
                throw new Error('No data available for this symbol');
            }

            // Format response
            const result = {
                symbol: quote['01. symbol'],
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: quote['10. change percent'],
                volume: parseInt(quote['06. volume']),
                latestTradingDay: quote['07. latest trading day'],
                previousClose: parseFloat(quote['08. previous close']),
                timestamp: new Date().toISOString()
            };

            // Cache for 5 minutes
            cache.set(cacheKey, result, 300);

            return result;

        } catch (error) {
            console.error('Stock service error:', error);
            throw error;
        }
    }

    /**
     * Get multiple stock quotes (batch)
     */
    async getMultipleQuotes(symbols) {
        const promises = symbols.map(symbol => 
            this.getQuote(symbol).catch(err => ({
                symbol,
                error: err.message
            }))
        );

        return Promise.all(promises);
    }
}

module.exports = new StockService();
