import { z } from 'zod'

export const todoFormSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional()
})

export type TodoFormData = z.infer<typeof todoFormSchema>
