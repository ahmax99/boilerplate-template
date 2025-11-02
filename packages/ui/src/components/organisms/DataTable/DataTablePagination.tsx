import type { PaginationState, Table } from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

import { Button } from '../../atoms'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../molecules'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  rowSelection: Record<string, boolean>
  pagination: PaginationState
}

function DataTablePagination<TData>({
  table,
  rowSelection,
  pagination
}: Readonly<DataTablePaginationProps<TData>>) {
  const selectedRowCount = Object.keys(rowSelection).filter(
    (key) => rowSelection[key]
  ).length
  const filteredRowCount = table.getFilteredRowModel().rows.length

  const pageCount = table.getPageCount()
  const currentPage = pagination.pageIndex
  const canGoPrevious = currentPage > 0
  const canGoNext = currentPage < pageCount - 1
  const pageOptions = [10, 20, 30, 40, 50]

  return (
    <div className="flex items-center justify-between px-2">
      <span className="text-muted-foreground flex-1 text-sm">
        {selectedRowCount} of {filteredRowCount} row(s) selected.
      </span>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
            value={`${pagination.pageSize}`}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage + 1} of {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="hidden size-8 lg:flex"
            disabled={!canGoPrevious}
            onClick={() => table.setPageIndex(0)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            className="size-8"
            disabled={!canGoPrevious}
            onClick={() => table.setPageIndex(currentPage - 1)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            className="size-8"
            disabled={!canGoNext}
            onClick={() => table.setPageIndex(currentPage + 1)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            className="hidden size-8 lg:flex"
            disabled={!canGoNext}
            onClick={() => table.setPageIndex(pageCount - 1)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { DataTablePagination }
