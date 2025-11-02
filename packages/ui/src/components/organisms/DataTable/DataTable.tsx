'use client'

import { useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'

import { cn } from '../../../lib/utils'
import { Table } from '../../molecules'
import { DataTableBody } from './DataTableBody'
import { DataTableHeader } from './DataTableHeader'
import { DataTablePagination } from './DataTablePagination'
import { DataTableSearch } from './DataTableSearch'
import { DataTableViewOptions } from './DataTableViewOptions'

export interface DataTableProps<TData, TValue> {
  readonly columns: ColumnDef<TData, TValue>[]
  readonly data: TData[]
  readonly tableHeight?: string
  readonly enablePagination?: boolean
  readonly pageSize?: number
}

function DataTable<TData, TValue>({
  columns,
  data,
  tableHeight,
  enablePagination,
  pageSize = 10
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center py-4 gap-lg">
        <DataTableSearch columnFilters={columnFilters} table={table} />
        <DataTableViewOptions
          columnVisibility={columnVisibility}
          table={table}
        />
      </div>
      <div className={cn('w-full flex flex-col gap-4', tableHeight)}>
        <div className="flex flex-2/3 overflow-hidden rounded-md border">
          <Table>
            <DataTableHeader
              columnFilters={columnFilters}
              columnVisibility={columnVisibility}
              pagination={pagination}
              rowSelection={rowSelection}
              sorting={sorting}
              table={table}
            />
            <DataTableBody
              columnFilters={columnFilters}
              columnVisibility={columnVisibility}
              columns={columns}
              pagination={pagination}
              rowSelection={rowSelection}
              table={table}
            />
          </Table>
        </div>
      </div>
      {enablePagination && (
        <DataTablePagination
          pagination={pagination}
          rowSelection={rowSelection}
          table={table}
        />
      )}
    </div>
  )
}

export { DataTable }
