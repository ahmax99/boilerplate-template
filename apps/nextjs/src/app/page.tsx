import { Suspense } from 'react'

import { TodoList } from '@/components/TodoList'

export default async function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TodoList />
    </Suspense>
  )
}
