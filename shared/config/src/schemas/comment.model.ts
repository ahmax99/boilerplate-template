import type { Comment as PrismaComment } from '@shared/neon'
import { z } from 'zod'

export const CommentModel = {
  id: z.object({
    id: z.uuid()
  }),
  createBody: z.object({
    content: z.string(),
    postId: z.uuid(),
    authorId: z.uuid()
  })
}

export type Comment = PrismaComment
export type CommentIdParams = z.infer<typeof CommentModel.id>
export type CreateCommentBody = z.infer<typeof CommentModel.createBody>
