import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'
import { Card, CardContent } from '@repo/ui/components/molecules'

import { LogoutButton } from '@/features/auth/client/components'
import { TodoFormContainer } from '@/features/todos/client/components'
import { TodosList } from '@/features/todos/server/components'
import { UserDisplay } from '@/features/users/server/components'

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-0.5 p-1.5 flex flex-col min-h-screen">
      <div className="flex items-center justify-end gap-3 py-sm relative">
        <Suspense fallback={<Spinner className="h-6 w-6" />}>
          <UserDisplay />
        </Suspense>
        <LogoutButton />
      </div>

      <div className="space-y-3 flex-1 relative">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <Spinner className="h-6 w-6" />
            </div>
          }
        >
          <Card>
            <CardContent>
              <TodoFormContainer mode="create" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <TodosList />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </div>
  )
}
