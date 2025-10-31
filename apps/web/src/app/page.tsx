import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'
import { Card, CardHeader, CardTitle } from '@repo/ui/components/molecules'

import { TodoCreate } from '@/features/todos/client/components/TodoCreate'
import { TodosList } from '@/features/todos/server/components/TodosList'

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Todos CRUD Demo</CardTitle>
        </CardHeader>
      </Card>

      <TodoCreate />

      <div className="space-y-3">
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-2 p-8">
              <Spinner className="h-6 w-6" />
            </div>
          }
        >
          <TodosList limit={50} offset={0} />
        </Suspense>
      </div>
    </div>
  )
}
