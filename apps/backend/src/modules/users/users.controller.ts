import { Controller } from '@nestjs/common'

import { Implement, implement } from '@orpc/nest'

import { usersContract } from './users.contract'
import { UsersService } from './users.service'

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Implement(usersContract.users.list)
  listUsers() {
    return implement(usersContract.users.list).handler(({ input }) => {
      return this.usersService.findAll({
        skip: input.offset,
        take: input.limit
      })
    })
  }

  @Implement(usersContract.users.find)
  findUser() {
    return implement(usersContract.users.find).handler(({ input }) =>
      this.usersService.findOne({ id: input.id })
    )
  }

  @Implement(usersContract.users.create)
  createUser() {
    return implement(usersContract.users.create).handler(({ input }) =>
      this.usersService.create(input)
    )
  }

  @Implement(usersContract.users.update)
  updateUser() {
    return implement(usersContract.users.update).handler(({ input }) => {
      const { id, ...data } = input
      return this.usersService.update({ id }, data)
    })
  }

  @Implement(usersContract.users.delete)
  deleteUser() {
    return implement(usersContract.users.delete).handler(({ input }) =>
      this.usersService.delete({ id: input.id })
    )
  }
}
