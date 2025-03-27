import { NextApiRequest, NextApiResponse } from 'next';
import { securityHeaders } from '../../middleware/security-headers';

describe('Security Headers Middleware', () => {
  let req: NextApiRequest;
  let res: NextApiResponse;

  beforeEach(() => {
    req = {
      headers: {},
    } as NextApiRequest;

    res = {
      setHeader: jest.fn(),
      getHeader: jest.fn(),
    } as unknown as NextApiResponse;
  });

  test('should set default security headers', async () => {
    const middleware = securityHeaders();
    const next = jest.fn();

    await middleware(req, res, next);

    // Create an object of expected headers
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

    // Verify each header was set with correct value
    Object.entries(expectedHeaders).forEach(([header, value]) => {
      expect(res.setHeader).toHaveBeenCalledWith(header, value);
    });

    // Verify next() was called
    expect(next).toHaveBeenCalled();
  });

  test('should set custom headers if provided', async () => {
    const customCSP = "default-src 'self'; script-src 'self'";
    const middleware = securityHeaders({
      contentSecurityPolicy: customCSP,
      xFrameOptions: 'DENY'
    });
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', customCSP);
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(next).toHaveBeenCalled();
  });

  test('should handle errors gracefully', async () => {
    const middleware = securityHeaders();
    const next = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await middleware(req, res, next);

    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Security headers middleware error:', expect.any(Error));
    
    // Verify next was called even after error
    expect(next).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
