import { DataTable } from '@repo/ui/components/organisms/DataTable'

import { hashDataSync } from '@/utils/hash'

import { todosTableColumns } from '../../client/components'
import { TODOS_QUERY_INPUT } from '../../constants'
import { fetchAllTodos } from '../api/fetchAllTodos'

export async function TodosList() {
  const { limit, offset, userId } = TODOS_QUERY_INPUT
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
