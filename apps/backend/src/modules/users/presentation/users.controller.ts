import { Controller } from '@nestjs/common'
import { ApiBody, ApiOperation } from '@nestjs/swagger'
import { Implement, implement, populateContractRouterPaths } from '@orpc/nest'
import { usersContract } from '@repo/contract'

import {
  ApiDeleteResponse,
  ApiFindResponse,
  ApiListResponse,
  ApiUpdateResponse
} from '../../../shared/decorators'
import { Roles } from '../../auth/decorators/roles.decorator'
// biome-ignore lint/style/useImportType: use cases needed at runtime for NestJS DI
import {
  DeleteUserUseCase,
  GetUserUseCase,
  ListUsersUseCase,
  UpdateUserUseCase
} from '../application/useCases'
import {
  DeleteUserDto,
  FindUserDto,
  FindUserResponseDto,
  ListUsersDto,
  ListUsersResponseDto,
  UpdateUserDto,
  UpdateUserResponseDto
} from './dtos'

const usersContractWithPaths = populateContractRouterPaths(usersContract)

@Roles(['admin'])
@Controller()
export class UsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {}

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
        const users = await this.listUsersUseCase.execute({
          limit: input.limit,
          offset: input.offset
        })

        return users.map((user) => ({
          id: user.getId().getValue(),
          name: user.getName(),
          email: user.getEmail().getValue(),
          emailVerified: user.getEmailVerified(),
          image: user.getImage(),
          createdAt: user.getCreatedAt(),
          updatedAt: user.getUpdatedAt()
        }))
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
      async ({ input }) => {
        const user = await this.getUserUseCase.execute({ id: input.id })

        return {
          id: user.getId().getValue(),
          name: user.getName(),
          email: user.getEmail().getValue(),
          emailVerified: user.getEmailVerified(),
          image: user.getImage(),
          createdAt: user.getCreatedAt(),
          updatedAt: user.getUpdatedAt()
        }
      }
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
        const user = await this.updateUserUseCase.execute({
          id: input.id,
          name: input.name ?? undefined,
          email: input.email,
          emailVerified: input.emailVerified,
          image: input.image ?? undefined
        })

        return {
          id: user.getId().getValue(),
          name: user.getName(),
          email: user.getEmail().getValue(),
          emailVerified: user.getEmailVerified(),
          image: user.getImage(),
          createdAt: user.getCreatedAt(),
          updatedAt: user.getUpdatedAt()
        }
      }
    )
  }

  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user by ID'
  })
  @ApiDeleteResponse('User')
  @ApiBody({ type: DeleteUserDto })
  @Implement(usersContractWithPaths.users.delete)
  deleteUser() {
    return implement(usersContractWithPaths.users.delete).handler(
      async ({ input }) => {
        await this.deleteUserUseCase.execute({
          id: input.id
        })
        return undefined
      }
    )
  }
}
