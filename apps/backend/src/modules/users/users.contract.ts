import { oc } from '@orpc/contract'
import { populateContractRouterPaths } from '@orpc/nest'
import { z } from 'zod'

import { UserSchema } from './users.schema'

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
      email: z.email().optional(),
      name: z.string().nullable().optional()
    })
  )
  .output(UserSchema)

export const deleteUserContract = oc
  .route({ method: 'DELETE', path: '/users/{id}' })
  .input(UserSchema.pick({ id: true }))
  .output(z.object({ success: z.boolean() }))

export const usersContract = populateContractRouterPaths({
  users: {
    list: listUsersContract,
    find: findUserContract,
    create: createUserContract,
    update: updateUserContract,
    delete: deleteUserContract
  }
})
