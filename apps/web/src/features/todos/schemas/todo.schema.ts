import { z } from 'zod'

export const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  isDone: z.boolean(),
  userId: z.number()
})

export type Todo = z.infer<typeof todoSchema>

export const todoFormSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional()
})

export type TodoFormData = z.infer<typeof todoFormSchema>
