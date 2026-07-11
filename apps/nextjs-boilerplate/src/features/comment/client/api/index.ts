import type { CommentIdParams } from '@shared/config'

import type { CreateCommentSchema } from '../../schemas/commentForm.schema'

import { apiClient } from '@/lib/apiClient'

export const createComment = async (input: CreateCommentSchema) =>
  apiClient.post('comments', { json: input }).json()

export const deleteComment = async (commentId: CommentIdParams['id']) =>
  apiClient.delete(`comments/${commentId}`).json()
