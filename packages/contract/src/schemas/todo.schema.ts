import { z } from 'zod'

export const todoSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string(),
  description: z.string().nullable().optional(),
  isDone: z.boolean(),
  userId: z.coerce.number().int().positive(),
  createdAt: z.union([z.date(), z.string()])
})

export type Todo = z.input<typeof todoSchema>
