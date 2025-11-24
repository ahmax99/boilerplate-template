import { USER_ID } from '@/features/users/constants'

import type { ListTodosInput } from '../schemas/todo.schema'

export const TODOS_QUERY_INPUT = {
  limit: 50,
  offset: 0,
  userId: USER_ID
} as ListTodosInput
