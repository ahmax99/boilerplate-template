import { oc } from '@orpc/contract'
import { z } from 'zod'

import { UserSchema } from '../schemas/index.js'

export const listUsersContract = oc
  .route({
    summary: 'List users',
    tags: ['Users']
  })
  .input(
    z.object({
      limit: z.coerce.number().int().min(1).max(100).optional(),
      offset: z.coerce.number().int().min(0).default(0)
    })
  )
  .output(z.array(UserSchema))

export const findUserContract = oc
  .route({
    summary: 'Find user by id',
    tags: ['Users']
  })
  .input(UserSchema.pick({ id: true }))
  .output(UserSchema)

export const createUserContract = oc
  .route({
    summary: 'Create user',
    tags: ['Users']
  })
  .input(UserSchema.omit({ id: true }))
  .output(UserSchema)

export const updateUserContract = oc
  .route({
    summary: 'Update user',
    tags: ['Users']
  })
  .input(
    z.object({
      id: z.coerce.number().int().positive(),
      email: z.string().email().optional(),
      name: z.string().nullable().optional()
    })
  )
  .output(UserSchema)

export const deleteUserContract = oc
  .route({
    summary: 'Delete user',
    tags: ['Users']
  })
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
