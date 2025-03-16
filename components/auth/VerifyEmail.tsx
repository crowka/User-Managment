'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'

export function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { verifyEmail, resendVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return

    const verifyToken = async () => {
      setIsLoading(true)
      try {
        await verifyEmail(token)
        toast({
          title: 'Email verified',
          description: 'Your email has been verified successfully.',
        })
        router.push('/auth/login')
      } catch (error) {
        toast({
          title: 'Verification failed',
          description: 'Could not verify your email. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [searchParams, verifyEmail, router, toast])

  const onResendEmail = async () => {
    setIsLoading(true)
    try {
      await resendVerificationEmail()
      toast({
        title: 'Verification email sent',
        description: 'Please check your email for the verification link.',
      })
    } catch (error) {
      toast({
        title: 'Failed to send email',
        description: 'Could not send verification email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Button
        variant="outline"
        onClick={onResendEmail}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Resend verification email'}
      </Button>
    </div>
  )
} 