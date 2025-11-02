'use client'

import type {
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState
} from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

import { cn } from '../../../lib'
import { TableHead, TableHeader, TableRow } from '../../molecules'

interface DataTableHeaderProps<TData> {
  readonly table: Table<TData>
  readonly sorting: SortingState
  readonly columnVisibility: VisibilityState
  readonly rowSelection: RowSelectionState
  readonly pagination: PaginationState
  readonly columnSizeVars?: Record<string, number>
}

function DataTableHeader<TData>({
  table,
  sorting,
  columnVisibility,
  rowSelection,
  pagination,
  columnSizeVars
}: DataTableHeaderProps<TData>) {
  const headerGroups = table.getHeaderGroups()

  return (
    <TableHeader className="sticky top-0 z-10 bg-background shadow-md">
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const sortState = sorting.find((s) => s.id === header.column.id)
            const sortKey = sortState ? `${sortState.desc}` : 'none'
            const visibilityKey =
              columnVisibility[header.column.id] ?? 'visible'
            const selectionKey =
              header.column.id === 'select'
                ? `${JSON.stringify(rowSelection)}-${pagination.pageIndex}`
                : ''
            const columnKey = `${header.id}-${sortKey}-${visibilityKey}-${selectionKey}`

            return (
              <TableHead
                key={columnKey}
                style={{
                  width: columnSizeVars
                    ? `calc(var(--header-${header.id}-size) * 1px)`
                    : header.getSize(),
                  position: 'relative'
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                {header.column.getCanResize() && (
                  <button
                    aria-label="Resize column"
                    className={cn(
                      'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none',
                      'hover:bg-primary/50',
                      header.column.getIsResizing() && 'bg-primary'
                    )}
                    onDoubleClick={() => header.column.resetSize()}
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    type="button"
                  />
                )}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
    </TableHeader>
  )
}

export { DataTableHeader }
