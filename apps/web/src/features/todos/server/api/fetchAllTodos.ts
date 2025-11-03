'use server'

import { orpcServer } from '@/lib/api/orpc.server'

import { type FetchAllTodosInput, todoSchema } from '../../schemas/todo.schema'

export async function fetchAllTodos({
  limit,
  offset,
  userId
}: FetchAllTodosInput) {
  const response = await orpcServer.todos.list({ limit, offset, userId })

  return todoSchema.array().parse(response)
}
