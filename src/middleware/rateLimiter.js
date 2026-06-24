'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Apply to the /bfhl route.
 * 100 requests per minute per IP in production; relaxed in dev.
 */
const bfhlLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,       // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    is_success: false,
    message: 'Too many requests. Please try again later.',
  },
});

module.exports = { bfhlLimiter };
