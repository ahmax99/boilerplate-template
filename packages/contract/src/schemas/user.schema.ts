import { z } from 'zod'

export const userSchema = z.object({
  id: z.coerce.number().int().positive(),
  email: z.email(),
  name: z.string().nullable().optional()
})

export type User = z.infer<typeof userSchema>
