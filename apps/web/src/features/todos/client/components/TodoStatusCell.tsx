'use client'

import { useRouter } from 'next/navigation'
import { Badge, Checkbox } from '@repo/ui/components/atoms'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { orpcClient } from '@/lib/api/orpc.client'

import type { Todo } from '../../schemas/todo.schema'
import { TODOS_QUERY_INPUT } from '../constants'

interface TodoStatusCellProps {
  readonly todo: Todo
}

export function TodoStatusCell({ todo }: TodoStatusCellProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    ...orpcClient.todos.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcClient.todos.list.queryKey({
          input: TODOS_QUERY_INPUT
        })
      })
      router.refresh()
    }
  })

  const handleToggle = () =>
    toggleMutation.mutate({
      id: todo.id,
      isDone: !todo.isDone
    })

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={todo.isDone}
        disabled={toggleMutation.isPending}
        onCheckedChange={handleToggle}
      />
      <Badge variant={todo.isDone ? 'secondary' : 'default'}>
        {todo.isDone ? 'Completed' : 'Pending'}
      </Badge>
    </div>
  )
}
