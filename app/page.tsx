import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-[800px] space-y-6 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          User Management System
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          A flexible and modular user management system that can be easily integrated into any web or mobile application.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/register">
              Create Account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 