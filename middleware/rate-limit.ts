import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { UserManagementError } from '@/lib/types/errors';

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max number of requests per window
  keyGenerator?: (req: NextApiRequest) => string; // Function to generate unique keys
  handler?: (req: NextApiRequest, res: NextApiResponse) => void; // Custom rate limit exceeded handler
  skipFailedRequests?: boolean; // Whether to skip failed requests (non-2xx responses)
  skipSuccessfulRequests?: boolean; // Whether to skip successful requests
}

const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    return `rate-limit:${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: new UserManagementError('TOO_MANY_REQUESTS', 'Too many requests, please try again later.')
    });
  },
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
};

// Initialize Redis client (you'll need to add REDIS_URL to your environment variables)
const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
});

export function rateLimit(options: RateLimitOptions = {}) {
  const opts: Required<RateLimitOptions> = { ...defaultOptions, ...options };

  return async function rateLimitMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) {
    try {
      const key = opts.keyGenerator(req);
      const now = Date.now();
      const windowStart = now - opts.windowMs;

      // Get the current hits for this key
      const hits = await redis.zcount(key, windowStart, now);

      if (hits >= opts.max) {
        return opts.handler(req, res);
      }

      // Add the current request timestamp to the sorted set
      await redis.zadd(key, { score: now, member: now.toString() });
      
      // Set expiry on the key to clean up old data
      await redis.expire(key, Math.floor(opts.windowMs / 1000));

      // Add headers to response
      res.setHeader('X-RateLimit-Limit', opts.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.max - hits - 1));
      res.setHeader('X-RateLimit-Reset', Math.ceil((windowStart + opts.windowMs) / 1000));

      // Create a proxy for the response to track its status
      const originalEnd = res.end;
      const originalJson = res.json;
      let responded = false;

      res.end = function(chunk?: any, encoding?: any, callback?: any) {
        if (!responded) {
          responded = true;
          if (
            (res.statusCode >= 200 && res.statusCode < 300 && !opts.skipSuccessfulRequests) ||
            (res.statusCode >= 400 && !opts.skipFailedRequests)
          ) {
            // Count the request
          }
        }
        originalEnd.call(this, chunk, encoding, callback);
      };

      res.json = function(data: any) {
        if (!responded) {
          responded = true;
          if (
            (res.statusCode >= 200 && res.statusCode < 300 && !opts.skipSuccessfulRequests) ||
            (res.statusCode >= 400 && !opts.skipFailedRequests)
          ) {
            // Count the request
          }
        }
        return originalJson.call(this, data);
      };

      await next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next();
    }
  };
} 