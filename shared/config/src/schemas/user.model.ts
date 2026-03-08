import { z } from 'zod'

export const UserModel = {
  user: z.object({
    id: z.uuid(),
    cognitoSub: z.string(),
    name: z.string().optional(),
    email: z.email().optional(),
    image: z.url().optional(),
    role: z.string(),
    banned: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  userIdParams: z.object({
    id: z.uuid()
  }),
  createUserBody: z.object({
    cognitoSub: z.string().min(1),
    name: z.string().optional(),
    email: z.email().optional(),
    image: z.url().optional(),
    role: z.string().default('user'),
    banned: z.boolean().default(false)
  }),
  updateUserBody: z.object({
    name: z.string().optional(),
    image: z.url().optional(),
    role: z.string().optional(),
    banned: z.boolean().optional()
  })
}

export type User = z.infer<typeof UserModel.user>
export type UserIdParams = z.infer<typeof UserModel.userIdParams>
export type CreateUserBody = z.infer<typeof UserModel.createUserBody>
export type UpdateUserBody = z.infer<typeof UserModel.updateUserBody>
