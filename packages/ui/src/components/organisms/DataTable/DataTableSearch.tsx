'use client'

import { useEffect, useState } from 'react'
import type { ColumnFiltersState, Table } from '@tanstack/react-table'

import { useDebounce } from '../../../hooks'
import { Input } from '../../atoms'

interface DataTableSearchProps<TData> {
  readonly table: Table<TData>
  readonly columnFilters: ColumnFiltersState
  readonly searchColumn?: string
  readonly debounceDelay?: number
}

function DataTableSearch<TData>({
  table,
  columnFilters,
  searchColumn = 'title',
  debounceDelay = 500
}: DataTableSearchProps<TData>) {
  const filterValue =
    (columnFilters.find((filter) => filter.id === searchColumn)?.value as
      | string
      | undefined) ?? ''

  const [searchValue, setSearchValue] = useState(filterValue)
  const debouncedSearchValue = useDebounce(searchValue, debounceDelay)

  useEffect(
    () => table.getColumn(searchColumn)?.setFilterValue(debouncedSearchValue),
    [debouncedSearchValue, searchColumn, table]
  )

  useEffect(() => setSearchValue(filterValue), [filterValue])

  return (
    <Input
      onChange={(event) => setSearchValue(event.target.value)}
      placeholder="Search..."
      value={searchValue}
    />
  )
}

export { DataTableSearch }
