import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  Table,
  VisibilityState
} from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

import { TableBody, TableCell, TableRow } from '../../molecules'

interface DataTableBodyProps<TData, TValue> {
  readonly table: Table<TData>
  readonly columns: ColumnDef<TData, TValue>[]
  readonly columnFilters: ColumnFiltersState
  readonly columnVisibility: VisibilityState
  readonly pagination: PaginationState
  readonly rowSelection: RowSelectionState
}

function DataTableBody<TData, TValue>({
  table,
  columns,
  columnFilters,
  columnVisibility,
  pagination,
  rowSelection
}: DataTableBodyProps<TData, TValue>) {
  const hasFilters = columnFilters.length > 0
  const visibleColumnCount = Object.keys(columnVisibility).filter(
    (key) => !columnVisibility[key]
  ).length
  const currentPage = pagination.pageIndex

  const rows = table.getRowModel().rows
  const effectiveColSpan = visibleColumnCount || columns.length

  if (!rows?.length)
    return (
      <TableBody key={`empty-${currentPage}`}>
        <TableRow>
          <TableCell className="h-24 text-center" colSpan={effectiveColSpan}>
            {hasFilters ? 'No results found.' : 'No results.'}
          </TableCell>
        </TableRow>
      </TableBody>
    )

  return (
    <TableBody key={`page-${currentPage}`}>
      {rows.map((row) => {
        const isSelected = !!rowSelection[row.id]

        return (
          <TableRow data-state={isSelected && 'selected'} key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        )
      })}
    </TableBody>
  )
}

export { DataTableBody }
