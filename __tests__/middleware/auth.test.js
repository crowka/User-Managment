const { createMocks } = require('node-mocks-http');
const { withAuth } = require('../../middleware/auth');
const { supabase } = require('../../lib/supabase');

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('allows authenticated requests to proceed', async () => {
    // Mock authenticated user
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: 'authenticated',
        },
      },
      error: null,
    });

    // Create a mock handler that the middleware will wrap
    const handler = jest.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler
    const protectedHandler = withAuth(handler);

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was called
    expect(handler).toHaveBeenCalled();
    
    // Check if the response is correct
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
    
    // Check if the user was added to the request
    expect(req.user).toEqual({
      id: 'user123',
      email: 'test@example.com',
      role: 'authenticated',
    });
  });

  test('rejects requests without authorization header', async () => {
    // Create a mock handler that the middleware will wrap
    const handler = jest.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler
    const protectedHandler = withAuth(handler);

    // Create mock request and response without auth header
    const { req, res } = createMocks({
      method: 'GET',
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was NOT called
    expect(handler).not.toHaveBeenCalled();
    
    // Check if the response is correct (401 Unauthorized)
    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ 
      error: 'Unauthorized: Missing authorization header' 
    });
  });

  test('rejects requests with invalid token', async () => {
    // Mock auth error
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    // Create a mock handler that the middleware will wrap
    const handler = jest.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler
    const protectedHandler = withAuth(handler);

    // Create mock request and response with invalid token
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was NOT called
    expect(handler).not.toHaveBeenCalled();
    
    // Check if the response is correct (401 Unauthorized)
    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ 
      error: 'Unauthorized: Invalid token' 
    });
  });

  test('handles server errors during authentication', async () => {
    // Mock server error
    supabase.auth.getUser.mockRejectedValue(new Error('Server error'));

    // Create a mock handler that the middleware will wrap
    const handler = jest.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler
    const protectedHandler = withAuth(handler);

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was NOT called
    expect(handler).not.toHaveBeenCalled();
    
    // Check if the response is correct (500 Server Error)
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ 
      error: 'Server error during authentication' 
    });
  });

  test('checks for admin role when required', async () => {
    // Mock authenticated user with admin role
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          role: 'authenticated',
          app_metadata: { role: 'admin' },
        },
      },
      error: null,
    });

    // Create a mock handler that the middleware will wrap
    const handler = jest.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler with admin requirement
    const protectedHandler = withAuth(handler, { requireAdmin: true });

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was called
    expect(handler).toHaveBeenCalled();
    
    // Check if the response is correct
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });

  test('rejects non-admin users when admin is required', async () => {
    // Mock authenticated user without admin role
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user123',
          email: 'user@example.com',
          role: 'authenticated',
          app_metadata: { role: 'user' },
        },
      },
      error: null,
    });

    // Create a mock handler that the middleware will wrap
    const handler = jest.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler with admin requirement
    const protectedHandler = withAuth(handler, { requireAdmin: true });

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was NOT called
    expect(handler).not.toHaveBeenCalled();
    
    // Check if the response is correct (403 Forbidden)
    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ 
      error: 'Forbidden: Admin access required' 
    });
  });
}); 