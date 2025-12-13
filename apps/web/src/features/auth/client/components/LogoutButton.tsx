'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { PUBLIC_AUTH_ROUTES } from '../../constants/routes'
import { authClient } from '../../lib/auth.client'
import { AuthActionButton } from './AuthActionButton'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      router.replace(PUBLIC_AUTH_ROUTES.LOGIN)
      return { error: null }
    } catch {
      return { error: { message: 'Failed to sign out' } }
    }
  }

  return (
    <AuthActionButton
      action={handleLogout}
      size="sm"
      successMessage="Signed out successfully"
      variant="outline"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </AuthActionButton>
  )
}
