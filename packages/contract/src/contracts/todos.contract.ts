import { oc } from '@orpc/contract'
import { z } from 'zod'

import { todoSchema } from '../schemas/index.js'

export const listTodosInput = z.object({
  userId: z.nanoid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional()
})
export const listTodosOutput = z.array(todoSchema)

export const listTodosContract = oc
  .route({
    summary: 'List todos',
    tags: ['Todos']
  })
  .input(listTodosInput)
  .output(listTodosOutput)

export const findTodoInput = todoSchema.pick({ id: true })
export const findTodoOutput = todoSchema

export const findTodoContract = oc
  .route({
    summary: 'Find todo by id',
    tags: ['Todos']
  })
  .input(findTodoInput)
  .output(findTodoOutput)

export const createTodoInput = todoSchema.omit({ id: true, createdAt: true })
export const createTodoOutput = todoSchema

export const createTodoContract = oc
  .route({
    summary: 'Create todo',
    tags: ['Todos']
  })
  .input(createTodoInput)
  .output(createTodoOutput)

export const updateTodoInput = z.object({
  id: z.nanoid(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  isDone: z.boolean().optional()
})
export const updateTodoOutput = todoSchema

export const updateTodoContract = oc
  .route({
    summary: 'Update todo',
    tags: ['Todos']
  })
  .input(updateTodoInput)
  .output(updateTodoOutput)

export const deleteTodoInput = todoSchema.pick({ id: true })

export const deleteTodoContract = oc
  .route({
    summary: 'Delete todo',
    tags: ['Todos']
  })
  .input(deleteTodoInput)
  .output(z.void())

export const todosContract = {
  todos: {
    list: listTodosContract,
    find: findTodoContract,
    create: createTodoContract,
    update: updateTodoContract,
    delete: deleteTodoContract
  }
}
