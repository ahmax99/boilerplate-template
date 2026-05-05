import type { CreatePostBody, Post } from '@shared/config'

import { env } from '@/config/env'
import { apiClient } from '@/lib/apiClient'

import { PLACEHOLDER_IMAGE_URL } from '../../constants'

export const fetchPostImage = (imagePath: string) => {
  if (!imagePath) return PLACEHOLDER_IMAGE_URL

  return `${env.NEXT_PUBLIC_BASE_URL}/api/images?path=${encodeURIComponent(imagePath)}`
}

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
