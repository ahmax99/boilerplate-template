import { DataTable } from '@repo/ui/components/organisms/DataTable'

import { todosTableColumns } from '../../client/components'
import { fetchAllTodos } from '../api/fetchAllTodos'

interface TodosListProps {
  readonly userId?: number
  readonly offset?: number
}

export async function TodosList({ userId = 3, offset = 0 }: TodosListProps) {
  const todos = await fetchAllTodos({ userId, offset })
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
