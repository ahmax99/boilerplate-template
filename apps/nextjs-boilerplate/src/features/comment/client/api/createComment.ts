import { apiClient } from '@/lib/apiClient'

import type { CreateCommentSchema } from '../../schemas/commentForm.schema'

export const createComment = async (input: CreateCommentSchema) =>
  apiClient.post('comments', { json: input }).json()
