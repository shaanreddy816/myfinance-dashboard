/**
 * Rate Limiter Service
 * Prevents excessive API calls and respects rate limits
 */

class RateLimiter {
    constructor() {
        this.requests = new Map(); // Track requests per key
    }

    /**
     * Check if request is allowed
     * @param {string} key - Unique identifier (e.g., 'stocks:AAPL')
     * @param {number} maxRequests - Max requests allowed
     * @param {number} windowMs - Time window in milliseconds
     */
    isAllowed(key, maxRequests = 5, windowMs = 60000) {
        const now = Date.now();
        const requestLog = this.requests.get(key) || [];
        
        // Filter out old requests outside the window
        const recentRequests = requestLog.filter(timestamp => now - timestamp < windowMs);
        
        // Check if limit exceeded
        if (recentRequests.length >= maxRequests) {
            return false;
        }
        
        // Add current request
        recentRequests.push(now);
        this.requests.set(key, recentRequests);
        
        return true;
    }

    /**
     * Get time until next request is allowed
     */
    getRetryAfter(key, windowMs = 60000) {
        const requestLog = this.requests.get(key) || [];
        if (requestLog.length === 0) return 0;
        
        const oldestRequest = Math.min(...requestLog);
        const retryAfter = (oldestRequest + windowMs) - Date.now();
        
        return Math.max(0, Math.ceil(retryAfter / 1000)); // Return seconds
    }

    /**
     * Clear rate limit for a key
     */
    clear(key) {
        this.requests.delete(key);
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;
