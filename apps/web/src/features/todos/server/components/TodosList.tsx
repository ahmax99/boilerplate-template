import { DataTable } from '@repo/ui/components/organisms/DataTable'

import { hashDataSync } from '@/utils/hash'

import { todosTableColumns } from '../../client/components'
import type { FetchAllTodosInput } from '../../schemas/todo.schema'
import { fetchAllTodos } from '../api/fetchAllTodos'

export async function TodosList({
  limit = 50,
  offset = 0,
  userId = 3
}: Readonly<FetchAllTodosInput>) {
  const todos = await fetchAllTodos({ limit, offset, userId })
  const dataKey = `todos-${userId}-${offset}-${hashDataSync(todos)}`

  return (
    <DataTable
      columns={todosTableColumns}
      data={todos}
      enablePagination
      enableSearch
      enableViewOptions
      initialState={{
        sorting: [{ id: 'isDone', desc: false }]
      }}
      key={dataKey}
      tableHeight="h-[300px]"
    />
  )
}
