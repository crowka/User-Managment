# User Management System

A comprehensive user management system built with Next.js and Supabase.

## Environment Setup

This project uses environment variables to manage configuration and sensitive information. Follow these steps to set up your environment:

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (private, server-side only)

   You can find these values in your Supabase dashboard under Project Settings > API.

3. For production deployment, set these environment variables in your hosting platform (Vercel, Netlify, etc.).

## Security Notes

- Never commit your `.env` file to version control
- The `.env.example` file serves as a template and should not contain real credentials
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges and should only be used server-side
- The `NEXT_PUBLIC_` prefix makes variables available on the client side, so only use it for non-sensitive information

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Testing

The project includes a comprehensive test suite to ensure functionality works as expected.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run simple tests (recommended for initial setup)
npm run test:simple
```

### Testing Framework

This project uses two test runners to accommodate different parts of the codebase:

#### Vitest (for TypeScript tests in `project/src/`)
- Used for TypeScript components and stores
- Provides better TypeScript support and faster execution
- Used primarily for:
  - React components with TypeScript
  - Zustand stores
  - Complex state management tests

#### Jest (for JavaScript tests in `__tests__/`)
- Used for JavaScript components and utilities
- Maintains compatibility with existing test suite
- Used primarily for:
  - React components in JavaScript
  - API route testing
  - Middleware testing
  - Database operations

#### Test Organization
- TypeScript tests (`project/src/`): Use Vitest
- JavaScript tests (`__tests__/`): Use Jest

New tests should follow this pattern:
- For new TypeScript components/stores in `project/src/`: Use Vitest
- For new JavaScript components in root: Use Jest

We use the following testing utilities across both frameworks:
- React Testing Library for component testing
- Node-mocks-http for API route testing
- Mock implementations for Supabase client

### Test Coverage

Our tests cover:
- Authentication components and flows
- User profile management
- Admin API functionality
- Middleware authentication and authorization
- Database operations

For more detailed information about testing, see the [Testing Documentation](TESTING.md).

## Production

```bash
# Build for production
npm run build

# Start the production server
npm start
```

## Project Structure

```
├── components/         # React components
├── lib/                # Utility functions and libraries
├── middleware/         # Next.js middleware
├── pages/              # Next.js pages and API routes
├── public/             # Static assets
├── styles/             # CSS and styling
└── __tests__/          # Test files
    ├── components/     # Component tests
    ├── lib/            # Library tests
    ├── middleware/     # Middleware tests
    └── pages/          # Page and API tests
```

## Documentation

- [Testing Documentation](TESTING.md) - Detailed information about testing strategy and implementation
- [Deployment Guide](docs/DEPLOYMENT.md) - Instructions for deploying to production 