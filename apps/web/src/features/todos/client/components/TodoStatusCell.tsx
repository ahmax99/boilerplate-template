'use client'

import { Badge, Checkbox } from '@repo/ui/components/atoms'

import type { Todo } from '../../schemas/todo.schema'
import { useTodoMutations } from '../hooks/useTodoMutations'

interface TodoStatusCellProps {
  readonly todo: Todo
}

export function TodoStatusCell({ todo }: TodoStatusCellProps) {
  const { useUpdateTodo } = useTodoMutations()
  const updateMutation = useUpdateTodo()

  const handleToggle = () =>
    updateMutation.mutate({
      id: todo.id,
      isDone: !todo.isDone
    })

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={todo.isDone}
        disabled={useUpdateTodo().isPending}
        onCheckedChange={handleToggle}
      />
      <Badge variant={todo.isDone ? 'secondary' : 'default'}>
        {todo.isDone ? 'Completed' : 'Pending'}
      </Badge>
    </div>
  )
}
