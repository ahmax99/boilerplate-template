import type { Table } from '@tanstack/react-table'

import { Input } from '../../atoms'

interface DataTableFilterProps<TData> {
  readonly table: Table<TData>
  readonly columnId: string
  readonly placeholder?: string
}

function DataTableFilter<TData>({
  table,
  columnId,
  placeholder = 'Filter...'
}: DataTableFilterProps<TData>) {
  return (
    <Input
      className="max-w-sm"
      onChange={(e) =>
        table.getColumn(columnId)?.setFilterValue(e.target.value)
      }
      placeholder={placeholder}
      value={(table.getColumn(columnId)?.getFilterValue() as string) ?? ''}
    />
  )
}

export { DataTableFilter }
