/**
 * Mutual Fund NAV Service
 * Fetches latest NAV from mfapi.in (Free, no API key needed)
 * No rate limits documented, but we cache to be respectful
 */

import cache from '../lib/cache.js';

class MutualFundService {
    constructor() {
        this.baseUrl = 'https://api.mfapi.in/mf';
    }

    /**
     * Get latest NAV for a mutual fund scheme
     * @param {string} schemeCode - Scheme code (e.g., '119551' for HDFC Top 100)
     */
    async getNav(schemeCode) {
        // Validate scheme code
        if (!schemeCode || !/^\d+$/.test(schemeCode)) {
            throw new Error('Invalid scheme code. Must be numeric.');
        }

        const cacheKey = `mf:${schemeCode}`;
        
        // Check cache first (10 minute TTL - NAV updates once daily)
        const cached = cache.get(cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        try {
            const url = `${this.baseUrl}/${schemeCode}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Check if scheme exists
            if (!data || !data.data || data.data.length === 0) {
                throw new Error('Scheme not found or no data available');
            }

            // Get latest NAV (first entry)
            const latestNav = data.data[0];
            
            // Format response
            const result = {
                schemeCode: data.meta.scheme_code,
                schemeName: data.meta.scheme_name,
                schemeType: data.meta.scheme_type,
                schemeCategory: data.meta.scheme_category,
                fundHouse: data.meta.fund_house,
                nav: parseFloat(latestNav.nav),
                date: latestNav.date,
                timestamp: new Date().toISOString()
            };

            // Cache for 10 minutes
            cache.set(cacheKey, result, 600);

            return result;

        } catch (error) {
            console.error('Mutual fund service error:', error);
            throw error;
        }
    }

    /**
     * Search mutual funds by name
     * @param {string} query - Search query
     */
    async search(query) {
        if (!query || query.length < 3) {
            throw new Error('Search query must be at least 3 characters');
        }

        const cacheKey = `mf:search:${query.toLowerCase()}`;
        
        // Check cache (30 minute TTL)
        const cached = cache.get(cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        try {
            // Note: mfapi.in doesn't have a search endpoint
            // For production, consider maintaining a local database of schemes
            // or using a different API with search capability
            
            throw new Error('Search functionality not available. Please use scheme code.');

        } catch (error) {
            console.error('Mutual fund search error:', error);
            throw error;
        }
    }

    /**
     * Get multiple fund NAVs (batch)
     */
    async getMultipleNavs(schemeCodes) {
        const promises = schemeCodes.map(code => 
            this.getNav(code).catch(err => ({
                schemeCode: code,
                error: err.message
            }))
        );

        return Promise.all(promises);
    }
}

export default new MutualFundService();
