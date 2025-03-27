// __tests__/utils/testing-utils.js

import { supabase } from '../../lib/supabase';

/**
 * Creates a mock user with customizable properties
 * @param {Object} overrides - Custom properties to override defaults
 * @returns {Object} A mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'authenticated',
    app_metadata: { role: 'user' },
    ...overrides
  };
}

/**
 * Creates a mock admin user with customizable properties
 * @param {Object} overrides - Custom properties to override defaults
 * @returns {Object} A mock admin user object
 */
export function createMockAdminUser(overrides = {}) {
  return createMockUser({
    id: 'admin-user-id',
    email: 'admin@example.com',
    app_metadata: { role: 'admin' },
    ...overrides
  });
}

/**
 * Creates a mock profile with customizable properties
 * @param {Object} overrides - Custom properties to override defaults
 * @returns {Object} A mock profile object
 */
export function createMockProfile(overrides = {}) {
  return {
    id: 'test-user-id',
    full_name: 'Test User',
    website: 'https://example.com',
    avatar_url: 'https://example.com/avatar.jpg',
    ...overrides
  };
}

/**
 * Configures supabase mock for authentication
 * @param {Object} user - User object to return from getUser
 * @param {Object|null} error - Optional error to return
 */
export function mockAuthentication(user, error = null) {
  supabase.auth.getUser.mockResolvedValue({
    data: { user },
    error
  });
}

/**
 * Mocks a successful database operation
 * @param {string} table - Table name
 * @param {Object|Array} data - Data to return
 * @param {string} operation - Operation type (select, insert, update, etc.)
 */
export function mockDatabaseSuccess(table, data, operation = 'select') {
  const mockResponse = { data, error: null };
  
  // For operations that return a single item
  if (['single', 'maybeSingle'].includes(operation)) {
    supabase.single.mockResolvedValue(mockResponse);
    supabase.maybeSingle?.mockResolvedValue(mockResponse);
    return;
  }
  
  // For regular query operations
  const mock = supabase.from(table);
  
  if (operation === 'select') {
    mock.select.mockResolvedValue(mockResponse);
  } else if (operation === 'insert') {
    mock.insert.mockResolvedValue(mockResponse);
  } else if (operation === 'update') {
    mock.update.mockResolvedValue(mockResponse);
  } else if (operation === 'upsert') {
    mock.upsert.mockResolvedValue(mockResponse);
  } else if (operation === 'delete') {
    mock.delete.mockResolvedValue(mockResponse);
  }
}

/**
 * Mocks a database error
 * @param {string} table - Table name
 * @param {string} message - Error message
 * @param {string} operation - Operation type (select, insert, update, etc.)
 * @param {number} code - Error code
 */
export function mockDatabaseError(table, message, operation = 'select', code = 500) {
  const error = { message, code };
  const mockResponse = { data: null, error };
  
  // For operations that return a single item
  if (['single', 'maybeSingle'].includes(operation)) {
    supabase.single.mockResolvedValue(mockResponse);
    supabase.maybeSingle?.mockResolvedValue(mockResponse);
    return;
  }
  
  // For regular query operations
  const mock = supabase.from(table);
  
  if (operation === 'select') {
    mock.select.mockResolvedValue(mockResponse);
  } else if (operation === 'insert') {
    mock.insert.mockResolvedValue(mockResponse);
  } else if (operation === 'update') {
    mock.update.mockResolvedValue(mockResponse);
  } else if (operation === 'upsert') {
    mock.upsert.mockResolvedValue(mockResponse);
  } else if (operation === 'delete') {
    mock.delete.mockResolvedValue(mockResponse);
  }
}

/**
 * Mocks storage operations
 * @param {string} bucket - Bucket name
 * @param {Object} responses - Object containing responses for different operations
 */
export function mockStorage(bucket, responses = {}) {
  const defaultResponses = {
    upload: { data: { path: 'test-path.jpg' }, error: null },
    getPublicUrl: { data: { publicUrl: 'https://example.com/test.jpg' } },
    download: { data: new Blob(), error: null },
    remove: { data: { path: 'test-path.jpg' }, error: null },
    list: { data: [], error: null }
  };
  
  const mockResponses = { ...defaultResponses, ...responses };
  const mockBucket = supabase.storage.from(bucket);
  
  // Configure mock responses
  Object.entries(mockResponses).forEach(([operation, response]) => {
    if (operation === 'getPublicUrl') {
      mockBucket.getPublicUrl.mockReturnValue(response);
    } else {
      mockBucket[operation].mockResolvedValue(response);
    }
  });
}

/**
 * Clears all mocks and sets up common mock responses
 */
export function setupMocks() {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Set up default responses
  mockAuthentication(null);
  supabase.from.mockReturnThis();
  supabase.select.mockReturnThis();
  supabase.storage.from.mockReturnValue({
    upload: jest.fn().mockResolvedValue({ data: null, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: '' } }),
    download: jest.fn().mockResolvedValue({ data: null, error: null }),
    remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    list: jest.fn().mockResolvedValue({ data: [], error: null })
  });
}
