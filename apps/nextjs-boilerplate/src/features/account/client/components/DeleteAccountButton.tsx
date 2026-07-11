'use client'

import { useAccountActions } from '../hooks/useAccountActions'

import { AuthActionButton } from '@/features/auth/client/components/AuthActionButton'

export const DeleteAccountButton = () => {
  const { handleDeleteAccount } = useAccountActions()

  return (
    <AuthActionButton
      action={() => handleDeleteAccount()}
      requireAreYouSure
      variant="destructive"
    >
      Delete Account Permanently
    </AuthActionButton>
  )
}
