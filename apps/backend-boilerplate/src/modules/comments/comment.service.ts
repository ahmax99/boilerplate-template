import type { CommentIdParams, CreateCommentBody } from '@shared/config'
import { prisma } from '@shared/neon'

import { AppError } from '../../error/lib/AppError.js'
import { catchAsyncError } from '../../error/utils/catchError.js'
import {
  type AppAbility,
  accessibleBy,
  subject
} from '../../lib/casl-prisma.js'

export const CommentService = {
  getAll: (postId: string, ability: AppAbility) =>
    catchAsyncError(
      prisma.comment.findMany({
        where: {
          AND: [{ postId, deletedAt: null }, accessibleBy(ability).Comment]
        },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, imagePath: true } } }
      })
    ),

  create: (input: CreateCommentBody, ability: AppAbility) =>
    catchAsyncError(
      (async () => {
        if (!ability.can('create', 'Comment'))
          throw new AppError('FORBIDDEN', 'Cannot create comment')

        return prisma.comment.create({
          data: {
            content: input.content,
            postId: input.postId,
            authorId: input.authorId
          }
        })
      })()
    ),

  delete: (id: CommentIdParams['id'], ability: AppAbility) =>
    catchAsyncError(
      (async () => {
        const comment = await prisma.comment.findUnique({
          where: { id, deletedAt: null }
        })

        if (!comment) throw new AppError('NOT_FOUND', 'Comment not found')
        if (!ability.can('delete', subject('Comment', comment)))
          throw new AppError('FORBIDDEN', 'Cannot delete this comment')

        return prisma.comment.update({
          where: { id },
          data: { deletedAt: new Date() }
        })
      })()
    )
} as const
