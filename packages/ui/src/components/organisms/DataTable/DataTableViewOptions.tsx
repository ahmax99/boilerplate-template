'use client'

import type { Table, VisibilityState } from '@tanstack/react-table'
import { Settings2 } from 'lucide-react'

import { Button } from '../../atoms'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../molecules'

interface DataTableViewOptionsProps<TData> {
  readonly table: Table<TData>
  readonly columnVisibility: VisibilityState
}

function DataTableViewOptions<TData>({
  table,
  columnVisibility
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.accessorFn !== undefined && column.getCanHide())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="ml-auto" size="sm" variant="outline">
          <Settings2 />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const isVisible = columnVisibility[column.id] ?? true
          return (
            <DropdownMenuCheckboxItem
              checked={isVisible}
              className="capitalize"
              key={column.id}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DataTableViewOptions }
