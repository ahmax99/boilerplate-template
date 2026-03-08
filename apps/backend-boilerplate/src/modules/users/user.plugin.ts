import { Elysia } from 'elysia'

import { UploadService } from '../upload/upload.service.js'
import { UserService } from './user.service.js'

export const userPlugin = new Elysia({ name: 'user-plugin' }).decorate({
  userService: UserService,
  uploadService: UploadService
})
