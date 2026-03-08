import type { CreatePostBody, Post } from '@shared/config'

import { apiClient } from '@/lib/apiClient'

export const createPost = async (input: CreatePostBody) =>
  apiClient.post('posts', { json: input }).json<Post>()

export const uploadImage = async (file: File) => {
  const { presignedUrl, publicUrl, key } = await apiClient
    .get('posts/presigned-url', {
      searchParams: {
        filename: file.name,
        contentType: file.type
      }
    })
    .json<{ presignedUrl: string; publicUrl: string; key: string }>()

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })

  return { uploadResponse, publicUrl, key }
}
