'use client'

import { ThemeProvider } from 'next-themes'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { UserProvider } from '@/lib/providers/user-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </SupabaseProvider>
    </ThemeProvider>
  )
} 