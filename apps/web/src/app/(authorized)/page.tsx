import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'
import { Card, CardContent } from '@repo/ui/components/molecules'
import { LogOut } from 'lucide-react'

import { AuthActionButton } from '@/features/auth/client/components'
import { PUBLIC_AUTH_ROUTES } from '@/features/auth/constants/routes'
import { signOut } from '@/features/auth/server/action'
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
        <AuthActionButton
          action={signOut}
          redirectTo={PUBLIC_AUTH_ROUTES.login}
          size="sm"
          successMessage="Signed out successfully"
          variant="outline"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </AuthActionButton>
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
