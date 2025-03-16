'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-[800px] space-y-6 px-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Something went wrong!
        </h2>
        <p className="text-lg text-muted-foreground sm:text-xl">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
} 