import { z } from 'zod'

export const UserSchema = z.object({
  id: z.coerce.number().int().positive(),
  email: z.email(),
  name: z.string().nullable()
})
