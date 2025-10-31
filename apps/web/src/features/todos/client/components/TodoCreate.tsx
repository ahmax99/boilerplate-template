'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Input } from '@repo/ui/components/atoms'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@repo/ui/components/molecules'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

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
      toast.success('Todo created successfully')
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Todo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
          type="text"
          value={newTitle}
        />
        <Input
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description (optional)"
          type="text"
          value={newDescription}
        />
        <Button
          disabled={!newTitle.trim() || createMutation.isPending}
          onClick={handleCreate}
          type="button"
        >
          {createMutation.isPending ? 'Creating...' : 'Add Todo'}
        </Button>
      </CardContent>
    </Card>
  )
}
