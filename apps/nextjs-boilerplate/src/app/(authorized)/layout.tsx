import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { PageHeader } from '@/components/layout'
import { AbilityProvider } from '@/features/auth/client/providers/PermissionProvider'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { getMe } from '@/features/auth/server/api'
import { getSessionData } from '@/features/auth/server/services/session'
import { ErrorScreenProvider } from '@/features/error/client/providers/ErrorScreenProvider'

async function AuthorizedLayoutContent({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionData()
  if (!session.refreshToken) redirect('/auth/login')

  const user = await getMe()
  const rules = getUserPermissions(user).rules

  return <AbilityProvider rules={rules}>{children}</AbilityProvider>
}

export default function AuthorizedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ErrorScreenProvider />
      <Suspense>
        <PageHeader />
      </Suspense>
      <Suspense>
        <AuthorizedLayoutContent>{children}</AuthorizedLayoutContent>
      </Suspense>
    </>
  )
}
