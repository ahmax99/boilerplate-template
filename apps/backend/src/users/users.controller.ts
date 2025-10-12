import { Controller } from '@nestjs/common'

import { Implement, implement } from '@orpc/nest'

import { usersContract } from './user.contract'
import { UsersService } from './users.service'

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Implement(usersContract)
  async users() {
    return {
      users: {
        list: implement(usersContract.users.list).handler(async ({ input }) => {
          return await this.usersService.findAll(input)
        }),

        find: implement(usersContract.users.find).handler(async ({ input }) => {
          return await this.usersService.findOne(input.id)
        }),

        create: implement(usersContract.users.create).handler(
          async ({ input }) => {
            return await this.usersService.create(input)
          }
        ),

        update: implement(usersContract.users.update).handler(
          async ({ input }) => {
            const { id, ...data } = input
            return await this.usersService.update(id, data)
          }
        ),

        delete: implement(usersContract.users.delete).handler(
          async ({ input }) => {
            return await this.usersService.delete(input.id)
          }
        )
      }
    }
  }
}
