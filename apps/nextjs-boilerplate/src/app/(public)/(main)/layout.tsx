import { Suspense } from 'react'

import { PageHeader } from '@/components/layout'
import { AbilityProvider } from '@/features/auth/client/providers/PermissionProvider'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { ErrorScreenProvider } from '@/features/error/client/providers/ErrorScreenProvider'

async function PublicLayoutContent({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const rules = getUserPermissions().rules

  return <AbilityProvider rules={rules}>{children}</AbilityProvider>
}

export default function PublicLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ErrorScreenProvider />
      <Suspense>
        <PageHeader />
      </Suspense>
      <Suspense>
        <PublicLayoutContent>{children}</PublicLayoutContent>
      </Suspense>
    </>
  )
}
