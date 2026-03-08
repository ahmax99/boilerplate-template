import type { CommentIdParams } from '@shared/config'

import { apiClient } from '@/lib/apiClient'

export const deleteComment = async (id: CommentIdParams['id']) =>
  apiClient.delete(`comments/${id}`).json()
