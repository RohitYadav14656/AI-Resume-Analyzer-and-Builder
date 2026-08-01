const rateLimit = require("express-rate-limit");

/**
 * Global API rate limiter — applied to all routes.
 * 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Strict limiter for auth routes (login / register).
 * 10 requests per 15 minutes per IP — prevents brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts, please try again after 15 minutes.",
  },
});

/**
 * Limiter for the AI analyze endpoint.
 * 20 requests per 15 minutes per IP — protects against API cost abuse.
 */
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many analyze requests, please try again after 15 minutes.",
  },
});

module.exports = { globalLimiter, authLimiter, analyzeLimiter };
