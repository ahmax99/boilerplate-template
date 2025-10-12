import { oc } from '@orpc/contract'
import { z } from 'zod'

import { UserSchema } from '../schemas'

export const listUsersContract = oc
  .route({ method: 'GET', path: '/users' })
  .input(
    z.object({
      limit: z.coerce.number().int().min(1).max(100).optional(),
      offset: z.coerce.number().int().min(0).default(0)
    })
  )
  .output(z.array(UserSchema))

export const findUserContract = oc
  .route({ method: 'GET', path: '/users/{id}' })
  .input(UserSchema.pick({ id: true }))
  .output(UserSchema)

export const createUserContract = oc
  .route({ method: 'POST', path: '/users' })
  .input(UserSchema.omit({ id: true }))
  .output(UserSchema)

export const updateUserContract = oc
  .route({ method: 'PATCH', path: '/users/{id}' })
  .input(
    z.object({
      id: z.coerce.number().int().positive(),
      email: z.string().email().optional(),
      name: z.string().nullable().optional()
    })
  )
  .output(UserSchema)

export const deleteUserContract = oc
  .route({ method: 'DELETE', path: '/users/{id}' })
  .input(UserSchema.pick({ id: true }))
  .output(z.object({ success: z.boolean() }))

export const usersContract = {
  users: {
    list: listUsersContract,
    find: findUserContract,
    create: createUserContract,
    update: updateUserContract,
    delete: deleteUserContract
  }
}
