import { apiClient } from '@/lib/apiClient'

export const uploadImage = async (file: File) => {
  const filename = file.name

  const presignedResponse = await apiClient.get('posts/presigned-url', {
    searchParams: { filename, contentType: file.type }
  })

  const {
    presignedUrl,
    publicUrl
  }: { presignedUrl: string; publicUrl: string } =
    await presignedResponse.json()

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })

  return { publicUrl, uploadResponse }
}
