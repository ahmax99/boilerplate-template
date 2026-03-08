import { Elysia } from 'elysia'

import { UploadService } from '../upload/upload.service.js'
import { UserService } from '../users/user.service.js'
import { PostService } from './post.service.js'

export const postPlugin = new Elysia({ name: 'post-plugin' }).decorate({
  postService: PostService,
  uploadService: UploadService,
  userService: UserService
})
