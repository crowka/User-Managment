import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import { securityHeaders } from './security-headers';

describe('Security Headers Middleware', () => {
  let req: NextApiRequest;
  let res: NextApiResponse;
  let setHeaderFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    req = {} as NextApiRequest;
    setHeaderFn = vi.fn();
    res = {
      setHeader: setHeaderFn,
    } as unknown as NextApiResponse;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const normalizeHeaderValue = (value: string) => {
    return value.replace(/\s+/g, ' ').trim();
  };

  it('should set default security headers', async () => {
    const middleware = securityHeaders();
    const next = vi.fn();

    await middleware(req, res, next);

    const expectedHeaders = {
      'X-DNS-Prefetch-Control': 'on',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data: https:; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Expect-CT': 'max-age=86400, enforce'
    };

    Object.entries(expectedHeaders).forEach(([header, value]) => {
      const calls = setHeaderFn.mock.calls.filter((call) => Array.isArray(call) && call[0] === header);
      expect(calls.length).toBe(1);
      expect(normalizeHeaderValue(calls[0][1])).toBe(normalizeHeaderValue(value));
    });

    expect(next).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const middleware = securityHeaders();
    const next = vi.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(middleware(req, res, next)).rejects.toThrow('Test error');

    expect(consoleSpy).toHaveBeenCalledWith('Security headers middleware error:', expect.any(Error));
    expect(next).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
}); 