'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Checkbox } from '@repo/ui/components/atoms'
import { ActionButton } from '@repo/ui/components/organisms'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { orpcClient } from '@/lib/api/orpc.client'

import type { Todo } from '../../schemas/todo.schema'
import { TodoFormContainer } from './TodoFormContainer'

interface TodoItemProps {
  readonly todo: Todo
}

const TODOS_QUERY_INPUT = { limit: 50, offset: 0 } as const

export function TodoItem({ todo }: TodoItemProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const deleteMutation = useMutation({
    ...orpcClient.todos.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcClient.todos.list.queryKey({
          input: TODOS_QUERY_INPUT
        })
      })
      router.refresh()
      toast.success('Todo deleted successfully')
    }
  })

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

  const handleDelete = () => deleteMutation.mutate({ id: todo.id })

  const handleToggle = () =>
    toggleMutation.mutate({
      id: todo.id,
      isDone: !todo.isDone
    })

  const startEdit = () => setIsEditing(true)

  const cancelEdit = () => setIsEditing(false)

  return isEditing ? (
    // UPDATE Form
    <TodoFormContainer
      initialValues={{
        title: todo.title,
        description: todo.description || ''
      }}
      mode="edit"
      onCancel={cancelEdit}
      onSuccess={() => setIsEditing(false)}
      todoId={todo.id}
    />
  ) : (
    // Display Mode
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Checkbox checked={todo.isDone} onCheckedChange={handleToggle} />
          <h3
            className={`font-medium ${
              todo.isDone && 'text-muted-foreground line-through'
            }`}
          >
            {todo.title}
          </h3>
        </div>
        {todo.description && (
          <p className="text-muted-foreground text-sm">{todo.description}</p>
        )}
        <p className="text-muted-foreground text-xs">
          ID: {todo.id} | User: {todo.userId}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={startEdit}
          size="icon"
          title="Edit"
          type="button"
          variant="ghost"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <ActionButton
          action={async () => {
            handleDelete()
            return { error: false }
          }}
          areYouSureDescription="Are you sure you want to delete this todo? This action cannot be undone."
          requireAreYouSure
          size="icon"
          title="Delete"
          type="button"
          variant="ghost"
        >
          <Trash2 className="text-destructive h-4 w-4" />
        </ActionButton>
      </div>
    </div>
  )
}
