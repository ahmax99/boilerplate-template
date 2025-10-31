import { Empty, EmptyDescription } from '@repo/ui/components/molecules'

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
      <Empty>
        <EmptyDescription>No todos yet. Create one above!</EmptyDescription>
      </Empty>
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
