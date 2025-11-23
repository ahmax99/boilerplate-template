'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { authClient } from '@/lib/auth/auth.client'

import { AuthActionButton } from './AuthActionButton'

export function PasskeyButton() {
  const router = useRouter()
  const { refetch } = authClient.useSession()

  useEffect(() => {
    authClient.signIn.passkey(
      { autoFill: true },
      {
        onSuccess() {
          refetch()
          router.push('/')
        }
      }
    )
  }, [router, refetch])

  return (
    <AuthActionButton
      action={() =>
        authClient.signIn.passkey(undefined, {
          onSuccess() {
            refetch()
            router.push('/')
          }
        })
      }
      className="w-full"
      variant="outline"
    >
      Use Passkey
    </AuthActionButton>
  )
}
