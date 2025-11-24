import { type listTodosInput, todoSchema } from '@repo/contract'
import { z } from 'zod'

export type ListTodosInput = z.infer<typeof listTodosInput>

export type { Todo } from '@repo/contract'

export const todoFormSchema = todoSchema
  .pick({
    title: true,
    description: true
  })
  .extend({
    title: todoSchema.shape.title.min(1, 'Title is required').trim(),
    description: z.string().optional()
  })

export type TodoFormData = z.infer<typeof todoFormSchema>
