import { redirect } from 'next/navigation'

import { PROTECTED_ROUTES } from '@/features/auth/constants/routes'
import { getSession } from '@/features/auth/server/action'

export const AuthProviders = async ({
  children
}: Readonly<{ children: React.ReactNode }>) => {
  const session = await getSession()
  if (!session) redirect(`/auth/login?callbackUrl=${PROTECTED_ROUTES.home}`)

  return <>{children}</>
}
