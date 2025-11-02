import { todoSchema as todoContractSchema } from '@repo/contract'
import { z } from 'zod'

export const todoSchema = todoContractSchema

export type Todo = z.infer<typeof todoSchema>

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
