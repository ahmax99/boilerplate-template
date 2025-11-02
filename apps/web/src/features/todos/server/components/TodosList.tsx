import { DataTable } from '@repo/ui/components/organisms/DataTable'

import { orpcServer } from '@/lib/api/orpc.server'

import { todosTableColumns } from '../../client/components'
import { todoSchema } from '../../schemas/todo.schema'

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
  const response = await orpcServer.todos.list({ limit, offset, userId })
  const todos = todoSchema.array().parse(response)
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
