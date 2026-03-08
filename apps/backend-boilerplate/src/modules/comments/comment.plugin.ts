import { Elysia } from 'elysia'

import { CommentService } from './comment.service.js'

export const commentPlugin = new Elysia({ name: 'comment-plugin' }).decorate({
  commentService: CommentService
})
