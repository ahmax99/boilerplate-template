'use server'

import { orpcServer } from '@/lib/api/orpc.server'

import type { ListTodosInput } from '../../schemas/todo.schema'

export const fetchAllTodos = async ({
  limit,
  offset,
  userId
}: ListTodosInput) => orpcServer.todos.list({ limit, offset, userId })
