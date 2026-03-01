/**
 * Gold Price API Route
 * GET /api/gold
 * GET /api/gold?grams=10
 */

const goldService = require('./services/goldService');
const { success, error, rateLimitError } = require('./lib/apiResponse');

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json(error('Method not allowed', 405));
    }

    try {
        const { grams } = req.query;

        // Get price for specific weight
        if (grams) {
            const weight = parseFloat(grams);
            
            if (isNaN(weight) || weight <= 0) {
                return res.status(400).json(error('Invalid weight. Must be a positive number.', 400));
            }

            if (weight > 10000) {
                return res.status(400).json(error('Maximum weight is 10,000 grams', 400));
            }

            const priceData = await goldService.getPriceByWeight(weight);
            return res.status(200).json(success(priceData, 'Gold price fetched successfully'));
        }

        // Get base price per gram
        const priceData = await goldService.getPrice();
        return res.status(200).json(success(priceData, 'Gold price fetched successfully'));

    } catch (err) {
        console.error('Gold API error:', err);

        // Handle rate limit errors
        if (err.message.includes('Rate limit')) {
            return res.status(429).json(rateLimitError(3600));
        }

        // Handle configuration errors
        if (err.message.includes('not configured')) {
            return res.status(503).json(error('Service temporarily unavailable', 503));
        }

        // Generic error
        return res.status(500).json(error(err.message || 'Failed to fetch gold price', 500));
    }
}
