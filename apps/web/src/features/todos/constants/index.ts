import type { FetchAllTodosInput } from '../schemas/todo.schema'

export const TODOS_QUERY_INPUT = {
  limit: 50,
  offset: 0,
  userId: 9 // TODO: get user id from auth
} as FetchAllTodosInput
