'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Edit2, Trash2, X } from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this todo?')) {
      deleteMutation.mutate({ id: todo.id })
    }
  }

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
    <div className="bg-card hover:bg-accent/50 rounded-lg border p-4 shadow-sm transition-colors">
      {isEditing ? (
        // UPDATE Form
        <div className="space-y-3">
          <input
            className="bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            onChange={(e) => setEditTitle(e.target.value)}
            type="text"
            value={editTitle}
          />
          <input
            className="bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            onChange={(e) => setEditDescription(e.target.value)}
            type="text"
            value={editDescription}
          />
          <div className="flex gap-2">
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded-md px-3 py-1.5 text-sm"
              disabled={updateMutation.isPending}
              onClick={handleUpdate}
              type="button"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
            <button
              className="hover:bg-accent flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm"
              onClick={cancelEdit}
              type="button"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Display Mode
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <input
                checked={todo.isDone}
                className="h-4 w-4 cursor-pointer rounded border-gray-300"
                onChange={handleToggle}
                type="checkbox"
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
            <button
              className="hover:bg-accent rounded-md p-2"
              onClick={startEdit}
              title="Edit"
              type="button"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              className="text-destructive hover:bg-destructive/10 rounded-md p-2"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              title="Delete"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
