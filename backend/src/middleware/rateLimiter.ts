import rateLimit from 'express-rate-limit';
import env from '../config/env';

// General rate limiter: 100 requests per minute
export const generalLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Maximum ${env.rateLimitMax} requests per ${env.rateLimitWindowMs / 1000} seconds.`,
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
});

// Strict rate limiter for AI endpoints: 10 requests per minute
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many AI generation requests. Maximum 10 requests per minute.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter: 5 login attempts per minute
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again in 1 minute.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
});

// API rate limiter middleware factory
export function createRateLimiter(max: number, windowMs: number = 60000) {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Maximum ${max} requests per ${windowMs / 1000} seconds.`,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}
