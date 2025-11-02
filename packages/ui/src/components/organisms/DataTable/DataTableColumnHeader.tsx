'use client'

import type { Column, Table } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react'

import { cn } from '../../../lib/utils'
import { Button } from '../../atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../molecules'

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  readonly column: Column<TData, TValue>
  readonly table: Table<TData>
  readonly title: string
}

const resolveSortIcon = (
  sortedState: false | 'asc' | 'desc'
): React.ReactElement => {
  if (sortedState === 'desc') return <ArrowDown />
  if (sortedState === 'asc') return <ArrowUp />
  return <ChevronsUpDown />
}

const getSortState = (
  sortedColumn: { desc: boolean } | undefined
): false | 'asc' | 'desc' => {
  if (!sortedColumn) return false
  return sortedColumn.desc ? 'desc' : 'asc'
}

function DataTableColumnHeader<TData, TValue>({
  column,
  table,
  title,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <div className={cn(className)}>{title}</div>

  const sorting = table.getState().sorting
  const sortedColumn = sorting.find((s) => s.id === column.id)
  const currentSort = getSortState(sortedColumn)
  const sortIcon = resolveSortIcon(currentSort)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="data-[state=open]:bg-accent -ml-3 h-8"
            size="sm"
            variant="ghost"
          >
            <span>{title}</span>
            {sortIcon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { DataTableColumnHeader }
