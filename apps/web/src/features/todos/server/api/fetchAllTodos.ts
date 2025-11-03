'use server'

import { orpcServer } from '@/lib/api/orpc.server'

import type { FetchAllTodosInput } from '../../schemas/todo.schema'

export const fetchAllTodos = async ({
  limit,
  offset,
  userId
}: FetchAllTodosInput) => orpcServer.todos.list({ limit, offset, userId })
