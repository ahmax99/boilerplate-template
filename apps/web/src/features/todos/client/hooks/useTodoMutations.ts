'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { orpcClient } from '@/lib/api/orpc.client'

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

  const useCreateTodo = (options?: UseCreateTodoOptions) =>
    useMutation({
      ...orpcClient.todos.create.mutationOptions(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['todos']
        })
        router.refresh()
        toast.success('Todo created successfully')
        options?.onSuccess?.()
      }
    })

  const useUpdateTodo = (options?: UseUpdateTodoOptions) =>
    useMutation({
      ...orpcClient.todos.update.mutationOptions(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['todos']
        })
        router.refresh()
        toast.success('Todo updated successfully')
        options?.onSuccess?.()
      }
    })

  const useDeleteTodo = (options?: UseDeleteTodoOptions) =>
    useMutation({
      ...orpcClient.todos.delete.mutationOptions(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['todos']
        })
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
