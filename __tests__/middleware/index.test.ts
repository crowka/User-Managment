import { createMocks } from 'node-mocks-http';
import { combineMiddleware, createApiMiddleware, withSecurity } from '@/middleware/index';
import { rateLimit } from '@/middleware/rate-limit';
import { securityHeaders } from '@/middleware/security-headers';
import { auditLog } from '@/middleware/audit-log';

// Mock the individual middleware functions
jest.mock('@/middleware/rate-limit', () => ({
  rateLimit: jest.fn(() => async (req: any, res: any, next: any) => {
    res.setHeader('X-RateLimit-Limit', '100');
    await next();
  }),
}));

jest.mock('@/middleware/security-headers', () => ({
  securityHeaders: jest.fn(() => async (req: any, res: any, next: any) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    await next();
  }),
}));

jest.mock('@/middleware/audit-log', () => ({
  auditLog: jest.fn(() => async (req: any, res: any, next: any) => {
    res.setHeader('X-Audit-Log', 'enabled');
    await next();
  }),
}));

describe('Middleware Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('combineMiddleware', () => {
    it('should execute middleware in the correct order', async () => {
      const { req, res } = createMocks();
      const executionOrder: string[] = [];

      const middleware1 = async (req: any, res: any, next: any) => {
        executionOrder.push('middleware1');
        await next();
      };

      const middleware2 = async (req: any, res: any, next: any) => {
        executionOrder.push('middleware2');
        await next();
      };

      const combined = combineMiddleware([middleware1, middleware2]);
      const next = jest.fn();

      await combined(req, res, next);

      expect(executionOrder).toEqual(['middleware1', 'middleware2']);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors in middleware chain', async () => {
      const { req, res } = createMocks();
      const error = new Error('Test error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const errorMiddleware = async () => {
        throw error;
      };

      const combined = combineMiddleware([errorMiddleware]);
      const next = jest.fn();

      await combined(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith('Middleware error:', error);
      expect(next).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('createApiMiddleware', () => {
    it('should create middleware with default configuration', async () => {
      const { req, res } = createMocks();
      const middleware = createApiMiddleware();
      const next = jest.fn();

      await middleware(req, res, next);

      expect(rateLimit).toHaveBeenCalled();
      expect(securityHeaders).toHaveBeenCalled();
      expect(auditLog).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.getHeader('X-RateLimit-Limit')).toBe('100');
      expect(res.getHeader('Content-Security-Policy')).toBe("default-src 'self'");
      expect(res.getHeader('X-Audit-Log')).toBe('enabled');
    });

    it('should skip specified middleware', async () => {
      const { req, res } = createMocks();
      const middleware = createApiMiddleware({
        skipMiddlewares: ['rateLimit', 'auditLog'],
      });
      const next = jest.fn();

      await middleware(req, res, next);

      expect(rateLimit).not.toHaveBeenCalled();
      expect(securityHeaders).toHaveBeenCalled();
      expect(auditLog).not.toHaveBeenCalled();
      expect(res.getHeader('Content-Security-Policy')).toBe("default-src 'self'");
    });

    it('should pass custom options to middleware', async () => {
      const { req, res } = createMocks();
      const middleware = createApiMiddleware({
        rateLimit: { max: 50 },
        securityHeaders: { xFrameOptions: 'DENY' },
        auditLog: { logHeaders: true },
      });
      const next = jest.fn();

      await middleware(req, res, next);

      expect(rateLimit).toHaveBeenCalledWith({ max: 50 });
      expect(securityHeaders).toHaveBeenCalledWith({ xFrameOptions: 'DENY' });
      expect(auditLog).toHaveBeenCalledWith({ logHeaders: true });
    });
  });

  describe('withSecurity', () => {
    it('should wrap handler with security middleware', async () => {
      const { req, res } = createMocks();
      const handler = jest.fn();
      const secureHandler = withSecurity(handler);

      await secureHandler(req, res);

      expect(handler).toHaveBeenCalledWith(req, res);
      expect(res.getHeader('X-RateLimit-Limit')).toBe('100');
      expect(res.getHeader('Content-Security-Policy')).toBe("default-src 'self'");
      expect(res.getHeader('X-Audit-Log')).toBe('enabled');
    });

    it('should use custom middleware options', async () => {
      const { req, res } = createMocks();
      const handler = jest.fn();
      const secureHandler = withSecurity(handler, {
        rateLimit: { max: 50 },
        skipMiddlewares: ['auditLog'],
      });

      await secureHandler(req, res);

      expect(handler).toHaveBeenCalledWith(req, res);
      expect(rateLimit).toHaveBeenCalledWith({ max: 50 });
      expect(auditLog).not.toHaveBeenCalled();
    });

    it('should handle errors in the handler', async () => {
      const { req, res } = createMocks();
      const error = new Error('Handler error');
      const handler = jest.fn().mockRejectedValue(error);
      const secureHandler = withSecurity(handler);

      await expect(secureHandler(req, res)).rejects.toThrow(error);
    });
  });
}); 