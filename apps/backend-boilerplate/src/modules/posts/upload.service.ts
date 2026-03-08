import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { env } from '../../config/env.js'
import { SIGNED_URL_EXPIRATION } from '../../constants/index.js'
import { catchAsyncError } from '../../error/utils/catchError.js'
import { s3Client } from '../../lib/s3.js'
import { sanitizeFilename } from '../../utils/sanitizeFilename.js'

export const UploadService = {
  getPresignedUrl: (filename: string, contentType: string) =>
    catchAsyncError(
      (async () => {
        const key = `posts/${Date.now()}-${sanitizeFilename(filename)}`

        const command = new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
          ContentType: contentType
        })

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: SIGNED_URL_EXPIRATION
        })

        const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

        return { presignedUrl, publicUrl }
      })()
    )
}
