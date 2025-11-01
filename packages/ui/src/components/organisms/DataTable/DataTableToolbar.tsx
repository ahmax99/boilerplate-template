import type { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '../../atoms'
import { DataTableFilter } from './DataTableFilter'
import { DataTableViewOptions } from './DataTableViewOptions'

interface DataTableToolbarProps<TData> {
  readonly table: Table<TData>
  readonly filterColumnId?: string
  readonly filterPlaceholder?: string
  readonly children?: React.ReactNode
}

function DataTableToolbar<TData>({
  table,
  filterColumnId,
  filterPlaceholder,
  children
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {filterColumnId && (
          <DataTableFilter
            columnId={filterColumnId}
            placeholder={filterPlaceholder}
            table={table}
          />
        )}
        {children}
        {isFiltered && (
          <Button
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
            variant="ghost"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
