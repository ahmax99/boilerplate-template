'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { handleLogout } from '../../server/services/auth'
import { AuthActionButton } from './AuthActionButton'

export const LogoutButton = () => {
  const router = useRouter()

  const action = async () => {
    const { logoutUrl } = await handleLogout()

    router.push(logoutUrl)
    return { error: null }
  }

  return (
    <AuthActionButton
      action={action}
      size="sm"
      successMessage="Signed out successfully"
      variant="outline"
    >
      Sign Out
      <LogOut className="h-4 w-4" />
    </AuthActionButton>
  )
}
