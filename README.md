# User Management System

A modular and flexible user management system built with Next.js, TypeScript, and Supabase. This system can be easily integrated into any web or mobile application.

## Features

### Authentication & Authorization
- ✅ Email/Password registration and login
- ✅ OAuth provider integration (Google)
- ✅ Password recovery/reset
- ✅ JWT token implementation
- ✅ Role-based access control
- ✅ Session management
- ✅ Two-factor authentication (2FA)

### User Profile Management
- ✅ Profile creation/editing
- ✅ Avatar/profile picture upload
- ✅ Privacy settings
- ✅ Profile visibility options
- ✅ Connected accounts management
- ✅ Profile verification system

### Security Features
- ✅ Password hashing/encryption
- ✅ Input validation/sanitization
- ✅ CSRF protection
- ⏳ Rate limiting
- ⏳ Security headers
- ✅ Session timeout handling
- ⏳ Audit logging

### User Preferences & Settings
- ✅ Language/localization settings
- ✅ Notification preferences
- ✅ Theme preferences (light/dark mode)
- ✅ Privacy settings management
- ⏳ Communication preferences

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
├── app/                  # Next.js app directory
│   ├── auth/            # Authentication pages
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   └── verify/      # Email verification page
│   ├── error.tsx        # Error handling
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── ui/             # UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   ├── providers/     # Context providers
│   ├── stores/        # State management
│   ├── types/         # TypeScript types
│   ├── supabase.ts    # Supabase client
│   └── utils.ts       # Helper functions
└── public/            # Static assets
```

## Integration Guide

### As a Module

1. Install the package:
   ```bash
   npm install @your-org/user-management
   ```

2. Import and use the UserManagementProvider:
   ```tsx
   import { UserManagementProvider } from '@your-org/user-management'

   function App() {
     return (
       <UserManagementProvider>
         <YourApp />
       </UserManagementProvider>
     )
   }
   ```

3. Use the authentication hooks:
   ```tsx
   import { useAuth } from '@your-org/user-management'

   function LoginButton() {
     const { signIn } = useAuth()
     // Use authentication functions
   }
   ```

### Environment Configuration

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

Optional environment variables:
- `NEXT_PUBLIC_APP_URL`: Your application URL
- `NEXT_PUBLIC_APP_NAME`: Your application name

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