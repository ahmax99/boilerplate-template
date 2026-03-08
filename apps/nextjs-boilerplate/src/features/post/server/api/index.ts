import type { Post, UploadImageQuery } from '@shared/config'

import { env } from '@/config/env'
import { serverApiClient, serverAuthApiClient } from '@/lib/apiClient'

import { PLACEHOLDER_IMAGE_URL } from '../../constants'

export const fetchAllPosts = async () =>
  serverApiClient.get('posts').json<Post[]>()

export const fetchPost = async (id: Post['id']) =>
  serverApiClient.get(`posts/${id}`).json<Post>()

export const fetchPreSignedUrl = async (query: UploadImageQuery) =>
  serverAuthApiClient
    .get('posts/presigned-url', { searchParams: query })
    .json<{ presignedUrl: string; publicUrl: string; key: string }>()

export const fetchPostImage = async (imagePath: string) => {
  if (!imagePath) return PLACEHOLDER_IMAGE_URL

  return `${env.NEXT_PUBLIC_BACKEND_URL}/images/${imagePath}`
}

export const createPost = async (post: Post) =>
  serverAuthApiClient.post('posts', { json: post }).json<Post>()
