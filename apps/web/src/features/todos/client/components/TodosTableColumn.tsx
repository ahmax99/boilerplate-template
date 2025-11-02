'use client'

import { Button, Checkbox } from '@repo/ui/components/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@repo/ui/components/molecules'
import { DataTableColumnHeader } from '@repo/ui/components/organisms/DataTable'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { Edit2, MoreVertical, Trash2 } from 'lucide-react'

import type { Todo } from '../../schemas/todo.schema'

type TodoTableData = Omit<Todo, 'id' | 'userId'>

const columnHelper = createColumnHelper<TodoTableData>()

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
    cell: (info) => info.getValue(),
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
    cell: (info) =>
      info.getValue() ?? (
        <em className="text-muted-foreground/60">No description</em>
      )
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => (
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
          <DropdownMenuItem>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 10
  })
] as ColumnDef<TodoTableData>[]
