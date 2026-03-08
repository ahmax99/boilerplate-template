import { Elysia } from 'elysia'

import { PostService } from './post.service.js'
import { UploadService } from './upload.service.js'

export const postPlugin = new Elysia({ name: 'post-plugin' }).decorate({
  postService: PostService,
  uploadService: UploadService
})
