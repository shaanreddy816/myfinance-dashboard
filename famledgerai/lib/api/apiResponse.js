/**
 * Standardized API Response Helper
 * Ensures consistent response format across all endpoints
 */

/**
 * Success response
 */
function success(data, message = 'Success') {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
}

/**
 * Error response
 */
function error(message, statusCode = 500, details = null) {
    return {
        success: false,
        error: {
            message,
            statusCode,
            details
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Rate limit error
 */
function rateLimitError(retryAfter) {
    return {
        success: false,
        error: {
            message: 'Rate limit exceeded',
            statusCode: 429,
            retryAfter
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Validation error
 */
function validationError(fields) {
    return {
        success: false,
        error: {
            message: 'Validation failed',
            statusCode: 400,
            fields
        },
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    success,
    error,
    rateLimitError,
    validationError
};
