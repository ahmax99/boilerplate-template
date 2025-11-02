import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'
import { Card, CardContent, CardTitle } from '@repo/ui/components/molecules'

import { TodoFormContainer } from '@/features/todos/client/components/TodoFormContainer'
import { TodosList } from '@/features/todos/server/components/TodosList'

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-0.5 p-6">
      <CardTitle className="text-3xl text-center">Todos CRUD Demo</CardTitle>

      <div className="space-y-3">
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-2 p-8">
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
              <TodosList limit={50} offset={0} />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </div>
  )
}
