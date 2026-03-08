import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'

import { errorHandler } from '../../error/lib/errorHandler.js'
import { handleApiError } from '../../error/utils/handleApiError.js'
import { imagePlugin } from './image.plugin.js'

export const imageController = new Elysia({ prefix: '/images' })
  .use(imagePlugin)
  .use(errorHandler)
  .use(openapi())
  .get(
    '/*',
    async ({ params, imageService, set }) => {
      const imagePath = params['*']

      if (!imagePath) {
        set.status = 400
        return { error: 'Image path is required' }
      }

      const result = await handleApiError(imageService.getImage(imagePath))

      if (!result.body) {
        set.status = 404
        return { error: 'Image not found' }
      }

      set.headers['Content-Type'] = result.contentType
      set.headers['Cache-Control'] = 'public, max-age=31536000, immutable'

      if (result.contentLength)
        set.headers['Content-Length'] = result.contentLength.toString()

      if (result.etag) set.headers.ETag = result.etag

      if (result.lastModified)
        set.headers['Last-Modified'] = result.lastModified.toUTCString()

      return result.body
    },
    {
      detail: {
        summary: 'Get image from S3',
        description: 'Proxy endpoint to stream images from private S3 bucket',
        tags: ['Images']
      }
    }
  )
