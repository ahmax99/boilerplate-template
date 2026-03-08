import { fromTypes, openapi } from '@elysiajs/openapi'
import { PostModel } from '@shared/config'
import { Elysia } from 'elysia'

import { errorHandler } from '../../error/lib/errorHandler.js'
import { handleApiError } from '../../error/utils/handleApiError.js'
import { generateSlug } from '../../utils/generateSlug.js'
import { postPlugin } from './post.plugin.js'

export const postController = new Elysia({ prefix: '/posts' })
  .use(postPlugin)
  .use(errorHandler)
  .use(openapi({ references: fromTypes() }))
  .get('/', async ({ postService }) => handleApiError(postService.getAll()), {
    detail: {
      summary: 'Get all posts',
      description: 'Retrieve a list of all published posts',
      tags: ['Posts']
    }
  })
  .get(
    '/:id',
    async ({ params, postService }) =>
      handleApiError(postService.getById(params.id)),
    {
      params: PostModel.postIdParams,
      detail: {
        summary: 'Get post by ID',
        description: 'Retrieve a specific post by its unique identifier',
        tags: ['Posts']
      }
    }
  )
  .post(
    '/',
    async ({ body, postService }) =>
      handleApiError(
        postService.create({
          ...body,
          slug: body.slug || generateSlug(body.title)
        })
      ),
    {
      body: PostModel.createPostBody,
      adminAuth: true,
      detail: {
        summary: 'Create a new post',
        description:
          'Create a new blog post with title, content, and optional image',
        tags: ['Posts']
      }
    }
  )
  .put(
    '/:id',
    async ({ params, body, postService }) =>
      handleApiError(postService.update(params.id, body)),
    {
      params: PostModel.postIdParams,
      body: PostModel.updatePostBody,
      adminAuth: true,
      detail: {
        summary: 'Update a post',
        description: 'Update an existing post by ID',
        tags: ['Posts']
      }
    }
  )
  .delete(
    '/:id',
    async ({ params, postService }) =>
      handleApiError(postService.delete(params.id)),
    {
      params: PostModel.postIdParams,
      adminAuth: true,
      detail: {
        summary: 'Delete a post',
        description: 'Soft delete a post by ID (sets deletedAt timestamp)',
        tags: ['Posts']
      }
    }
  )
  .get(
    '/presigned-url',
    async ({ query, uploadService }) =>
      handleApiError(
        uploadService.getPresignedUrl(query.filename, query.contentType)
      ),
    {
      query: PostModel.uploadImageQuery,
      adminAuth: true,
      detail: {
        summary: 'Get presigned URL for image upload',
        description: 'Generate a presigned S3 URL for uploading post images',
        tags: ['Posts']
      }
    }
  )
