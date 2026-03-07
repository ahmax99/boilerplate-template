import type { Post as PrismaPost } from '@shared/neon'
import { z } from 'zod'

export const PostModel = {
  id: z.object({
    id: z.uuid()
  }),
  createBody: z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    authorId: z.uuid(),
    imageUrl: z.string().optional(),
    slug: z.string()
  }),
  updateBody: z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional()
  }),
  uploadImageQuery: z.object({
    filename: z.string().min(1).max(255),
    contentType: z.string().regex(/^image\//)
  })
}

export type Post = PrismaPost
export type PostIdParams = z.infer<typeof PostModel.id>
export type CreatePostBody = z.infer<typeof PostModel.createBody>
export type UpdatePostBody = z.infer<typeof PostModel.updateBody>
export type UploadImageQuery = z.infer<typeof PostModel.uploadImageQuery>
