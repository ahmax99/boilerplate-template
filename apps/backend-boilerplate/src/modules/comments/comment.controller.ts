import { fromTypes, openapi } from '@elysiajs/openapi'
import { CommentModel } from '@shared/config'
import { Elysia } from 'elysia'

import { errorHandler } from '../../error/lib/errorHandler.js'
import { handleApiError } from '../../error/utils/handleApiError.js'
import { commentPlugin } from './comment.plugin.js'

export const commentController = new Elysia({ prefix: '/comments' })
  .use(commentPlugin)
  .use(errorHandler)
  .use(openapi({ references: fromTypes() }))
  .get(
    '/',
    async ({ query, commentService }) =>
      handleApiError(commentService.getAll(query.postId)),
    {
      query: CommentModel.createBody.pick({ postId: true }),
      detail: {
        summary: 'Get comments for a post',
        description: 'Retrieve all comments for a specific post by postId',
        tags: ['Comments']
      }
    }
  )
  .post(
    '/',
    async ({ body, commentService }) =>
      handleApiError(
        commentService.create({
          content: body.content,
          postId: body.postId,
          authorId: 'admin' // TODO: Get from auth
        })
      ),
    {
      body: CommentModel.createBody,
      auth: true,
      detail: {
        summary: 'Create a new comment',
        description: 'Add a new comment to a post',
        tags: ['Comments']
      }
    }
  )
  .delete(
    '/:id',
    async ({ params, commentService }) =>
      handleApiError(commentService.delete(params.id)),
    {
      params: CommentModel.id,
      auth: true,
      detail: {
        summary: 'Delete a comment',
        description: 'Soft delete a comment by ID (sets deletedAt timestamp)',
        tags: ['Comments']
      }
    }
  )
