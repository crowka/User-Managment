import { createMocks } from 'node-mocks-http';
import usersHandler from '../../../../pages/api/admin/users';
import { getServiceSupabase } from '../../../../lib/supabase';

jest.mock('../../../../lib/supabase', () => ({
  getServiceSupabase: jest.fn(),
}));

describe('Admin Users API', () => {
  const mockUsers = [
    { id: '1', email: 'user1@example.com' },
    { id: '2', email: 'user2@example.com' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase client
    getServiceSupabase.mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockUsers,
        error: null,
      }),
    }));
  });

  it('should return users list for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await usersHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      users: mockUsers,
    });
    expect(getServiceSupabase).toHaveBeenCalled();
  });

  it('should return 405 for non-GET requests', async () => {
    const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    for (const method of methods) {
      const { req, res } = createMocks({
        method,
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      await usersHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed',
      });
      expect(getServiceSupabase).not.toHaveBeenCalled();
    }
  });

  it('should return 401 when authorization header is missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await usersHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Unauthorized',
    });
    expect(getServiceSupabase).not.toHaveBeenCalled();
  });

  it('should handle Supabase errors', async () => {
    getServiceSupabase.mockImplementationOnce(() => ({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    }));

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await usersHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Error fetching users',
    });
  });
}); 