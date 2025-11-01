'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/components/atoms'
import { useAppForm } from '@repo/ui/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { orpcClient } from '@/lib/api/orpc.client'

import { type TodoFormData, todoFormSchema } from '../../schemas/todo.schema'
import { TodoForm } from './TodoForm'

const TODOS_QUERY_INPUT = { limit: 50, offset: 0 } as const

interface TodoFormContainerCreateProps {
  readonly mode: 'create'
  readonly onSuccess?: () => void
}

interface TodoFormContainerEditProps {
  readonly mode: 'edit'
  readonly todoId: number
  readonly initialValues: TodoFormData
  readonly onSuccess?: () => void
  readonly onCancel?: () => void
}

type TodoFormContainerProps =
  | TodoFormContainerCreateProps
  | TodoFormContainerEditProps

export function TodoFormContainer(props: TodoFormContainerProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isCreateMode = props.mode === 'create'

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: orpcClient.todos.list.queryKey({
        input: TODOS_QUERY_INPUT
      })
    })
    router.refresh()
  }

  const createMutation = useMutation({
    ...orpcClient.todos.create.mutationOptions(),
    onSuccess: () => {
      invalidateQueries()
      toast.success('Todo created successfully')
      props.onSuccess?.()
    }
  })

  const updateMutation = useMutation({
    ...orpcClient.todos.update.mutationOptions(),
    onSuccess: () => {
      invalidateQueries()
      toast.success('Todo updated successfully')
      props.onSuccess?.()
    }
  })

  const mutation = isCreateMode ? createMutation : updateMutation

  const form = useAppForm({
    defaultValues: isCreateMode
      ? { title: '', description: '' }
      : props.initialValues,
    validators: {
      onSubmit: todoFormSchema
    },
    onSubmit: async ({ value }) => {
      if (isCreateMode) {
        createMutation.mutate({
          title: value.title,
          description: value.description || null,
          isDone: false,
          userId: 3 // TODO: get user id from auth
        })
        form.reset()
      } else {
        updateMutation.mutate({
          id: props.todoId,
          title: value.title,
          description: value.description || null
        })
      }
    }
  })

  const createButtonLabel = mutation.isPending ? 'Creating...' : 'Add Todo'

  const submitButton = (
    <Button
      disabled={mutation.isPending}
      size={isCreateMode ? 'default' : 'sm'}
      type="submit"
    >
      {isCreateMode ? (
        createButtonLabel
      ) : (
        <>
          <Check className="h-4 w-4" />
          {mutation.isPending ? 'Saving...' : 'Save'}
        </>
      )}
    </Button>
  )

  const cancelButton =
    !isCreateMode && props.onCancel ? (
      <Button
        onClick={props.onCancel}
        size="sm"
        type="button"
        variant="outline"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
    ) : undefined

  return (
    <TodoForm
      cancelButton={cancelButton}
      form={form}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      submitButton={submitButton}
    />
  )
}
