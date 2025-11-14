'use client'

import { Button } from '@repo/ui/components/atoms'
import { useAppForm } from '@repo/ui/hooks'
import { Check, X } from 'lucide-react'

import { TODOS_QUERY_INPUT } from '../../constants'
import { type TodoFormData, todoFormSchema } from '../../schemas/todo.schema'
import { useTodoMutations } from '../hooks/useTodoMutations'
import { TodoForm } from './TodoForm'

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
  const isCreateMode = props.mode === 'create'

  const { useCreateTodo, useUpdateTodo } = useTodoMutations()
  const createMutation = useCreateTodo({
    onSuccess: props.onSuccess
  })
  const updateMutation = useUpdateTodo({
    onSuccess: props.onSuccess
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
          userId: TODOS_QUERY_INPUT.userId
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
