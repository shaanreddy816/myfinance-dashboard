/**
 * Mutual Fund API Route
 * GET /api/mutualfund?code=119551
 * GET /api/mutualfund?codes=119551,120503 (batch)
 */

const mutualFundService = require('./services/mutualFundService');
const { success, error } = require('./lib/apiResponse');

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json(error('Method not allowed', 405));
    }

    try {
        const { code, codes } = req.query;

        // Batch request
        if (codes) {
            const codeArray = codes.split(',').map(c => c.trim()).filter(Boolean);
            
            if (codeArray.length === 0) {
                return res.status(400).json(error('No valid scheme codes provided', 400));
            }

            if (codeArray.length > 20) {
                return res.status(400).json(error('Maximum 20 schemes allowed per request', 400));
            }

            const results = await mutualFundService.getMultipleNavs(codeArray);
            return res.status(200).json(success(results, 'Mutual fund NAVs fetched successfully'));
        }

        // Single request
        if (!code) {
            return res.status(400).json(error('Scheme code parameter is required', 400));
        }

        const nav = await mutualFundService.getNav(code);
        return res.status(200).json(success(nav, 'Mutual fund NAV fetched successfully'));

    } catch (err) {
        console.error('Mutual fund API error:', err);

        // Handle validation errors
        if (err.message.includes('Invalid') || err.message.includes('not found')) {
            return res.status(400).json(error(err.message, 400));
        }

        // Generic error
        return res.status(500).json(error(err.message || 'Failed to fetch mutual fund data', 500));
    }
}
