'use client'

import type { ColumnDef } from '@tanstack/react-table'

import type { Todo } from '../../schemas/todo.schema'

export const todosTableColumns: ColumnDef<Todo>[] = [
  {
    accessorKey: 'title',
    header: 'Title'
  },
  {
    accessorKey: 'description',
    header: 'Description'
  },
  {
    accessorKey: 'isDone',
    header: 'Done'
  }
]
