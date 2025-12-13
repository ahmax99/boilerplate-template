import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { PROTECTED_ROUTES } from '@/features/auth/constants/routes'
import { authServer } from '@/features/auth/lib/auth.server'

export const AuthProviders = async ({
  children
}: Readonly<{ children: React.ReactNode }>) => {
  const session = await authServer.api.getSession({ headers: await headers() })

  if (!session) redirect(`/auth/login?callbackUrl=${PROTECTED_ROUTES.HOME}`)

  return <>{children}</>
}
