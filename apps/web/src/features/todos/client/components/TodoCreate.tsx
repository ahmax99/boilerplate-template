'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { orpcClient } from '@/lib/api/orpc.client'

const TODOS_QUERY_INPUT = { limit: 50, offset: 0 } as const

export function TodoCreate() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const createMutation = useMutation({
    ...orpcClient.todos.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcClient.todos.list.queryKey({
          input: TODOS_QUERY_INPUT
        })
      })
      router.refresh()
      setNewTitle('')
      setNewDescription('')
    }
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

  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Plus className="h-5 w-5" />
        Create New Todo
      </h2>
      <div className="space-y-3">
        <input
          className="bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
          type="text"
          value={newTitle}
        />
        <input
          className="bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description (optional)"
          type="text"
          value={newDescription}
        />
        <button
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          disabled={!newTitle.trim() || createMutation.isPending}
          onClick={handleCreate}
          type="button"
        >
          {createMutation.isPending ? 'Creating...' : 'Add Todo'}
        </button>
      </div>
    </div>
  )
}
