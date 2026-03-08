import type { CreatePostBody } from '@shared/config'

import { apiClient } from '@/lib/apiClient'

export const createPost = async (input: CreatePostBody) =>
  apiClient.post('posts', { json: input }).json()
