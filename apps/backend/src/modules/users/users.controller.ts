import { Controller } from '@nestjs/common'
import { ApiBody, ApiOperation } from '@nestjs/swagger'
import { Implement, implement, populateContractRouterPaths } from '@orpc/nest'
import { usersContract } from '@repo/contract'

import {
  ApiCreateResponse,
  ApiDeleteResponse,
  ApiFindResponse,
  ApiListResponse,
  ApiResource,
  ApiUpdateResponse
} from '../../shared/decorators'
import {
  CreateUserDto,
  CreateUserResponseDto,
  DeleteUserDto,
  DeleteUserResponseDto,
  FindUserDto,
  FindUserResponseDto,
  ListUsersDto,
  ListUsersResponseDto,
  UpdateUserDto,
  UpdateUserResponseDto
} from './dtos'
// biome-ignore lint/style/useImportType: keep class available at runtime for NestJS DI
import { UsersService } from './users.service'

const usersContractWithPaths = populateContractRouterPaths(usersContract)

@ApiResource(
  'Users',
  ListUsersDto,
  ListUsersResponseDto,
  FindUserDto,
  FindUserResponseDto,
  CreateUserDto,
  CreateUserResponseDto,
  UpdateUserDto,
  UpdateUserResponseDto,
  DeleteUserDto,
  DeleteUserResponseDto
)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'List all users',
    description:
      'Retrieve a paginated list of users with optional limit and offset'
  })
  @ApiListResponse(ListUsersResponseDto, 'Successfully retrieved users list')
  @ApiBody({ type: ListUsersDto })
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

  @ApiOperation({
    summary: 'Find user by ID',
    description: 'Retrieve a single user by their unique identifier'
  })
  @ApiFindResponse(FindUserResponseDto, 'User')
  @ApiBody({ type: FindUserDto })
  @Implement(usersContractWithPaths.users.find)
  findUser() {
    return implement(usersContractWithPaths.users.find).handler(
      async ({ input }) => this.usersService.findOne({ id: input.id })
    )
  }

  @ApiOperation({
    summary: 'Create new user',
    description: 'Create a new user with email and optional name'
  })
  @ApiCreateResponse(CreateUserResponseDto, 'User', true)
  @ApiBody({ type: CreateUserDto })
  @Implement(usersContractWithPaths.users.create)
  createUser() {
    return implement(usersContractWithPaths.users.create).handler(
      async ({ input }) => this.usersService.create(input)
    )
  }

  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information by ID'
  })
  @ApiUpdateResponse(UpdateUserResponseDto, 'User')
  @ApiBody({ type: UpdateUserDto })
  @Implement(usersContractWithPaths.users.update)
  updateUser() {
    return implement(usersContractWithPaths.users.update).handler(
      async ({ input }) => {
        const { id, ...data } = input
        return this.usersService.update({ id }, data)
      }
    )
  }

  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user by ID'
  })
  @ApiDeleteResponse(DeleteUserResponseDto, 'User')
  @ApiBody({ type: DeleteUserDto })
  @Implement(usersContractWithPaths.users.delete)
  deleteUser() {
    return implement(usersContractWithPaths.users.delete).handler(
      async ({ input }) => this.usersService.delete({ id: input.id })
    )
  }
}
