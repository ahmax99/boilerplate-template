import { oc } from '@orpc/contract'
import { z } from 'zod'

import { todoSchema } from '../schemas/index.js'

export const listTodosContract = oc
  .route({
    summary: 'List todos',
    tags: ['Todos']
  })
  .input(
    z.object({
      userId: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      offset: z.coerce.number().int().min(0).default(0)
    })
  )
  .output(z.array(todoSchema))

export const findTodoContract = oc
  .route({
    summary: 'Find todo by id',
    tags: ['Todos']
  })
  .input(todoSchema.pick({ id: true }))
  .output(todoSchema)

export const createTodoContract = oc
  .route({
    summary: 'Create todo',
    tags: ['Todos']
  })
  .input(todoSchema.omit({ id: true }))
  .output(todoSchema)

export const updateTodoContract = oc
  .route({
    summary: 'Update todo',
    tags: ['Todos']
  })
  .input(
    z.object({
      id: z.coerce.number().int().positive(),
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      isDone: z.boolean().optional()
    })
  )
  .output(todoSchema)

export const deleteTodoContract = oc
  .route({
    summary: 'Delete todo',
    tags: ['Todos']
  })
  .input(todoSchema.pick({ id: true }))
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
