import { Controller } from '@nestjs/common'
import { Implement, implement, populateContractRouterPaths } from '@orpc/nest'
import { usersContract } from '@repo/contract'

import type { UsersService } from './users.service'

const usersContractWithPaths = populateContractRouterPaths(usersContract)

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Implement(usersContractWithPaths.users.list)
  listUsers() {
    return implement(usersContractWithPaths.users.list).handler(
      async ({ input }) => {
        return this.usersService.findAll({
          skip: input.offset,
          take: input.limit
        })
      }
    )
  }

  @Implement(usersContractWithPaths.users.find)
  findUser() {
    return implement(usersContractWithPaths.users.find).handler(
      async ({ input }) => this.usersService.findOne({ id: input.id })
    )
  }

  @Implement(usersContractWithPaths.users.create)
  createUser() {
    return implement(usersContractWithPaths.users.create).handler(
      async ({ input }) => this.usersService.create(input)
    )
  }

  @Implement(usersContractWithPaths.users.update)
  updateUser() {
    return implement(usersContractWithPaths.users.update).handler(
      async ({ input }) => {
        const { id, ...data } = input
        return this.usersService.update({ id }, data)
      }
    )
  }

  @Implement(usersContractWithPaths.users.delete)
  deleteUser() {
    return implement(usersContractWithPaths.users.delete).handler(
      async ({ input }) => this.usersService.delete({ id: input.id })
    )
  }
}
