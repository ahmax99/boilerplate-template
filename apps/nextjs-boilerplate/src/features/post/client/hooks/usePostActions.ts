import type { CreatePostBody, Post } from '@shared/config'
import { useRouter } from 'next/navigation'

import { createPostClient, deletePostClient, uploadImage } from '../api'

import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { useErrorHandler } from '@/features/error/client/hooks/useErrorHandler'
import { handleClientError } from '@/features/error/client/lib/handleError'

export const usePostActions = () => {
  const router = useRouter()
  const handleError = useErrorHandler()

  const handleCreatePost = async (
    data: CreatePostBody,
    imageFile: File | null,
    onSuccess?: () => void
  ) => {
    let imagePath = data.imagePath

    if (imageFile) {
      const uploadResult = await handleClientError(
        uploadImage(imageFile),
        handleError
      )

      if (uploadResult.error) return uploadResult

      if (!uploadResult.value.uploadResponse.ok)
        return handleError('Failed to upload image')

      imagePath = uploadResult.value.key
    }

    return handleClientError(
      createPostClient({ ...data, imagePath }),
      handleError,
      () => {
        onSuccess?.()
        router.replace(PUBLIC_ROUTES.POSTS)
      }
    )
  }

  const handleDeletePost = async (id: Post['id']) =>
    handleClientError(deletePostClient(id), handleError, () =>
      router.replace(PUBLIC_ROUTES.POSTS)
    )

  return {
    handleCreatePost,
    handleDeletePost
  }
}
