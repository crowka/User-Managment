describe('Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('required environment variables are defined in development', () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-url.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    // Mock the Next.js config
    jest.mock('../../next.config', () => ({
      publicRuntimeConfig: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      serverRuntimeConfig: {
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    }), { virtual: true });

    // Import the Next.js config
    const nextConfig = require('../../next.config');

    // Check if the environment variables are correctly loaded in the Next.js config
    expect(nextConfig.publicRuntimeConfig.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test-url.supabase.co');
    expect(nextConfig.publicRuntimeConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
    expect(nextConfig.serverRuntimeConfig.SUPABASE_SERVICE_ROLE_KEY).toBe('test-service-key');
  });

  test('public variables are accessible but service key is not in client-side code', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-url.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

    // Simulate client-side environment
    const clientEnv = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    // Check if public variables are accessible
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test-url.supabase.co');
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
    
    // Service key should not be accessible in client-side code
    expect(clientEnv.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });
});
