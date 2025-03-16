# User Management System

A modern user management system built with React, TypeScript, and Supabase.

## Features

- User authentication (login, register, password reset)
- Profile management
- Role-based access control
- Dark mode support
- Internationalization (i18n)
- Responsive design
- Form validation with Zod
- Beautiful UI with Tailwind CSS and shadcn/ui

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account and project

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd user-management
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
  ├── components/     # Reusable components
  │   ├── auth/      # Authentication components
  │   ├── layout/    # Layout components
  │   ├── profile/   # Profile components
  │   └── ui/        # UI components (shadcn/ui)
  ├── lib/           # Utilities and configurations
  │   ├── api/       # API configuration
  │   ├── i18n/      # Internationalization
  │   ├── stores/    # State management
  │   └── types/     # TypeScript types
  ├── pages/         # Page components
  └── test/          # Test setup and utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI

## Testing

The project uses Vitest for testing. Tests are located next to the components they test with the `.test.tsx` extension.

To run tests:
```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 