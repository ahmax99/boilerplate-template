import type { userSchema } from '@repo/contract'
import type { z } from 'zod'

export type FindUserInput = z.infer<
  ReturnType<typeof userSchema.pick<{ id: true }>>
>
