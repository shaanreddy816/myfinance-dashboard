/**
 * In-Memory Cache Service
 * Provides simple caching to avoid hitting API rate limits
 * For production, consider Redis or Vercel KV
 */

class CacheService {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Time-to-live tracking
    }

    /**
     * Set a cache entry with TTL (in seconds)
     */
    set(key, value, ttlSeconds = 300) {
        this.cache.set(key, value);
        this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
    }

    /**
     * Get a cache entry if not expired
     */
    get(key) {
        const expiry = this.ttl.get(key);
        
        // Check if expired
        if (!expiry || Date.now() > expiry) {
            this.cache.delete(key);
            this.ttl.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }

    /**
     * Clear expired entries (cleanup)
     */
    cleanup() {
        const now = Date.now();
        for (const [key, expiry] of this.ttl.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.ttl.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.ttl.clear();
    }
}

// Singleton instance
const cache = new CacheService();

// Cleanup every 10 minutes
setInterval(() => cache.cleanup(), 10 * 60 * 1000);

module.exports = cache;
