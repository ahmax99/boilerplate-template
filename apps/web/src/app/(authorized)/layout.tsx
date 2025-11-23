import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'

import { AuthProviders } from './provider'

interface AuthenticatedLayoutProps {
  readonly children: React.ReactNode
}

export default function AuthenticatedLayout({
  children
}: AuthenticatedLayoutProps) {
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
