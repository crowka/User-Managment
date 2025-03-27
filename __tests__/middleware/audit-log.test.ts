import { createMocks } from 'node-mocks-http';
import { NextApiRequest } from 'next';
import { auditLog } from '../../middleware/audit-log';

// Import our standardized mock
jest.mock('../../lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../lib/supabase';

// Extend NextApiRequest to include user property
interface ExtendedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
    app_metadata?: {
      role: string;
    };
  };
}

describe('Audit Log Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log successful requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/users',
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '127.0.0.1',
      },
      body: {
        email: 'test@example.com',
        password: 'secret123',
      },
    });

    const next = jest.fn().mockImplementation(() => {
      res.status(201).json({ id: 1, email: 'test@example.com' });
    });

    const middleware = auditLog();
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    expect(supabase.from('audit_logs').insert).toHaveBeenCalledWith([
      expect.objectContaining({
        method: 'POST',
        path: '/api/users',
        status_code: 201,
        user_agent: 'test-agent',
        ip_address: '127.0.0.1',
        request_body: expect.objectContaining({
          email: 'test@example.com',
          password: '[REDACTED]',
        }),
        response_body: expect.objectContaining({
          id: 1,
          email: 'test@example.com',
        }),
      }),
    ]);
  });

  it('should respect excluded paths', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/health',
    });

    const next = jest.fn();
    const middleware = auditLog({
      excludePaths: ['/api/health'],
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should handle custom sensitive fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/users',
      body: {
        email: 'test@example.com',
        password: 'secret123',
        creditCard: '4111-1111-1111-1111',
        ssn: '123-45-6789',
      },
    });

    const next = jest.fn();
    const middleware = auditLog({
      sensitiveFields: ['password', 'creditCard', 'ssn'],
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(supabase.from('audit_logs').insert).toHaveBeenCalledWith([
      expect.objectContaining({
        request_body: expect.objectContaining({
          email: 'test@example.com',
          password: '[REDACTED]',
          creditCard: '[REDACTED]',
          ssn: '[REDACTED]',
        }),
      }),
    ]);
  });

  it('should include custom fields', async () => {
    const { req, res } = createMocks<ExtendedRequest>({
      method: 'POST',
      url: '/api/users',
    });

    req.user = { 
      id: 'user123', 
      role: 'authenticated',
      app_metadata: { role: 'admin' }
    };
    
    const next = jest.fn();
    const middleware = auditLog({
      customFields: (req: ExtendedRequest) => ({
        user_id: req.user?.id,
        user_role: req.user?.app_metadata?.role,
      }),
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(supabase.from('audit_logs').insert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 'user123',
        user_role: 'admin',
      }),
    ]);
  });

  it('should handle errors during request processing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/users',
    });

    const error = new Error('Test error');
    const next = jest.fn().mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const middleware = auditLog();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(supabase.from('audit_logs').insert).toHaveBeenCalledWith([
      expect.objectContaining({
        error: 'Test error',
        status_code: 500,
      }),
    ]);
    expect(consoleSpy).toHaveBeenCalledWith('Audit log middleware error:', error);
    
    consoleSpy.mockRestore();
  });

  it('should handle database errors gracefully', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/users',
      headers: {
        'user-agent': 'test-agent',
      },
    });

    const dbError = new Error('Database error');
    (supabase.from('audit_logs').insert as jest.Mock).mockRejectedValue(dbError);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const middleware = auditLog();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error saving audit log:',
      dbError
    );
    
    consoleSpy.mockRestore();
  });
});
