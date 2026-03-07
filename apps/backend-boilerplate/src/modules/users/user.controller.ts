import { fromTypes, openapi } from '@elysiajs/openapi'
import { UserModel } from '@shared/config'
import { Elysia } from 'elysia'

import { errorHandler } from '../../error/lib/errorHandler.js'
import { handleApiError } from '../../error/utils/handleApiError.js'
import { userPlugin } from './user.plugin.js'

export const userController = new Elysia({ prefix: '/users' })
  .use(userPlugin)
  .use(errorHandler)
  .use(openapi({ references: fromTypes() }))
  .get('/', async ({ userService }) => handleApiError(userService.getAll()), {
    detail: {
      summary: 'Get all users',
      description: 'Retrieve a list of all users',
      tags: ['Users']
    }
  })
  .get(
    '/:id',
    async ({ params, userService }) =>
      handleApiError(userService.getById(params.id)),
    {
      params: UserModel.id,
      detail: {
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their unique identifier',
        tags: ['Users']
      }
    }
  )
  .post(
    '/',
    async ({ body, userService }) => handleApiError(userService.create(body)),
    {
      body: UserModel.createBody,
      adminAuth: true,
      detail: {
        summary: 'Create a new user',
        description: 'Create a new user with cognito sub and optional details',
        tags: ['Users']
      }
    }
  )
  .put(
    '/:id',
    async ({ params, body, userService }) =>
      handleApiError(userService.update(params.id, body)),
    {
      params: UserModel.id,
      body: UserModel.updateBody,
      adminAuth: true,
      detail: {
        summary: 'Update a user',
        description: 'Update an existing user by ID',
        tags: ['Users']
      }
    }
  )
  .delete(
    '/:id',
    async ({ params, userService }) =>
      handleApiError(userService.delete(params.id)),
    {
      params: UserModel.id,
      adminAuth: true,
      detail: {
        summary: 'Delete a user',
        description: 'Permanently delete a user by ID',
        tags: ['Users']
      }
    }
  )
