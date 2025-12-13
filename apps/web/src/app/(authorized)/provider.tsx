import { redirect } from 'next/navigation'

import { PROTECTED_ROUTES } from '@/features/auth/constants/routes'
import { getCurrentSession } from '@/features/auth/server/api/getCurrentSession'

export const AuthProviders = async ({
  children
}: Readonly<{ children: React.ReactNode }>) => {
  const session = await getCurrentSession()

  if (!session) redirect(`/auth/login?callbackUrl=${PROTECTED_ROUTES.HOME}`)

  return <>{children}</>
}
