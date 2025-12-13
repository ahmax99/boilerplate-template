import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'

import { AuthProviders } from './provider'

export default function AuthorizedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <AuthProviders>{children}</AuthProviders>
    </Suspense>
  )
}
