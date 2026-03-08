import type { Post, UploadImageQuery } from '@shared/config'

import { serverApiClient } from '@/lib/apiClient'

export const fetchAllPosts = async () =>
  serverApiClient.get('posts').json<Post[]>()

export const fetchPost = async (id: Post['id']) =>
  serverApiClient.get(`posts/${id}`).json<Post>()

export const fetchPreSignedUrl = async (query: UploadImageQuery) =>
  serverApiClient
    .get('posts/presigned-url', { searchParams: query })
    .json<{ presignedUrl: string; publicUrl: string }>()

export const createPost = async (post: Post) =>
  serverApiClient.post('posts', { json: post }).json<Post>()
