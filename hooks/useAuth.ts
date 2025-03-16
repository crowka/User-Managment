import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const router = useRouter()
  const { setUser, setSession, user, session } = useAuthStore()

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    setUser(data.user)
    setSession(data.session)
    return data
  }, [setUser, setSession])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    })

    if (error) throw error

    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    setUser(null)
    setSession(null)
    router.push('/auth/login')
  }, [router, setUser, setSession])

  const verifyEmail = useCallback(async (token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (error) throw error
  }, [])

  const resendVerificationEmail = useCallback(async () => {
    if (!user?.email) throw new Error('No email found')

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    })

    if (error) throw error
  }, [user?.email])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw error
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error

    return data
  }, [])

  return {
    user,
    session,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    resendVerificationEmail,
    resetPassword,
    updatePassword,
    signInWithGoogle,
  }
} 