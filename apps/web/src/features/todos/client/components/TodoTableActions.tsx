'use client'

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
import { Edit2, MoreVertical, Trash2 } from 'lucide-react'

import type { Todo } from '../../schemas/todo.schema'
import { useTodoMutations } from '../hooks/useTodoMutations'
import { TodoFormContainer } from './TodoFormContainer'

interface TodoTableActionsProps {
  readonly todo: Todo
}

export function TodoTableActions({ todo }: TodoTableActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { useDeleteTodo } = useTodoMutations()
  const deleteMutation = useDeleteTodo()

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
