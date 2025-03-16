import { createClient } from '@supabase/supabase-js';

// Mock before importing the module that uses it
jest.mock('@supabase/supabase-js');

// Import after mocking
import { getServiceSupabase, supabase } from '../../lib/supabase';

describe('Supabase Client', () => {
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockSupabaseAnonKey = 'test-anon-key';
  const mockSupabaseServiceKey = 'test-service-key';
  const mockClient = {
    auth: { signIn: jest.fn(), signUp: jest.fn() },
    from: jest.fn(),
    storage: { from: jest.fn() }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockSupabaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mockSupabaseAnonKey;
    process.env.SUPABASE_SERVICE_KEY = mockSupabaseServiceKey;
    
    // Reset the module to force re-creation of the client
    jest.resetModules();
    
    // Mock createClient to return our mock client
    createClient.mockReturnValue(mockClient);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
  });

  it('should create a Supabase client with correct parameters', () => {
    // Re-import to get fresh instance
    const { supabase } = require('../../lib/supabase');
    expect(createClient).toHaveBeenCalledWith(mockSupabaseUrl, mockSupabaseAnonKey);
  });

  it('should create a service role client with correct parameters', () => {
    // Re-import to get fresh instance
    const { getServiceSupabase } = require('../../lib/supabase');
    const serviceClient = getServiceSupabase();
    expect(createClient).toHaveBeenCalledWith(mockSupabaseUrl, mockSupabaseServiceKey);
  });

  it('should throw error when SUPABASE_SERVICE_KEY is missing', () => {
    delete process.env.SUPABASE_SERVICE_KEY;
    // Re-import to get fresh instance
    const { getServiceSupabase } = require('../../lib/supabase');
    expect(() => getServiceSupabase()).toThrow('SUPABASE_SERVICE_KEY is not set');
  });

  it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Re-import to get fresh instance
    const { getServiceSupabase } = require('../../lib/supabase');
    expect(() => getServiceSupabase()).toThrow('NEXT_PUBLIC_SUPABASE_URL is not set');
  });
});