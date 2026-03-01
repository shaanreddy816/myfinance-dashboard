/**
 * Financial News Service
 * Fetches news from Finnhub API (Free tier: 60 calls/minute)
 */

const cache = require('../lib/cache');
const rateLimiter = require('../lib/rateLimit');

class NewsService {
    constructor() {
        this.apiKey = process.env.FINNHUB_API_KEY;
        this.baseUrl = 'https://finnhub.io/api/v1';
    }

    /**
     * Get latest financial news
     * @param {string} category - News category (general, forex, crypto, merger)
     * @param {number} limit - Number of articles (default: 5)
     */
    async getNews(category = 'general', limit = 5) {
        if (!this.apiKey) {
            throw new Error('Finnhub API key not configured');
        }

        const cacheKey = `news:${category}:${limit}`;
        
        // Check cache first (15 minute TTL)
        const cached = cache.get(cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        // Check rate limit (60 per minute, we'll use 10 per minute to be safe)
        if (!rateLimiter.isAllowed(cacheKey, 10, 60000)) {
            const retryAfter = rateLimiter.getRetryAfter(cacheKey, 60000);
            throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
        }

        try {
            const url = `${this.baseUrl}/news?category=${category}&token=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Check for errors
            if (data.error) {
                throw new Error(data.error);
            }

            // Format and limit results
            const articles = data.slice(0, limit).map(article => ({
                id: article.id,
                headline: article.headline,
                summary: article.summary,
                source: article.source,
                url: article.url,
                image: article.image,
                category: article.category,
                datetime: new Date(article.datetime * 1000).toISOString(),
                related: article.related
            }));

            const result = {
                category,
                count: articles.length,
                articles,
                timestamp: new Date().toISOString()
            };

            // Cache for 15 minutes
            cache.set(cacheKey, result, 900);

            return result;

        } catch (error) {
            console.error('News service error:', error);
            throw error;
        }
    }

    /**
     * Get company-specific news
     * @param {string} symbol - Stock symbol
     */
    async getCompanyNews(symbol, fromDate, toDate) {
        if (!this.apiKey) {
            throw new Error('Finnhub API key not configured');
        }

        // Default to last 7 days
        if (!fromDate) {
            const date = new Date();
            date.setDate(date.getDate() - 7);
            fromDate = date.toISOString().split('T')[0];
        }
        
        if (!toDate) {
            toDate = new Date().toISOString().split('T')[0];
        }

        const cacheKey = `news:company:${symbol}`;
        
        // Check cache (30 minute TTL)
        const cached = cache.get(cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        try {
            const url = `${this.baseUrl}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            const articles = data.slice(0, 10).map(article => ({
                headline: article.headline,
                summary: article.summary,
                source: article.source,
                url: article.url,
                image: article.image,
                datetime: new Date(article.datetime * 1000).toISOString()
            }));

            const result = {
                symbol,
                count: articles.length,
                articles,
                timestamp: new Date().toISOString()
            };

            // Cache for 30 minutes
            cache.set(cacheKey, result, 1800);

            return result;

        } catch (error) {
            console.error('Company news error:', error);
            throw error;
        }
    }
}

module.exports = new NewsService();
