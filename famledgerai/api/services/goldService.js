/**
 * Gold Price Service
 * Fetches gold prices from Metals-API (Free tier: 50 requests/month)
 * Alternative: Use goldapi.io or commodities-api.com
 */

const cache = require('../lib/cache');
const rateLimiter = require('../lib/rateLimit');

class GoldService {
    constructor() {
        this.apiKey = process.env.METALS_API_KEY;
        this.baseUrl = 'https://metals-api.com/api/latest';
    }

    /**
     * Get current gold price in INR per gram
     */
    async getPrice() {
        if (!this.apiKey) {
            throw new Error('Metals API key not configured');
        }

        const cacheKey = 'gold:inr';
        
        // Check cache first (30 minute TTL - gold prices don't change rapidly)
        const cached = cache.get(cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        // Check rate limit (very conservative - 50 per month)
        if (!rateLimiter.isAllowed(cacheKey, 1, 3600000)) { // 1 per hour
            const retryAfter = rateLimiter.getRetryAfter(cacheKey, 3600000);
            throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
        }

        try {
            // Fetch gold price in USD per troy ounce, then convert to INR per gram
            const url = `${this.baseUrl}?access_key=${this.apiKey}&base=XAU&symbols=INR`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Check for API errors
            if (!data.success) {
                throw new Error(data.error?.info || 'API request failed');
            }

            // XAU is gold in troy ounces
            // 1 troy ounce = 31.1035 grams
            const inrPerOunce = data.rates.INR;
            const inrPerGram = inrPerOunce / 31.1035;

            // Format response
            const result = {
                pricePerGram: Math.round(inrPerGram * 100) / 100,
                pricePerOunce: Math.round(inrPerOunce * 100) / 100,
                currency: 'INR',
                unit: 'gram',
                date: data.date,
                timestamp: new Date().toISOString()
            };

            // Cache for 30 minutes
            cache.set(cacheKey, result, 1800);

            return result;

        } catch (error) {
            console.error('Gold service error:', error);
            throw error;
        }
    }

    /**
     * Get gold price for different weights
     */
    async getPriceByWeight(grams = 1) {
        const basePrice = await this.getPrice();
        
        return {
            ...basePrice,
            weight: grams,
            totalPrice: Math.round(basePrice.pricePerGram * grams * 100) / 100
        };
    }
}

module.exports = new GoldService();
