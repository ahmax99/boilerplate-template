import { getCurrentSession } from '@/features/auth/server/api/getCurrentSession'
import { hashDataSync } from '@/utils/hash'

import { TodosDataTable, todosTableColumns } from '../../client/components'
import { TODOS_DEFAULT_LIMIT, TODOS_DEFAULT_OFFSET } from '../../constants'
import { fetchAllTodos } from '../api/fetchAllTodos'

export async function TodosList() {
  const session = await getCurrentSession()

  const todos = await fetchAllTodos({
    limit: TODOS_DEFAULT_LIMIT,
    offset: TODOS_DEFAULT_OFFSET,
    userId: session?.user?.id
  })
  const dataKey = `todos-${TODOS_DEFAULT_OFFSET}-${hashDataSync(todos)}`

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
