'use client'
import { useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Edit2, Plus, Check, X } from 'lucide-react'

import { orpcClient } from '@/lib/api/orpc.client'

interface Todo {
  id: number
  title: string
  description: string | null
  isDone: boolean
  userId: number
}

const TODOS_QUERY_INPUT = { limit: 50, offset: 0 } as const

export const Todos = () => {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const queryOptions = orpcClient.todos.list.queryOptions({
    input: TODOS_QUERY_INPUT
  })

  const {
    data: todos,
    isLoading,
    error
  } = useQuery({
    ...queryOptions,
    queryFn: async (context) => await queryOptions.queryFn(context)
  })

  const createMutation = useMutation({
    ...orpcClient.todos.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcClient.todos.list.queryKey({
          input: TODOS_QUERY_INPUT
        })
      })
      setNewTitle('')
      setNewDescription('')
    }
  })

  const updateMutation = useMutation({
    ...orpcClient.todos.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcClient.todos.list.queryKey({
          input: TODOS_QUERY_INPUT
        })
      })
      setEditingId(null)
    }
  })

  const deleteMutation = useMutation({
    ...orpcClient.todos.delete.mutationOptions(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: orpcClient.todos.list.queryKey({
          input: TODOS_QUERY_INPUT
        })
      })
  })

  const toggleMutation = useMutation({
    ...orpcClient.todos.update.mutationOptions(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: orpcClient.todos.list.queryKey({
          input: TODOS_QUERY_INPUT
        })
      })
  })

  const handleCreate = () => {
    if (!newTitle.trim()) return

    createMutation.mutate({
      title: newTitle,
      description: newDescription || null,
      isDone: false,
      userId: 3 // TODO: get user id from auth
    })
  }

  const handleUpdate = (id: number) =>
    updateMutation.mutate({
      id,
      title: editTitle,
      description: editDescription || null
    })

  const handleDelete = (id: number) =>
    confirm('Are you sure you want to delete this todo?') &&
    deleteMutation.mutate({ id })

  const handleToggle = (todo: Todo) =>
    toggleMutation.mutate({
      id: todo.id,
      isDone: !todo.isDone
    })

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading todos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm">
          Error loading todos: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Todos CRUD Demo</h1>
        <p className="text-muted-foreground">
          Full CRUD operations using oRPC + TanStack Query
        </p>
      </div>

      {/* CREATE Form */}
      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Plus className="h-5 w-5" />
          Create New Todo
        </h2>
        <div className="space-y-3">
          <input
            className="bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            placeholder="Title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            className="bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            placeholder="Description (optional)"
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            disabled={!newTitle.trim() || createMutation.isPending}
            onClick={handleCreate}
          >
            {createMutation.isPending ? 'Creating...' : 'Add Todo'}
          </button>
        </div>
      </div>

      {/* READ - List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          All Todos ({todos?.length || 0})
        </h2>

        {!todos || todos.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No todos yet. Create one above!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="bg-card hover:bg-accent/50 rounded-lg border p-4 shadow-sm transition-colors"
              >
                {editingId === todo.id ? (
                  // UPDATE Form
                  <div className="space-y-3">
                    <input
                      className="bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      className="bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded-md px-3 py-1.5 text-sm"
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdate(todo.id)}
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        className="hover:bg-accent flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm"
                        onClick={cancelEdit}
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
                          type="checkbox"
                          onChange={() => handleToggle(todo)}
                        />
                        <h3
                          className={`font-medium ${
                            todo.isDone
                              ? 'text-muted-foreground line-through'
                              : ''
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
                        title="Edit"
                        onClick={() => startEdit(todo)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="text-destructive hover:bg-destructive/10 rounded-md p-2"
                        disabled={deleteMutation.isPending}
                        title="Delete"
                        onClick={() => handleDelete(todo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
