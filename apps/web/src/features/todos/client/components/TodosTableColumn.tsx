'use client'

import { Checkbox } from '@repo/ui/components/atoms'
import { DataTableColumnHeader } from '@repo/ui/components/organisms/DataTable'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import type { Todo } from '../../schemas/todo.schema'
import { TodoStatusCell } from './TodoStatusCell'
import { TodoTableActions } from './TodoTableActions'

const columnHelper = createColumnHelper<Todo>()

export const todosTableColumns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 10
  }),
  columnHelper.accessor('title', {
    header: ({ column, table }) => (
      <DataTableColumnHeader column={column} table={table} title="Title" />
    ),
    cell: ({ row }) => (
      <span
        className={
          row.original.isDone ? 'text-muted-foreground line-through' : ''
        }
      >
        {row.original.title}
      </span>
    ),
    enableHiding: false
  }),
  columnHelper.accessor('description', {
    header: ({ column, table }) => (
      <DataTableColumnHeader
        column={column}
        table={table}
        title="Description"
      />
    ),
    cell: ({ row }) =>
      row.original.description ? (
        <span
          className={
            row.original.isDone ? 'text-muted-foreground line-through' : ''
          }
        >
          {row.original.description}
        </span>
      ) : (
        <em className="text-muted-foreground/60">No description</em>
      )
  }),
  columnHelper.accessor('isDone', {
    header: ({ column, table }) => (
      <DataTableColumnHeader column={column} table={table} title="Status" />
    ),
    cell: ({ row }) => <TodoStatusCell todo={row.original} />,
    sortingFn: (rowA, rowB) => {
      // Sort: pending (false) first, completed (true) last
      if (rowA.original.isDone === rowB.original.isDone) return 0
      return rowA.original.isDone ? 1 : -1
    },
    size: 30
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => <TodoTableActions todo={row.original} />,
    enableSorting: false,
    enableHiding: false,
    size: 10
  })
] as ColumnDef<Todo>[]
