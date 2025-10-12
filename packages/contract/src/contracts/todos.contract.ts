import { oc } from '@orpc/contract'
import { z } from 'zod'

import { TodoSchema } from '../schemas'

export const listTodosContract = oc
  .route({ method: 'GET', path: '/todos' })
  .input(
    z.object({
      userId: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      offset: z.coerce.number().int().min(0).default(0)
    })
  )
  .output(z.array(TodoSchema))

export const findTodoContract = oc
  .route({ method: 'GET', path: '/todos/{id}' })
  .input(TodoSchema.pick({ id: true }))
  .output(TodoSchema)

export const createTodoContract = oc
  .route({ method: 'POST', path: '/todos' })
  .input(TodoSchema.omit({ id: true }))
  .output(TodoSchema)

export const updateTodoContract = oc
  .route({ method: 'PATCH', path: '/todos/{id}' })
  .input(
    z.object({
      id: z.coerce.number().int().positive(),
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      isDone: z.boolean().optional()
    })
  )
  .output(TodoSchema)

export const deleteTodoContract = oc
  .route({ method: 'DELETE', path: '/todos/{id}' })
  .input(TodoSchema.pick({ id: true }))
  .output(z.object({ success: z.boolean() }))

export const todosContract = {
  todos: {
    list: listTodosContract,
    find: findTodoContract,
    create: createTodoContract,
    update: updateTodoContract,
    delete: deleteTodoContract
  }
}
