import { Suspense } from 'react'

import { TodoCreate } from '@/features/todos/client/components/TodoCreate'
import { TodosList } from '@/features/todos/components/TodosList'

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Todos CRUD Demo</h1>
      </div>

      <TodoCreate />

      <div className="space-y-3">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading todos...</div>
            </div>
          }
        >
          <TodosList limit={50} offset={0} />
        </Suspense>
      </div>
    </div>
  )
}
