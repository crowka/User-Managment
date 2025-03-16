# Testing Documentation

This document outlines the testing strategy and setup for the User Management System.

## Testing Framework

We use Jest as our primary testing framework. The setup includes:

- Jest for test running and assertions
- React Testing Library for component testing
- Node-mocks-http for API route testing
- Mock implementations for Supabase client

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode (recommended during development):

```bash
npm run test:watch
```

To run a specific test file:

```bash
npm test -- path/to/test-file.js
```

## Test Structure

Tests are organized in the `__tests__` directory, mirroring the structure of the source code:

```
__tests__/
  ├── components/       # Component tests
  ├── lib/              # Library/utility tests
  ├── middleware/       # Middleware tests
  ├── pages/            # Page component and API route tests
  └── simple.test.js    # Basic test to verify Jest setup
```

## Mocking Strategy

### Supabase Client

The Supabase client is mocked in each test file that requires it. The mock implementation provides:

- Authentication methods (signIn, signUp, signOut, etc.)
- Database query methods (from, select, insert, update, delete, etc.)
- Storage methods for file uploads

Example mock implementation:

```javascript
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
  getServiceSupabase: jest.fn(),
}));
```

### API Routes

API routes are tested using `node-mocks-http` to create mock request and response objects:

```javascript
import { createMocks } from 'node-mocks-http';

const { req, res } = createMocks({
  method: 'GET',
  headers: {
    authorization: 'Bearer test-token',
  },
});
```

## Test Coverage

The following areas are covered by tests:

### Components
- Auth Component: Tests for sign-in, sign-up, form validation, and error handling
- Profile Component: Tests for profile display, updates, avatar uploads, and error handling

### Library Functions
- Supabase Client: Tests for client initialization, service role client, and error handling
- Database Operations: Tests for CRUD operations on user profiles

### Middleware
- Auth Middleware: Tests for authentication checks, admin role verification, and error handling

### API Routes
- Admin Users API: Tests for user retrieval, error handling, and method validation

## Adding New Tests

When adding new tests:

1. Create a test file in the appropriate directory under `__tests__`
2. Import the necessary testing utilities and the component/function to test
3. Mock external dependencies (especially Supabase)
4. Write test cases covering the main functionality and edge cases
5. Run the tests to ensure they pass

## Best Practices

- Clear mocks before each test using `jest.clearAllMocks()` in a `beforeEach` block
- Test both success and error scenarios
- For components, test rendering, user interactions, and state changes
- For API routes, test different HTTP methods and authentication requirements
- Use descriptive test names that explain what is being tested

## Current Test Status

All tests are currently passing. The test suite covers:

- Basic authentication flows
- User profile management
- Admin API functionality
- Middleware authentication and authorization
- Database operations

## Future Improvements

- Increase test coverage for all components and pages
- Add integration tests for complete user flows
- Implement end-to-end testing with Cypress or Playwright
- Set up continuous integration to run tests automatically 