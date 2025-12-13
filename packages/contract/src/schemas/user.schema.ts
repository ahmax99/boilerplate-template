import { z } from 'zod'

export const userSchema = z.object({
  id: z.nanoid(),
  name: z.string().nullable().optional(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()])
})

export type User = z.infer<typeof userSchema>
