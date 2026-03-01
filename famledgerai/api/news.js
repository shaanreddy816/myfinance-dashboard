/**
 * Financial News API Route
 * GET /api/news?category=general&limit=5
 * GET /api/news?symbol=AAPL (company news)
 */

const newsService = require('./services/newsService');
const { success, error, rateLimitError } = require('./lib/apiResponse');

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json(error('Method not allowed', 405));
    }

    try {
        const { category, limit, symbol, from, to } = req.query;

        // Company-specific news
        if (symbol) {
            const news = await newsService.getCompanyNews(symbol, from, to);
            return res.status(200).json(success(news, 'Company news fetched successfully'));
        }

        // General financial news
        const newsCategory = category || 'general';
        const newsLimit = limit ? parseInt(limit) : 5;

        // Validate limit
        if (isNaN(newsLimit) || newsLimit < 1 || newsLimit > 50) {
            return res.status(400).json(error('Limit must be between 1 and 50', 400));
        }

        // Validate category
        const validCategories = ['general', 'forex', 'crypto', 'merger'];
        if (!validCategories.includes(newsCategory)) {
            return res.status(400).json(error(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400));
        }

        const news = await newsService.getNews(newsCategory, newsLimit);
        return res.status(200).json(success(news, 'News fetched successfully'));

    } catch (err) {
        console.error('News API error:', err);

        // Handle rate limit errors
        if (err.message.includes('Rate limit')) {
            return res.status(429).json(rateLimitError(60));
        }

        // Handle configuration errors
        if (err.message.includes('not configured')) {
            return res.status(503).json(error('Service temporarily unavailable', 503));
        }

        // Generic error
        return res.status(500).json(error(err.message || 'Failed to fetch news', 500));
    }
}
