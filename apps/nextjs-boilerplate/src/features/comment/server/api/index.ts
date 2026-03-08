import type { Comment, CommentIdParams, PostIdParams } from '@shared/config'

import { serverApiClient } from '@/lib/apiClient'

export const fetchAllComments = async (postId: PostIdParams['id']) =>
  serverApiClient
    .get('comments', { searchParams: { postId } })
    .json<Comment[]>()

export const createComment = async (comment: Comment) =>
  serverApiClient.post('comments', { json: comment }).json<Comment>()

export const deleteComment = async (commentId: CommentIdParams['id']) =>
  serverApiClient.delete(`comments/${commentId}`).json()
