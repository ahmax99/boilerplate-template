import { orpcServer } from '@/lib/api/orpc.server'

import { TodoItem } from '../../client/components/TodoItem'

interface TodosListProps {
  readonly limit?: number
  readonly offset?: number
  readonly userId?: number
}

export async function TodosList({
  limit = 50,
  offset = 0,
  userId
}: TodosListProps) {
  const todos = await orpcServer.todos.list({ limit, offset, userId })

  if (!todos || todos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No todos yet. Create one above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
