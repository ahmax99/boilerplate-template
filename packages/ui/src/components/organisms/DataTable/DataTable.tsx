'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { useDataTable } from '../../../hooks/useDataTable'
import { cn } from '../../../lib/utils'
import { Table } from '../../molecules'
import { DataTableBody } from './DataTableBody'
import { DataTableHeader } from './DataTableHeader'
import { DataTablePagination } from './DataTablePagination'
import { DataTableSearch } from './DataTableSearch'
import { DataTableViewOptions } from './DataTableViewOptions'

export interface DataTableProps<TData> {
  readonly columns: ColumnDef<TData, unknown>[]
  readonly data: TData[]
  readonly tableHeight?: string
  readonly enablePagination?: boolean
  readonly enableSearch?: boolean
  readonly enableViewOptions?: boolean
  readonly pageSize?: number
}

function DataTable<TData>({
  columns,
  data,
  tableHeight,
  enablePagination,
  enableSearch,
  enableViewOptions,
  pageSize = 10
}: DataTableProps<TData>) {
  const {
    table,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    pagination,
    columnSizeVars
  } = useDataTable({
    data,
    columns,
    pageSize,
    enablePagination,
    enableSorting: true,
    enableFiltering: true,
    enableColumnResizing: true
  })

  return (
    <div className="flex flex-col gap-lg">
      {(enableSearch || enableViewOptions) && (
        <div className="flex items-center py-4 gap-lg">
          {enableSearch && (
            <DataTableSearch columnFilters={columnFilters} table={table} />
          )}
          {enableViewOptions && (
            <DataTableViewOptions
              columnVisibility={columnVisibility}
              table={table}
            />
          )}
        </div>
      )}
      <div className={cn('w-full flex flex-col gap-4', tableHeight)}>
        <div className="flex flex-2/3 overflow-hidden rounded-md border">
          <Table style={columnSizeVars}>
            <DataTableHeader
              columnSizeVars={columnSizeVars}
              columnVisibility={columnVisibility}
              pagination={pagination}
              rowSelection={rowSelection}
              sorting={sorting}
              table={table}
            />
            <DataTableBody
              columnFilters={columnFilters}
              columnSizeVars={columnSizeVars}
              columnVisibility={columnVisibility}
              columns={columns}
              pagination={pagination}
              rowSelection={rowSelection}
              sorting={sorting}
              table={table}
              tableHeight={tableHeight}
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
