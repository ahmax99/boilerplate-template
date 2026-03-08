import { useRouter } from 'next/navigation'
import type { CreatePostBody } from '@shared/config'

import { PUBLIC_ROUTES } from '@/features/auth/constants/routes'
import { useErrorHandler } from '@/features/error/client/hooks/useErrorHandler'
import { handleClientError } from '@/features/error/client/lib/handleError'

import { createPost } from '../api/createPost'
import { uploadImage } from '../api/uploadImage'

export const usePostActions = () => {
  const router = useRouter()
  const handleError = useErrorHandler()

  const handleCreatePost = async (
    data: CreatePostBody,
    imageFile: File | null,
    onSuccess?: () => void
  ) => {
    let imageUrl = data.imageUrl

    if (imageFile) {
      const uploadResult = await handleClientError(
        uploadImage(imageFile),
        handleError
      )

      if (uploadResult.error) return uploadResult

      if (!uploadResult.value.uploadResponse.ok)
        return handleError('Failed to upload image')

      imageUrl = uploadResult.value.publicUrl
    }

    return handleClientError(
      createPost({ ...data, imageUrl }),
      handleError,
      () => {
        onSuccess?.()
        router.replace(PUBLIC_ROUTES.BLOG)
      }
    )
  }

  return {
    handleCreatePost
  }
}
