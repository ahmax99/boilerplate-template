import { DataTable } from '@repo/ui/components/organisms/DataTable'

import { todosTableColumns } from '../../client/components'
import type { FetchAllTodosInput } from '../../schemas/todo.schema'
import { fetchAllTodos } from '../api/fetchAllTodos'

export async function TodosList({
  limit = 10,
  offset = 0,
  userId = 3
}: FetchAllTodosInput) {
  const todos = await fetchAllTodos({ limit, offset, userId })
  const dataKey = JSON.stringify(
    todos.map(({ id, title, isDone, description, createdAt }) => ({
      id,
      title,
      isDone,
      description,
      createdAt
    }))
  )

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
