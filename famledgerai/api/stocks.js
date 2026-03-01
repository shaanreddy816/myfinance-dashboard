/**
 * Stock API Route
 * GET /api/stocks?symbol=RELIANCE.BSE
 * GET /api/stocks?symbols=RELIANCE.BSE,TCS.BSE (batch)
 */

const stockService = require('./services/stockService');
const { success, error, rateLimitError } = require('./lib/apiResponse');

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json(error('Method not allowed', 405));
    }

    try {
        const { symbol, symbols } = req.query;

        // Batch request
        if (symbols) {
            const symbolArray = symbols.split(',').map(s => s.trim()).filter(Boolean);
            
            if (symbolArray.length === 0) {
                return res.status(400).json(error('No valid symbols provided', 400));
            }

            if (symbolArray.length > 10) {
                return res.status(400).json(error('Maximum 10 symbols allowed per request', 400));
            }

            const results = await stockService.getMultipleQuotes(symbolArray);
            return res.status(200).json(success(results, 'Stock quotes fetched successfully'));
        }

        // Single request
        if (!symbol) {
            return res.status(400).json(error('Symbol parameter is required', 400));
        }

        const quote = await stockService.getQuote(symbol);
        return res.status(200).json(success(quote, 'Stock quote fetched successfully'));

    } catch (err) {
        console.error('Stock API error:', err);

        // Handle rate limit errors
        if (err.message.includes('Rate limit')) {
            return res.status(429).json(rateLimitError(60));
        }

        // Handle validation errors
        if (err.message.includes('Invalid')) {
            return res.status(400).json(error(err.message, 400));
        }

        // Generic error
        return res.status(500).json(error(err.message || 'Failed to fetch stock data', 500));
    }
}
