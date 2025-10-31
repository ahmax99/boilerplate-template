'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Checkbox, Input } from '@repo/ui/components/atoms'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Card,
  CardContent
} from '@repo/ui/components/molecules'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Edit2, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { orpcClient } from '@/lib/api/orpc.client'

interface Todo {
  id: number
  title: string
  description: string | null
  isDone: boolean
  userId: number
}

interface TodoItemProps {
  readonly todo: Todo
}

const TODOS_QUERY_INPUT = { limit: 50, offset: 0 } as const

export function TodoItem({ todo }: TodoItemProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')

  const updateMutation = useMutation({
    ...orpcClient.todos.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcClient.todos.list.queryKey({
          input: TODOS_QUERY_INPUT
        })
      })
      router.refresh()
      setIsEditing(false)
      toast.success('Todo updated successfully')
    }
  })

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

  const handleUpdate = () =>
    updateMutation.mutate({
      id: todo.id,
      title: editTitle,
      description: editDescription || null
    })

  const handleDelete = () => deleteMutation.mutate({ id: todo.id })

  const handleToggle = () =>
    toggleMutation.mutate({
      id: todo.id,
      isDone: !todo.isDone
    })

  const startEdit = () => {
    setIsEditing(true)
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
  }

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        {isEditing ? (
          // UPDATE Form
          <div className="space-y-3">
            <Input
              onChange={(e) => setEditTitle(e.target.value)}
              type="text"
              value={editTitle}
            />
            <Input
              onChange={(e) => setEditDescription(e.target.value)}
              type="text"
              value={editDescription}
            />
            <div className="flex gap-2">
              <Button
                disabled={updateMutation.isPending}
                onClick={handleUpdate}
                size="sm"
                type="button"
              >
                <Check className="h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={cancelEdit}
                size="sm"
                type="button"
                variant="outline"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Display Mode
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={todo.isDone}
                  onCheckedChange={handleToggle}
                />
                <h3
                  className={`font-medium ${
                    todo.isDone ? 'text-muted-foreground line-through' : ''
                  }`}
                >
                  {todo.title}
                </h3>
              </div>
              {todo.description && (
                <p className="text-muted-foreground text-sm">
                  {todo.description}
                </p>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={deleteMutation.isPending}
                    size="icon"
                    title="Delete"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-2xs">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this todo? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
