'use client'

import { useEffect, useState } from 'react'
import type { Table } from '@tanstack/react-table'

import { useDebounce } from '../../../hooks'
import { Input } from '../../atoms'

interface DataTableSearchProps<TData> {
  readonly table: Table<TData>
  readonly placeholder?: string
  readonly debounceDelay?: number
}

function DataTableSearch<TData>({
  table,
  placeholder = 'Search...',
  debounceDelay = 500
}: DataTableSearchProps<TData>) {
  const globalFilterValue = (table.getState().globalFilter as string) ?? ''

  const [searchValue, setSearchValue] = useState(globalFilterValue)

  const debouncedSetFilter = useDebounce(
    () => table.setGlobalFilter(searchValue),
    debounceDelay
  )

  useEffect(() => debouncedSetFilter(), [debouncedSetFilter])

  useEffect(() => setSearchValue(globalFilterValue), [globalFilterValue])

  return (
    <Input
      onChange={(event) => setSearchValue(event.target.value)}
      placeholder={placeholder}
      value={searchValue}
    />
  )
}

export { DataTableSearch }
