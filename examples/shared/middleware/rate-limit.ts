/**
 * Rate limiting middleware for example applications
 */

import { Request, Response, NextFunction } from 'express';
import { sendRateLimit } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('rate-limit');

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const store: RateLimitStore = {};
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  // Clean up expired entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime <= now) {
        delete store[key];
      }
    }
  }, windowMs);

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or reset if window expired
    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const current = store[key];

    // Check if limit exceeded
    if (current.count >= max) {
      logger.warn('Rate limit exceeded', {
        key,
        count: current.count,
        max,
        windowMs,
        path: req.path,
      });

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));

      return sendRateLimit(res, message);
    }

    // Increment counter (will be decremented if request should be skipped)
    current.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));

    // Handle skipping successful or failed requests
    if (skipSuccessfulRequests || skipFailedRequests) {
      res.on('finish', () => {
        const shouldSkip = 
          (skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400);

        if (shouldSkip && store[key]) {
          store[key].count--;
        }
      });
    }

    next();
  };
}

/**
 * Create rate limiter for different endpoints
 */
export const rateLimiters = {
  /**
   * Strict rate limiting for authentication endpoints
   */
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later',
  }),

  /**
   * General API rate limiting
   */
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'API rate limit exceeded, please try again later',
  }),

  /**
   * Strict rate limiting for write operations
   */
  write: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 write operations per minute
    message: 'Too many write operations, please slow down',
  }),

  /**
   * Lenient rate limiting for read operations
   */
  read: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 read operations per minute
    message: 'Too many read operations, please slow down',
    skipSuccessfulRequests: false,
  }),

  /**
   * Very strict rate limiting for export operations
   */
  export: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 export operations per hour
    message: 'Export rate limit exceeded, please try again later',
  }),

  /**
   * Per-user rate limiting
   */
  perUser: (maxRequests: number, windowMs: number = 15 * 60 * 1000) => 
    rateLimit({
      windowMs,
      max: maxRequests,
      keyGenerator: (req: any) => req.user?.id || req.ip || 'unknown',
      message: 'User rate limit exceeded, please try again later',
    }),
};

/**
 * Redis-based rate limiting (for production use)
 */
export function createRedisRateLimit(redisClient: any, options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || 'unknown',
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate_limit:${keyGenerator(req)}`;
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redisClient.pipeline();
      pipeline.zremrangebyscore(key, 0, now - windowMs);
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      pipeline.zcard(key);
      pipeline.expire(key, Math.ceil(windowMs / 1000));

      const results = await pipeline.exec();
      const count = results[2][1];

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
      res.setHeader('X-RateLimit-Reset', Math.ceil((windowStart + windowMs) / 1000));

      if (count > max) {
        logger.warn('Redis rate limit exceeded', {
          key,
          count,
          max,
          windowMs,
          path: req.path,
        });

        return sendRateLimit(res, message);
      }

      next();
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      // Fail open - allow request if Redis is down
      next();
    }
  };
}

/**
 * Adaptive rate limiting based on server load
 */
export function adaptiveRateLimit(baseOptions: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Simple CPU-based adaptive limiting
    const loadAvg = process.cpuUsage().user / 1000000; // Convert to seconds
    const adaptiveFactor = Math.max(0.5, Math.min(2, 1 / (loadAvg + 0.1)));
    
    const adaptedMax = Math.floor(baseOptions.max * adaptiveFactor);
    
    const adaptedOptions = {
      ...baseOptions,
      max: adaptedMax,
    };

    return rateLimit(adaptedOptions)(req, res, next);
  };
}

/**
 * Rate limiting with burst capacity
 */
export function burstRateLimit(options: {
  points: number; // Number of points per window
  duration: number; // Window duration in seconds
  burst: number; // Burst capacity
}) {
  const store: { [key: string]: { points: number; resetTime: number; burst: number } } = {};
  const { points, duration, burst } = options;
  const windowMs = duration * 1000;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    // Initialize or reset if window expired
    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        points: points,
        resetTime: now + windowMs,
        burst: burst,
      };
    }

    const current = store[key];

    // Check if we have points available (including burst)
    const availablePoints = current.points + current.burst;
    
    if (availablePoints <= 0) {
      logger.warn('Burst rate limit exceeded', {
        key,
        points: current.points,
        burst: current.burst,
        path: req.path,
      });

      res.setHeader('X-RateLimit-Limit', points);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));
      res.setHeader('X-RateLimit-Burst', burst);

      return sendRateLimit(res, 'Rate limit exceeded');
    }

    // Consume a point, preferring burst capacity first
    if (current.burst > 0) {
      current.burst--;
    } else {
      current.points--;
    }

    // Set headers
    res.setHeader('X-RateLimit-Limit', points);
    res.setHeader('X-RateLimit-Remaining', current.points);
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));
    res.setHeader('X-RateLimit-Burst', current.burst);

    next();
  };
}