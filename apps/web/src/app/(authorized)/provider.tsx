import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth/auth.server'

interface AuthProvidersProps {
  readonly children: React.ReactNode
}

export const AuthProviders = async ({ children }: AuthProvidersProps) => {
  const session = await getSession()
  if (!session) redirect('/auth/login?callbackUrl=/')

  return <>{children}</>
}
