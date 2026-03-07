import type { User as PrismaUser } from '@shared/neon'
import { z } from 'zod'

export const UserModel = {
  id: z.object({
    id: z.uuid()
  }),
  createBody: z.object({
    cognitoSub: z.string().min(1),
    name: z.string().optional(),
    email: z.email().optional(),
    image: z.url().optional(),
    role: z.string().default('user'),
    banned: z.boolean().default(false)
  }),
  updateBody: z.object({
    name: z.string().optional(),
    image: z.url().optional(),
    role: z.string().optional(),
    banned: z.boolean().optional()
  })
}

export type User = PrismaUser
export type UserIdParams = z.infer<typeof UserModel.id>
export type CreateUserBody = z.infer<typeof UserModel.createBody>
export type UpdateUserBody = z.infer<typeof UserModel.updateBody>
