import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState
} from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

import { TableHead, TableHeader, TableRow } from '../../molecules'

interface DataTableHeaderProps<TData> {
  readonly table: Table<TData>
  readonly sorting: SortingState
  readonly columnVisibility: VisibilityState
  readonly columnFilters: ColumnFiltersState
  readonly rowSelection: RowSelectionState
  readonly pagination: PaginationState
}

function DataTableHeader<TData>({
  table,
  sorting,
  columnVisibility,
  columnFilters,
  rowSelection,
  pagination
}: DataTableHeaderProps<TData>) {
  const sortedColumnCount = sorting.length
  const filterCount = columnFilters.length
  const currentPage = pagination.pageIndex
  const visibilitySignature = JSON.stringify(columnVisibility)
  const rowSelectionSignature = JSON.stringify(rowSelection)

  const headerGroups = table.getHeaderGroups()

  return (
    <TableHeader
      className="sticky top-0 z-10 bg-background shadow-md"
      key={`header-${sortedColumnCount}-${visibilitySignature}-${filterCount}-${rowSelectionSignature}-${currentPage}`}
    >
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}

export { DataTableHeader }
