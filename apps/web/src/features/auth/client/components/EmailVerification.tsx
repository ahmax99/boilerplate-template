'use client'

import { useEffect, useRef, useState } from 'react'

import { authClient } from '@/lib/auth/auth.client'

import { AuthActionButton } from './AuthActionButton'

interface EmailVerification {
  email: string
}

export const EmailVerification = ({ email }: EmailVerification) => {
  const [timeToNextResend, setTimeToNextResend] = useState(30)
  const interval = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => startCountdown(), [])

  const startCountdown = (time = 30) => {
    setTimeToNextResend(time)
    clearInterval(interval.current)

    interval.current = setInterval(() => {
      setTimeToNextResend((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearInterval(interval.current)
          return 0
        }
        return newTime
      })
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mt-2">
        We sent you a verification link. Please check your email and click the
        link to verify your account.
      </p>

      <AuthActionButton
        action={() => {
          startCountdown()
          return authClient.sendVerificationEmail({
            email,
            callbackURL: '/'
          })
        }}
        className="w-full"
        disabled={timeToNextResend > 0}
        successMessage="Verification email sent!"
        variant="outline"
      >
        {timeToNextResend > 0
          ? `Resend Email (${timeToNextResend})`
          : 'Resend Email'}
      </AuthActionButton>
    </div>
  )
}
