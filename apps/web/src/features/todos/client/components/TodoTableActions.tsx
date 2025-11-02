'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@repo/ui/components/atoms'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@repo/ui/components/molecules'
import { ActionButton } from '@repo/ui/components/organisms'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, MoreVertical, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { orpcClient } from '@/lib/api/orpc.client'

import type { Todo } from '../../schemas/todo.schema'
import { TODOS_QUERY_INPUT } from '../constants'
import { TodoFormContainer } from './TodoFormContainer'

interface TodoTableActionsProps {
  readonly todo: Todo
}

export function TodoTableActions({ todo }: TodoTableActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

  const handleDelete = () => deleteMutation.mutate({ id: todo.id })

  const handleEditSuccess = () => setIsEditDialogOpen(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            onSelect={(e) => {
              e.preventDefault()
            }}
          >
            <ActionButton
              action={async () => {
                handleDelete()
                return { error: false }
              }}
              areYouSureDescription="Are you sure you want to delete this todo? This action cannot be undone."
              className="w-full justify-start"
              requireAreYouSure
              variant="ghost"
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              <span className="text-destructive">Delete</span>
            </ActionButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setIsEditDialogOpen} open={isEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Todo</AlertDialogTitle>
          </AlertDialogHeader>
          <TodoFormContainer
            initialValues={{
              title: todo.title,
              description: todo.description || ''
            }}
            mode="edit"
            onCancel={() => setIsEditDialogOpen(false)}
            onSuccess={handleEditSuccess}
            todoId={todo.id}
          />
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
