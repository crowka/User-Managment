import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from './rate-limit';
import { securityHeaders } from './security-headers';
import { auditLog } from './audit-log';

type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Combines multiple middleware functions into a single middleware
 * @param middlewares Array of middleware functions to combine
 * @returns Combined middleware function
 */
export function combineMiddleware(middlewares: MiddlewareFunction[]) {
  return async function (req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) {
    try {
      // Create a middleware chain where each middleware calls the next one
      const chain = middlewares.reduceRight(
        (nextFn, middleware) => {
          return async () => {
            await middleware(req, res, nextFn);
          };
        },
        async () => {
          await next();
        }
      );

      await chain();
    } catch (error) {
      console.error('Middleware error:', error);
      await next();
    }
  };
}

/**
 * Default security middleware configuration
 */
export const defaultSecurityMiddleware = combineMiddleware([
  // Rate limiting - 100 requests per 15 minutes by default
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),

  // Security headers with default configuration
  securityHeaders(),

  // Audit logging with default configuration
  auditLog(),
]);

/**
 * API middleware configuration with customizable options
 */
export function createApiMiddleware(options: {
  rateLimit?: Parameters<typeof rateLimit>[0];
  securityHeaders?: Parameters<typeof securityHeaders>[0];
  auditLog?: Parameters<typeof auditLog>[0];
  skipMiddlewares?: ('rateLimit' | 'securityHeaders' | 'auditLog')[];
} = {}) {
  const middlewares: MiddlewareFunction[] = [];

  if (!options.skipMiddlewares?.includes('rateLimit')) {
    middlewares.push(rateLimit(options.rateLimit));
  }

  if (!options.skipMiddlewares?.includes('securityHeaders')) {
    middlewares.push(securityHeaders(options.securityHeaders));
  }

  if (!options.skipMiddlewares?.includes('auditLog')) {
    middlewares.push(auditLog(options.auditLog));
  }

  return combineMiddleware(middlewares);
}

/**
 * Helper function to wrap an API route with security middleware
 * @param handler API route handler
 * @param options Middleware configuration options
 * @returns Protected API route handler
 */
export function withSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options?: Parameters<typeof createApiMiddleware>[0]
) {
  const middleware = options ? createApiMiddleware(options) : defaultSecurityMiddleware;

  return async function secureHandler(req: NextApiRequest, res: NextApiResponse) {
    await middleware(req, res, async () => {
      await handler(req, res);
    });
  };
} 