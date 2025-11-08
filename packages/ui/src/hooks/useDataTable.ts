import { useMemo, useState } from 'react'
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState
} from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

export interface UseDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  pageSize?: number
  enablePagination?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  enableColumnResizing?: boolean
  initialState?: {
    sorting?: SortingState
    columnFilters?: ColumnFiltersState
    columnVisibility?: VisibilityState
    rowSelection?: RowSelectionState
    pagination?: PaginationState
    globalFilter?: string
  }
}

export interface UseDataTableReturn<TData> {
  table: Table<TData>
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  rowSelection: RowSelectionState
  pagination: PaginationState
  columnSizing: ColumnSizingState
  globalFilter: string
  columnSizeVars: Record<string, number>
}

export function useDataTable<TData>({
  data,
  columns,
  pageSize = 10,
  enablePagination,
  enableSorting,
  enableFiltering,
  enableColumnResizing,
  initialState = {}
}: UseDataTableProps<TData>): UseDataTableReturn<TData> {
  // State management
  const [sorting, setSorting] = useState<SortingState>(
    initialState.sorting ?? []
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState.columnFilters ?? []
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState.columnVisibility ?? {}
  )
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialState.rowSelection ?? {}
  )
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [pagination, setPagination] = useState<PaginationState>(
    initialState.pagination ?? {
      pageIndex: 0,
      pageSize
    }
  )
  const [globalFilter, setGlobalFilter] = useState<string>(
    initialState.globalFilter ?? ''
  )

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    globalFilterFn: 'includesString',
    defaultColumn: {
      minSize: 10,
      maxSize: 800
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      columnSizing,
      globalFilter
    }
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: needed for table to work
  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders()
    const colSizes: Record<string, number> = {}
    for (const header of headers) {
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
  }, [columnSizing, table])

  return {
    table,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    pagination,
    columnSizing,
    globalFilter,
    columnSizeVars
  }
}
