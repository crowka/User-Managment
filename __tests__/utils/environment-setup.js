// __tests__/utils/environment-setup.js

/**
 * Sets up the testing environment before running tests
 */
export function setupTestEnvironment() {
  // Store original environment variables
  const originalEnv = { ...process.env };

  // Set up required environment variables for tests
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-url.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.REDIS_TOKEN = 'test-redis-token';

  // Set up browser-like environment for tests
  if (typeof window === 'undefined') {
    global.window = {};
  }

  if (typeof localStorage === 'undefined') {
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
  }

  if (typeof sessionStorage === 'undefined') {
    global.sessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
  }

  if (typeof document === 'undefined') {
    global.document = {
      createElement: jest.fn(),
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      documentElement: {
        style: {}
      }
    };
  }

  // Set up mock APIs
  if (typeof fetch === 'undefined') {
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        status: 200,
        statusText: 'OK'
      })
    );
  }

  // Return cleanup function
  return () => {
    // Restore original environment variables
    process.env = originalEnv;

    // Clean up mocks
    if (global.fetch && typeof global.fetch.mockReset === 'function') {
      global.fetch.mockReset();
    }
  };
}

/**
 * Creates a mock console for capturing and suppressing console output
 * @returns {Object} Mock console with original methods and capture/restore functions
 */
export function createMockConsole() {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };

  // Store captured console output
  const captured = {
    logs: [],
    warnings: [],
    errors: [],
    infos: [],
    debugs: []
  };

  // Replace console methods with mocks
  console.log = jest.fn((...args) => {
    captured.logs.push(args);
  });

  console.warn = jest.fn((...args) => {
    captured.warnings.push(args);
  });

  console.error = jest.fn((...args) => {
    captured.errors.push(args);
  });

  console.info = jest.fn((...args) => {
    captured.infos.push(args);
  });

  console.debug = jest.fn((...args) => {
    captured.debugs.push(args);
  });

  // Return helper object
  return {
    // Get captured output
    captured,

    // Reset captured output
    reset: () => {
      captured.logs = [];
      captured.warnings = [];
      captured.errors = [];
      captured.infos = [];
      captured.debugs = [];

      console.log.mockClear();
      console.warn.mockClear();
      console.error.mockClear();
      console.info.mockClear();
      console.debug.mockClear();
    },

    // Restore original console methods
    restore: () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    }
  };
}

/**
 * Sets up mock timers for testing
 * @param {Object} options - Options for mock timers
 * @returns {Function} Cleanup function
 */
export function setupMockTimers(options = {}) {
  const {
    advanceTimers = false,
    now = new Date('2023-01-01T00:00:00Z')
  } = options;

  // Use fake timers
  jest.useFakeTimers({
    now: now.getTime(),
    doNotFake: ['nextTick', 'setImmediate', 'clearImmediate']
  });

  // Advance timers if requested
  if (advanceTimers) {
    jest.advanceTimersByTime(0);
  }

  // Return cleanup function
  return () => {
    jest.useRealTimers();
  };
}

/**
 * Mocks the Next.js router
 * @param {Object} routerProps - Properties to set on the router
 * @returns {Object} Mocked router
 */
export function mockNextRouter(routerProps = {}) {
  const router = {
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    isFallback: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    },
    ...routerProps
  };

  // Set up the mock
  jest.mock('next/router', () => ({
    useRouter: () => router
  }));

  return router;
}
