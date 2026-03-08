import type {
  CreatePostBody,
  PostIdParams,
  UpdatePostBody
} from '@shared/config'
import { prisma } from '@shared/neon'

import { catchAsyncError } from '../../error/utils/catchError.js'

export const PostService = {
  getAll: () =>
    catchAsyncError(
      prisma.post.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
      })
    ),

  getById: (id: PostIdParams['id']) =>
    catchAsyncError(
      prisma.post.findUnique({
        where: {
          id,
          deletedAt: null
        }
      })
    ),

  create: (input: CreatePostBody) =>
    catchAsyncError(
      prisma.post.create({
        data: {
          ...input,
          createdAt: new Date()
        }
      })
    ),

  update: (id: PostIdParams['id'], input: UpdatePostBody) =>
    catchAsyncError(
      prisma.post.update({
        where: { id, deletedAt: null },
        data: input
      })
    ),

  delete: (id: PostIdParams['id']) =>
    catchAsyncError(
      prisma.post.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() }
      })
    )
}
