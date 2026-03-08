import { Elysia } from 'elysia'

import { ImageService } from './image.service.js'

export const imagePlugin = new Elysia({ name: 'image-plugin' }).decorate({
  imageService: ImageService
})
