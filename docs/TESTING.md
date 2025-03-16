# Testing Guide

This document provides instructions for running tests and understanding the test coverage for the User Management System.

## Test Structure

The tests are organized in the `__tests__` directory, mirroring the structure of the application:

- `__tests__/components/` - Tests for React components
- `__tests__/lib/` - Tests for utility functions and services
- `__tests__/pages/api/` - Tests for API endpoints
- `__tests__/config/` - Tests for configuration and environment variables

## Running Tests

### Running All Tests

To run all tests:

```bash
npm test
```

### Running Tests in Watch Mode

To run tests in watch mode (tests will re-run when files change):

```bash
npm run test:watch
```

### Running Tests with Coverage

To run tests and generate a coverage report:

```bash
npm run test:coverage
```

This will generate a coverage report in the `coverage` directory. You can open `coverage/lcov-report/index.html` in your browser to view the detailed coverage report.

### Running Specific Tests

You can also run specific tests using our custom test runner:

```bash
node run-tests.js
```

This script runs a simple test to verify that Jest is working correctly. More complex tests require additional setup.

## Current Test Status

The project includes the following tests:

1. **Simple Test** - A basic test to verify Jest is working correctly
2. **Supabase Client Tests** - Tests for the Supabase client utility (requires additional setup)
3. **Auth Component Tests** - Tests for the authentication component (requires additional setup)
4. **Admin API Tests** - Tests for the admin API endpoints (requires additional setup)
5. **Environment Variable Tests** - Tests for environment variable configuration (requires additional setup)
6. **Database Operation Tests** - Tests for database operations (requires additional setup)

## Test Coverage Areas

The tests cover the following areas:

1. **Supabase Client**
   - Initialization with environment variables
   - Error handling for missing environment variables
   - Service role client creation

2. **Authentication Component**
   - Rendering of the authentication form
   - Sign-in functionality
   - Sign-up functionality
   - Error handling

3. **Admin API**
   - Fetching users
   - Error handling
   - Method validation

4. **Environment Variables**
   - Validation of required environment variables
   - Security of sensitive variables

5. **Database Operations**
   - Fetching user profiles
   - Updating user data
   - Admin operations
   - Error handling

## Mocking

The tests use Jest's mocking capabilities to mock:

- Supabase client and its methods
- Environment variables
- HTTP requests and responses

## Known Issues and Limitations

Currently, some of the more complex tests require additional setup to run correctly:

1. **Supabase Client Tests** - These tests require proper mocking of the Supabase client and environment variables.
2. **Component Tests** - These tests require a proper React testing environment with mocked dependencies.
3. **API Tests** - These tests require mocked HTTP requests and responses.

We're working on improving the test setup to make these tests easier to run.

## Adding New Tests

When adding new functionality, please follow these guidelines for testing:

1. Create test files in the appropriate directory under `__tests__/`
2. Name test files with the `.test.js` extension
3. Mock external dependencies
4. Test both success and error scenarios
5. Aim for high test coverage of critical functionality

## Continuous Integration

Tests are automatically run in the CI pipeline on every pull request and push to the main branch. Pull requests cannot be merged if tests are failing. 