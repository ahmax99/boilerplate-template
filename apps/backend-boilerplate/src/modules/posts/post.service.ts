import type {
  CreatePostBody,
  PostIdParams,
  UpdatePostBody
} from '@shared/config'
import { prisma } from '@shared/neon'

import { AppError } from '../../error/lib/AppError.js'
import { catchAsyncError } from '../../error/utils/catchError.js'
import {
  type AppAbility,
  accessibleBy,
  subject
} from '../../lib/casl-prisma.js'

export const PostService = {
  getAll: (ability: AppAbility) =>
    catchAsyncError(
      prisma.post.findMany({
        where: {
          AND: [{ deletedAt: null }, accessibleBy(ability).Post]
        },
        orderBy: { createdAt: 'desc' }
      })
    ),

  getById: (id: PostIdParams['id'], ability: AppAbility) =>
    catchAsyncError(
      (async () => {
        const post = await prisma.post.findUnique({
          where: { id, deletedAt: null }
        })

        if (!post) throw new AppError('NOT_FOUND', 'Post not found')
        if (!ability.can('read', subject('Post', post))) {
          throw new AppError('FORBIDDEN', 'Cannot read this post')
        }

        return post
      })()
    ),

  create: (input: CreatePostBody, ability: AppAbility) =>
    catchAsyncError(
      (async () => {
        if (!ability.can('create', 'Post')) {
          throw new AppError('FORBIDDEN', 'Cannot create post')
        }

        return prisma.post.create({
          data: {
            title: input.title,
            content: input.content,
            slug: input.slug,
            imagePath: input.imagePath,
            authorId: input.authorId,
            createdAt: new Date()
          }
        })
      })()
    ),

  update: (
    id: PostIdParams['id'],
    input: UpdatePostBody,
    ability: AppAbility
  ) =>
    catchAsyncError(
      (async () => {
        const post = await prisma.post.findUnique({
          where: { id, deletedAt: null }
        })

        if (!post) throw new AppError('NOT_FOUND', 'Post not found')
        if (!ability.can('update', subject('Post', post))) {
          throw new AppError('FORBIDDEN', 'Cannot update this post')
        }

        return prisma.post.update({
          where: { id },
          data: input
        })
      })()
    ),

  delete: (id: PostIdParams['id'], ability: AppAbility) =>
    catchAsyncError(
      (async () => {
        const post = await prisma.post.findUnique({
          where: { id, deletedAt: null }
        })

        if (!post) throw new AppError('NOT_FOUND', 'Post not found')
        if (!ability.can('delete', subject('Post', post)))
          throw new AppError('FORBIDDEN', 'Cannot delete this post')

        return prisma.post.update({
          where: { id },
          data: { deletedAt: new Date() }
        })
      })()
    )
}
