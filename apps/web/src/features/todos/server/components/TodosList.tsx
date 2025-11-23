import { getSession } from '@/lib/auth/auth.server'
import { hashDataSync } from '@/utils/hash'

import { TodosDataTable, todosTableColumns } from '../../client/components'
import { fetchAllTodos } from '../api/fetchAllTodos'

export async function TodosList() {
  const session = await getSession()

  const userId = session?.userId
  const limit = 50
  const offset = 0

  const todos = await fetchAllTodos({ limit, offset, userId })
  const dataKey = `todos-${userId}-${offset}-${hashDataSync(todos)}`

  return (
    <TodosDataTable
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
