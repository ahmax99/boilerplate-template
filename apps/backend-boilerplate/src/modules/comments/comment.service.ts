import type { CommentIdParams, CreateCommentBody } from '@shared/config'
import { prisma } from '@shared/neon'

import { catchAsyncError } from '../../error/utils/catchError.js'

export const CommentService = {
  getAll: (postId: string) =>
    catchAsyncError(
      prisma.comment.findMany({
        where: {
          AND: [{ postId, deletedAt: null }]
        },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } }
      })
    ),

  create: (input: CreateCommentBody) =>
    catchAsyncError(
      prisma.comment.create({
        data: {
          content: input.content,
          postId: input.postId,
          authorId: input.authorId
        }
      })
    ),

  delete: (id: CommentIdParams['id']) =>
    catchAsyncError(
      prisma.comment.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() }
      })
    )
} as const
