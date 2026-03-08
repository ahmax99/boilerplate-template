import { Elysia } from 'elysia'

import { UserService } from '../users/user.service.js'
import { CommentService } from './comment.service.js'

export const commentPlugin = new Elysia({ name: 'comment-plugin' }).decorate({
  commentService: CommentService,
  userService: UserService
})
