// __tests__/middleware/auth.test.js

const { createMocks } = require('node-mocks-http');
const { withAuth } = require('../../middleware/auth');

// Import our utility functions
const { setupTestEnvironment } = require('../utils/environment-setup');
const { createMockUser, createMockAdminUser } = require('../utils/testing-utils');

// Import and use our standardized mock
jest.mock('../../lib/supabase', () => require('../__mocks__/supabase'));
const { supabase } = require('../../lib/supabase');

describe('Auth Middleware', () => {
  // Setup test environment
  let cleanup;
  
  beforeAll(() => {
    cleanup = setupTestEnvironment();
  });
  
  afterAll(() => {
    if (cleanup) cleanup();
  });
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('allows authenticated requests to proceed', async () => {
    // Use our utility to create a mock user
    const mockUser = createMockUser();
    
    // Mock authenticated user with exact structure expected by the middleware
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
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
    
    // Check if the user was added to the request with the correct structure
    expect(req.user).toEqual(mockUser);
    
    // Verify Supabase was called with the right token
    expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
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
    // Mock auth error with exact structure expected by the middleware
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
    
    // Verify Supabase was called with the right token
    expect(supabase.auth.getUser).toHaveBeenCalledWith('invalid-token');
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
    // Use our utility to create a mock admin user
    const mockAdminUser = createMockAdminUser();
    
    // Mock authenticated user with admin role
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: mockAdminUser
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
    // Use our utility to create a regular user
    const mockUser = createMockUser();
    
    // Mock authenticated user without admin role
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: mockUser
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
  
  test('correctly extracts token from different authorization formats', async () => {
    // Test cases for different authorization header formats
    const testCases = [
      { header: 'Bearer token123', expectedToken: 'token123' },
      { header: 'token123', expectedToken: 'token123' }
    ];
    
    for (const testCase of testCases) {
      // Clear mocks before each test case
      jest.clearAllMocks();
      
      // Create a mock user
      const mockUser = createMockUser();
      
      // Mock authenticated user
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: mockUser
        },
        error: null,
      });
      
      const handler = jest.fn().mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });
      
      const protectedHandler = withAuth(handler);
      
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: testCase.header,
        },
      });
      
      await protectedHandler(req, res);
      
      // Verify the token was extracted correctly
      expect(supabase.auth.getUser).toHaveBeenCalledWith(testCase.expectedToken);
      expect(handler).toHaveBeenCalled();
    }
  });
});
