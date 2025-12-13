import { z } from 'zod'

export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  isDone: z.boolean(),
  userId: z.string(),
  createdAt: z.union([z.date(), z.string()])
})

export type Todo = z.infer<typeof todoSchema>
