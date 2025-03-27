// __tests__/utils/api-testing-utils.js

import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Creates mock req/res objects with common defaults for API route testing
 * @param {Object} options - Options to customize the mocks
 * @returns {Object} Object containing req and res mocks
 */
export function createApiMocks(options = {}) {
  const { 
    method = 'GET', 
    body = {}, 
    query = {}, 
    headers = {},
    cookies = {},
    authUser = null,
    url = '/api/test'
  } = options;
  
  // Add authorization header if user is provided
  const finalHeaders = { ...headers };
  if (authUser) {
    finalHeaders.authorization = `Bearer mock-token-for-${authUser.id}`;
  }
  
  const { req, res } = createMocks({
    method,
    body,
    query,
    headers: finalHeaders,
    cookies,
    url
  });
  
  // Add user to request if provided
  if (authUser) {
    req.user = authUser;
  }
  
  // Add helper methods for testing responses
  res.getJsonData = () => JSON.parse(res._getData());
  
  return { req, res };
}

/**
 * Creates a test handler for API routes
 * @param {Function} handler - The API route handler
 * @param {Function} middleware - Optional middleware to apply
 * @returns {Function} A function that takes request options and returns a promise
 */
export function createTestHandler(handler, middleware = null) {
  return async (options = {}) => {
    const { req, res } = createApiMocks(options);
    
    if (middleware) {
      // Create a simple next function for middleware
      const next = jest.fn().mockImplementation(async () => {
        await handler(req, res);
      });
      
      await middleware(req, res, next);
      
      // If next wasn't called, the middleware handled the response
      if (next.mock.calls.length === 0) {
        return { req, res };
      }
    } else {
      await handler(req, res);
    }
    
    return { req, res };
  };
}

/**
 * Simulates a GET request to an API route
 * @param {Function} handler - The API route handler
 * @param {Object} options - Options for the request
 * @returns {Promise<Object>} Response data and status
 */
export async function testGet(handler, options = {}) {
  const testHandler = createTestHandler(handler);
  const { res } = await testHandler({ ...options, method: 'GET' });
  return {
    status: res._getStatusCode(),
    data: res.getJsonData()
  };
}

/**
 * Simulates a POST request to an API route
 * @param {Function} handler - The API route handler
 * @param {Object} body - Body for the request
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} Response data and status
 */
export async function testPost(handler, body = {}, options = {}) {
  const testHandler = createTestHandler(handler);
  const { res } = await testHandler({ ...options, method: 'POST', body });
  return {
    status: res._getStatusCode(),
    data: res.getJsonData()
  };
}

/**
 * Simulates a PUT request to an API route
 * @param {Function} handler - The API route handler
 * @param {Object} body - Body for the request
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} Response data and status
 */
export async function testPut(handler, body = {}, options = {}) {
  const testHandler = createTestHandler(handler);
  const { res } = await testHandler({ ...options, method: 'PUT', body });
  return {
    status: res._getStatusCode(),
    data: res.getJsonData()
  };
}

/**
 * Simulates a DELETE request to an API route
 * @param {Function} handler - The API route handler
 * @param {Object} options - Options for the request
 * @returns {Promise<Object>} Response data and status
 */
export async function testDelete(handler, options = {}) {
  const testHandler = createTestHandler(handler);
  const { res } = await testHandler({ ...options, method: 'DELETE' });
  return {
    status: res._getStatusCode(),
    data: res.getJsonData()
  };
}

/**
 * Simulates an authenticated request to an API route
 * @param {Function} handler - The API route handler
 * @param {Object} user - User object to authenticate with
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} Response data and status
 */
export async function testAuthenticated(handler, user, options = {}) {
  const testHandler = createTestHandler(handler);
  const { res } = await testHandler({ ...options, authUser: user });
  return {
    status: res._getStatusCode(),
    data: res.getJsonData()
  };
}
