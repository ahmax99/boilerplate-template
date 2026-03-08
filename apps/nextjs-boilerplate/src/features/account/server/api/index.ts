import type {
  UpdateUserBody,
  UploadImageQuery,
  UserIdParams
} from '@shared/config'

import { env } from '@/config/env'
import { serverAuthApiClient } from '@/lib/apiClient'

export const updateUser = async (
  userId: UserIdParams['id'],
  data: UpdateUserBody
) => serverAuthApiClient.put(`/users/${userId}`, { json: data }).json()

export const deleteUser = async (userId: UserIdParams['id']) =>
  serverAuthApiClient.delete(`/users/${userId}`).json()

export const fetchPresignedUrl = async (query: UploadImageQuery) =>
  serverAuthApiClient
    .get('users/presigned-url', { searchParams: query })
    .json<{ presignedUrl: string; publicUrl: string; key: string }>()

export const fetchUserImage = (imagePath: string) => {
  if (!imagePath) return null

  return `${env.NEXT_PUBLIC_BACKEND_URL}/images/${imagePath}`
}
