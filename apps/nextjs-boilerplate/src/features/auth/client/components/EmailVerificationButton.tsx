'use client'

import { useEffect, useState } from 'react'

import { Timer } from '@/components/molecules'
import { useLocalStorage } from '@/hooks/useLocalStorage'

import type { EmailVerificationSchema } from '../../schemas/authForm.schema'
import { AuthActionButton } from './AuthActionButton'

interface EmailVerificationProps {
  email: EmailVerificationSchema['email']
}

// const RESEND_INTERVAL = 1 * 60 * 1000 // 1 minute

export const EmailVerificationButton = ({ email }: EmailVerificationProps) => {
  // const { handleEmailVerification } = useAuthActions()
  const STORAGE_KEY = `email-verification-timer-${email}`
  const [timerExpiredAt] = useLocalStorage(STORAGE_KEY, 0)
  const [canResend, setCanResend] = useState(true)

  useEffect(() => {
    if (timerExpiredAt > Date.now()) setCanResend(false)
  }, [timerExpiredAt])

  const handleTimerExpired = (isExpired: boolean) => {
    setCanResend(isExpired)
    if (isExpired && globalThis.window !== undefined)
      globalThis.localStorage.removeItem(STORAGE_KEY)
  }

  const handleAction = async () => {
    // const result = await handleEmailVerification(email)
    // if (result.error == null) {
    //   setTimerExpiredAt(Date.now() + RESEND_INTERVAL)
    //   setCanResend(false)
    // }
    // return result
    return { error: null } // TODO: implement email verification
  }

  return (
    <AuthActionButton
      action={handleAction}
      disabled={!canResend}
      size="sm"
      successMessage="Verification email sent!"
      variant="outline"
    >
      <span>Resend Verification Email</span>
      <Timer expiredAt={timerExpiredAt} onExpired={handleTimerExpired} />
    </AuthActionButton>
  )
}
