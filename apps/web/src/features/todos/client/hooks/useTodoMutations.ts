'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { orpcClient } from '@/lib/api/orpc.client'
import { authClient } from '@/lib/auth/auth.client'

interface UseCreateTodoOptions {
  readonly onSuccess?: () => void
}

interface UseUpdateTodoOptions {
  readonly onSuccess?: () => void
}

interface UseDeleteTodoOptions {
  readonly onSuccess?: () => void
}

export const useTodoMutations = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  const invalidateTodosQuery = () => {
    queryClient.invalidateQueries({
      queryKey: orpcClient.todos.list.queryKey({
        input: {
          limit: 50,
          offset: 0,
          userId: session?.user?.id
        }
      })
    })
  }

  const useCreateTodo = (options?: UseCreateTodoOptions) =>
    useMutation({
      ...orpcClient.todos.create.mutationOptions(),
      onSuccess: () => {
        invalidateTodosQuery()
        router.refresh()
        toast.success('Todo created successfully')
        options?.onSuccess?.()
      }
    })

  const useUpdateTodo = (options?: UseUpdateTodoOptions) =>
    useMutation({
      ...orpcClient.todos.update.mutationOptions(),
      onSuccess: () => {
        invalidateTodosQuery()
        router.refresh()
        toast.success('Todo updated successfully')
        options?.onSuccess?.()
      }
    })

  const useDeleteTodo = (options?: UseDeleteTodoOptions) =>
    useMutation({
      ...orpcClient.todos.delete.mutationOptions(),
      onSuccess: () => {
        invalidateTodosQuery()
        router.refresh()
        toast.success('Todo deleted successfully')
        options?.onSuccess?.()
      }
    })

  return {
    useCreateTodo,
    useUpdateTodo,
    useDeleteTodo
  }
}
