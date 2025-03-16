'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { AppUser, AuthContextType, AuthCredentials, IAuthProvider, RegisterData } from '../types/auth'

class SupabaseAuthProvider implements IAuthProvider {
  constructor(private client: SupabaseClient) {}

  async signIn(credentials: AuthCredentials): Promise<AppUser | null> {
    const { data, error } = await this.client.auth.signInWithPassword(credentials)
    if (error) throw error
    return data.user as AppUser
  }

  async signUp(data: RegisterData): Promise<AppUser | null> {
    const { data: authData, error } = await this.client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          userType: data.userType,
          businessInfo: data.businessInfo,
        }
      }
    })
    if (error) throw error
    return authData.user as AppUser
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) throw error
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }

  async signInWithProvider(provider: 'google' | 'github'): Promise<AppUser | null> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    // OAuth redirects to the callback URL, so we return null here
    return null
  }

  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    const { data: { subscription } } = this.client.auth.onAuthStateChange((_, session) => {
      callback(session?.user as AppUser ?? null)
    })
    return () => subscription.unsubscribe()
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseProvider({ 
  children,
  serverSession
}: { 
  children: React.ReactNode
  serverSession?: AppUser | null
}) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )
  
  const [authProvider] = useState(() => new SupabaseAuthProvider(supabase))
  const [user, setUser] = useState<AppUser | null>(serverSession ?? null)
  const router = useRouter()

  useEffect(() => {
    return authProvider.onAuthStateChange((user) => {
      setUser(user)
      router.refresh()
    })
  }, [authProvider, router])

  const value: AuthContextType = {
    user,
    supabase,
    signIn: (credentials) => authProvider.signIn(credentials),
    signUp: (data) => authProvider.signUp(data),
    signOut: () => authProvider.signOut(),
    resetPassword: (email) => authProvider.resetPassword(email),
    updatePassword: (oldPassword, newPassword) => authProvider.updatePassword(oldPassword, newPassword),
    signInWithProvider: (provider) => authProvider.signInWithProvider(provider)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used inside SupabaseProvider')
  }
  return context
} 