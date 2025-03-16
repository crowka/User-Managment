make # User Management System

A modular and flexible user management system built with Next.js and TypeScript. This system leverages Supabase's powerful features while maintaining provider independence through clean abstractions.

## Architecture Overview

### Current Implementation
The system is currently built on top of Supabase, taking full advantage of its features:

#### Supabase Features (Current)
- 🔐 **Authentication & Authorization**
  - Email/Password, OAuth, Magic Links
  - Session management
  - JWT handling
  - Role-based access control (RLS)
  - MFA support
  
- 📦 **Database & Storage**
  - PostgreSQL database
  - Row Level Security
  - Real-time subscriptions
  - File storage for avatars
  
- 🔒 **Security & Compliance**
  - Built-in password hashing
  - CSRF protection
  - Rate limiting
  - Audit logging
  
- 🌐 **Edge Functions**
  - Serverless functions
  - Webhooks
  - Background jobs

### Abstraction Layer Architecture

To maintain provider independence, the system uses a three-layer architecture:

```
┌─────────────────────────────────────────┐
│            Application Layer            │
│  (Components, Hooks, Business Logic)    │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────┼─────────────────────┐
│         Abstract Interface Layer        │
│    (Provider-agnostic interfaces)       │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────┼─────────────────────┐
│         Provider Implementation         │
│   (Currently Supabase, replaceable)     │
└─────────────────────────────────────────┘
```

#### 1. Application Layer
- Uses provider-agnostic interfaces
- No direct Supabase imports
- Platform-independent business logic

#### 2. Abstract Interface Layer
```typescript
// Core interfaces that any provider must implement
interface IAuthService {
  signIn(credentials: AuthCredentials): Promise<User>;
  signUp(userData: UserData): Promise<User>;
  // ... other auth methods
}

interface IStorageService {
  uploadFile(file: File): Promise<string>;
  // ... other storage methods
}

interface IDatabaseService {
  query<T>(query: QueryParams): Promise<T>;
  // ... other database methods
}
```

#### 3. Provider Implementation Layer
```typescript
// Current Supabase implementation
class SupabaseAuthService implements IAuthService {
  constructor(private supabase: SupabaseClient) {}
  
  async signIn(credentials: AuthCredentials) {
    // Uses Supabase's auth features
    return this.supabase.auth.signIn(credentials);
  }
  // ... other implementations
}

// Example future implementation
class CustomAuthService implements IAuthService {
  async signIn(credentials: AuthCredentials) {
    // Custom authentication logic
    return customAuthProvider.login(credentials);
  }
}
```

## Project Structure

```
├── lib/
│   ├── core/                    # Core business logic
│   │   ├── interfaces/         # Provider-agnostic interfaces
│   │   ├── types/             # Shared types
│   │   └── services/          # Abstract service definitions
│   │
│   ├── providers/
│   │   ├── supabase/          # Current Supabase implementation
│   │   │   ├── auth.ts       # Supabase auth implementation
│   │   │   ├── storage.ts    # Supabase storage implementation
│   │   │   └── database.ts   # Supabase database implementation
│   │   │
│   │   └── implementations/   # Future provider implementations
│   │
│   └── utils/
│       ├── adapters/         # Provider-specific adapters
│       └── helpers/          # Shared utilities
```

## Using the System

### Current Usage (with Supabase)
```tsx
// No need to implement features that Supabase provides
<UserManagementProvider
  provider={{
    type: 'supabase',
    config: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }}
>
  <YourApp />
</UserManagementProvider>
```

### Future Custom Implementation
```tsx
// Implement your own features when needed
<UserManagementProvider
  provider={{
    type: 'custom',
    services: {
      auth: new CustomAuthService(),
      storage: new CustomStorageService(),
      database: new CustomDatabaseService()
    }
  }}
>
  <YourApp />
</UserManagementProvider>
```

## Feature Implementation Status

### Currently Using Supabase Features
- ✅ Authentication & Authorization (Supabase Auth)
- ✅ Database operations (Supabase PostgreSQL)
- ✅ File storage (Supabase Storage)
- ✅ Security features (Supabase built-in)
- ✅ Real-time subscriptions (Supabase real-time)

### Custom Implementation Ready
- ✅ Abstract interfaces defined
- ✅ Provider-agnostic business logic
- ✅ Adapter pattern for provider switching
- ✅ Platform-independent components

### Preparation for Provider Switch
To switch providers in the future:

1. Implement the core interfaces for your new provider
2. Create necessary adapters
3. Update configuration
4. No changes needed in application logic

## Development Guidelines

1. **Use Supabase Features**
   - Leverage all relevant Supabase functionality
   - Don't reinvent what Supabase provides
   - Use Supabase best practices

2. **Maintain Abstractions**
   - Keep provider-specific code isolated
   - Use interfaces for all provider interactions
   - Document provider-specific assumptions

3. **Feature Implementation**
   - First, check if Supabase provides the feature
   - If yes, use Supabase's implementation
   - If no, implement in a provider-agnostic way

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Supabase](https://supabase.io/) - Authentication & Database
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [ShadcN UI](https://ui.shadcn.com/) - UI components

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/user-management.git
   cd user-management
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── verify/        # Email verification page
│   ├── error.tsx          # Error handling
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── platform/         # Platform-specific components
│   │   ├── web/         # Web-specific components
│   │   ├── mobile/      # Mobile-specific components
│   │   └── desktop/     # Desktop-specific components
│   └── ui/              # Shared UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── providers/       # Context providers
│   │   ├── supabase/   # Supabase integration
│   │   └── platform/   # Platform detection
│   ├── stores/         # State management
│   ├── types/          # TypeScript types
│   └── utils/          # Helper functions
│       ├── web/       # Web-specific utilities
│       ├── mobile/    # Mobile-specific utilities
│       └── desktop/   # Desktop-specific utilities
├── public/              # Static assets
└── platform/            # Platform-specific implementations
    ├── web/            # Web platform code
    ├── mobile/         # Mobile platform code
    │   ├── ios/       # iOS-specific code
    │   └── android/   # Android-specific code
    └── desktop/        # Desktop platform code
        ├── windows/   # Windows-specific code
        ├── macos/     # macOS-specific code
        └── linux/     # Linux-specific code
```

## Development

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Schema

The project uses Supabase as the database with the following main tables:
- `auth.users` - User authentication data
- `public.profiles` - User profile information
- `public.settings` - User preferences and settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 