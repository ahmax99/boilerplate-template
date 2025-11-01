import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable
} from '@tanstack/react-table'

interface AppTableOptions<TData>
  extends Omit<
    TableOptions<TData>,
    | 'getCoreRowModel'
    | 'getPaginationRowModel'
    | 'getSortedRowModel'
    | 'getFilteredRowModel'
  > {
  getCoreRowModel?: TableOptions<TData>['getCoreRowModel']
  getPaginationRowModel?: TableOptions<TData>['getPaginationRowModel']
  getSortedRowModel?: TableOptions<TData>['getSortedRowModel']
  getFilteredRowModel?: TableOptions<TData>['getFilteredRowModel']
}

const useAppTable = <TData,>(options: AppTableOptions<TData>) =>
  useReactTable({
    ...options,
    getCoreRowModel: options.getCoreRowModel ?? getCoreRowModel(),
    getPaginationRowModel:
      options.getPaginationRowModel ?? getPaginationRowModel(),
    getSortedRowModel: options.getSortedRowModel ?? getSortedRowModel(),
    getFilteredRowModel: options.getFilteredRowModel ?? getFilteredRowModel()
  })

export { useAppTable }
