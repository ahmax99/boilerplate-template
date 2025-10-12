import { z } from 'zod'

export const TodoSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  isDone: z.boolean(),
  userId: z.coerce.number().int().positive()
})
