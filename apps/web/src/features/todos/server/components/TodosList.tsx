import { DataTable } from '@repo/ui/components/organisms/DataTable'

import { orpcServer } from '@/lib/api/orpc.server'

import { todosTableColumns } from '../../client/components/TodosTableColumn'

interface TodosListProps {
  readonly limit?: number
  readonly offset?: number
  readonly userId?: number
}

export async function TodosList({
  limit = 50,
  offset = 0,
  userId
}: TodosListProps) {
  const todos = await orpcServer.todos.list({ limit, offset, userId })

  return (
    <DataTable
      columns={todosTableColumns}
      data={todos}
      enablePagination
      enableSearch
      enableViewOptions
      tableHeight="h-[300px]"
    />
  )
}
