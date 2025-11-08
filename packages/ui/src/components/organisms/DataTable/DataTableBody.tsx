import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState
} from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

import { cn } from '../../../lib'
import { TableBody, TableCell, TableRow } from '../../molecules'

interface DataTableBodyProps<TData, TValue> {
  readonly table: Table<TData>
  readonly columns: ColumnDef<TData, TValue>[]
  readonly sorting: SortingState
  readonly columnFilters: ColumnFiltersState
  readonly columnVisibility: VisibilityState
  readonly pagination: PaginationState
  readonly rowSelection: RowSelectionState
  readonly globalFilter: string
  readonly columnSizeVars?: Record<string, number>
  readonly tableHeight?: string
}

function DataTableBody<TData, TValue>({
  table,
  columns,
  sorting,
  columnFilters,
  columnVisibility,
  pagination,
  rowSelection,
  globalFilter,
  columnSizeVars,
  tableHeight
}: DataTableBodyProps<TData, TValue>) {
  const hasFilters = columnFilters.length > 0
  const currentPage = pagination.pageIndex
  const sortingSignature = JSON.stringify(sorting)
  const visibilitySignature = JSON.stringify(columnVisibility)

  const rows = table.getRowModel().rows

  if (!rows?.length)
    return (
      <TableBody
        key={`empty-${currentPage}-${sortingSignature}-${visibilitySignature}-${globalFilter}`}
      >
        <TableRow>
          <TableCell
            className={cn('text-center', tableHeight)}
            colSpan={columns.length}
          >
            {hasFilters ? 'No results found.' : 'No data available.'}
          </TableCell>
        </TableRow>
      </TableBody>
    )

  return (
    <TableBody
      key={`page-${currentPage}-${sortingSignature}-${visibilitySignature}-${globalFilter}`}
    >
      {rows.map((row) => {
        const isSelected = !!rowSelection[row.id]

        return (
          <TableRow data-state={isSelected && 'selected'} key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                style={{
                  width: columnSizeVars
                    ? `calc(var(--col-${cell.column.id}-size) * 1px)`
                    : cell.column.getSize()
                }}
              >
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
