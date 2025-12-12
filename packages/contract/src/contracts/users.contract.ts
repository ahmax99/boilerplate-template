import { oc } from '@orpc/contract'
import { z } from 'zod'

import { userSchema } from '../schemas/index.js'

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
  .output(z.array(userSchema))

export const findUserContract = oc
  .route({
    summary: 'Find user by id',
    tags: ['Users']
  })
  .input(userSchema.pick({ id: true }))
  .output(userSchema)

export const createUserContract = oc
  .route({
    summary: 'Create user',
    tags: ['Users'],
    successStatus: 201
  })
  .input(userSchema.omit({ id: true, createdAt: true, updatedAt: true }))
  .output(userSchema)

export const updateUserContract = oc
  .route({
    summary: 'Update user',
    tags: ['Users']
  })
  .input(
    z.object({
      id: z.uuid(),
      name: z.string().nullable().optional(),
      email: z.email().optional(),
      emailVerified: z.boolean().optional(),
      image: z.string().nullable().optional()
    })
  )
  .output(userSchema)

export const deleteUserContract = oc
  .route({
    summary: 'Delete user',
    tags: ['Users'],
    successStatus: 204
  })
  .input(userSchema.pick({ id: true }))
  .output(z.void())

export const usersContract = {
  users: {
    list: listUsersContract,
    find: findUserContract,
    create: createUserContract,
    update: updateUserContract,
    delete: deleteUserContract
  }
}
