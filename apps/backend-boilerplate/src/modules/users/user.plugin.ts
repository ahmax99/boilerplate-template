import { Elysia } from 'elysia'

import { UserService } from './user.service.js'

export const userPlugin = new Elysia({ name: 'user-plugin' }).decorate({
  userService: UserService
})
