import { createMocks } from 'node-mocks-http';
import { rateLimit } from '../../middleware/rate-limit';

// Import our standardized Redis mock
jest.mock('@upstash/redis', () => require('../__mocks__/redis'));
import { Redis } from '@upstash/redis';

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow requests within rate limit', async () => {
    const { req, res } = createMocks({
      ip: '127.0.0.1',
      method: 'GET',
      url: '/api/test'
    });
    const next = jest.fn();
    const middleware = rateLimit();
    const mockRedis = Redis.fromEnv();

    // Configure mock to indicate request within limits
    (mockRedis.zcount as jest.Mock).mockResolvedValueOnce(5); // 5 requests made (under limit)

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res._getStatusCode()).not.toBe(429);
    expect(res.getHeader('X-RateLimit-Limit')).toBe(100);
    expect(res.getHeader('X-RateLimit-Remaining')).toBe(95); // 100 - 5 = 95
  });

  it('should block requests exceeding rate limit', async () => {
    const { req, res } = createMocks({
      ip: '127.0.0.1',
      method: 'GET',
      url: '/api/test'
    });
    const next = jest.fn();
    const middleware = rateLimit();
    const mockRedis = Redis.fromEnv();

    // Mock Redis to indicate rate limit exceeded
    (mockRedis.zcount as jest.Mock).mockResolvedValueOnce(100);

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData())).toEqual({
      error: {
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  });

  it('should use custom key generator if provided', async () => {
    const { req, res } = createMocks({
      ip: '127.0.0.1',
      method: 'GET',
      url: '/api/test',
      headers: {
        'x-user-id': '12345',
      },
    });
    const next = jest.fn();
    const customKeyGenerator = (req: any) => `rate-limit:user:${req.headers['x-user-id']}`;
    const middleware = rateLimit({ keyGenerator: customKeyGenerator });
    const mockRedis = Redis.fromEnv();

    await middleware(req, res, next);

    expect(mockRedis.zadd).toHaveBeenCalledWith(
      'rate-limit:user:12345',
      expect.any(Number),
      expect.any(String)
    );
  });

  it('should use custom handler if provided', async () => {
    const { req, res } = createMocks({
      ip: '127.0.0.1',
      method: 'GET',
      url: '/api/test'
    });
    const next = jest.fn();
    const customHandler = jest.fn();
    const middleware = rateLimit({ handler: customHandler });
    const mockRedis = Redis.fromEnv();

    // Mock Redis to indicate rate limit exceeded
    (mockRedis.zcount as jest.Mock).mockResolvedValueOnce(100);

    await middleware(req, res, next);

    expect(customHandler).toHaveBeenCalledWith(req, res);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle Redis errors gracefully', async () => {
    const { req, res } = createMocks({
      ip: '127.0.0.1',
      method: 'GET',
      url: '/api/test'
    });
    const next = jest.fn();
    const middleware = rateLimit();
    const mockRedis = Redis.fromEnv();
    const error = new Error('Redis error');

    // Mock Redis to throw an error
    (mockRedis.zcount as jest.Mock).mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Rate limit middleware error:',
      error
    );
    
    consoleSpy.mockRestore();
  });
});
