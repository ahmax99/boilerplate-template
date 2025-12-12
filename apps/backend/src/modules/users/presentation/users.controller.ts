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
} from '../../../shared/decorators'
// biome-ignore lint/style/useImportType: use cases needed at runtime for NestJS DI
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  ListUsersUseCase,
  UpdateUserUseCase
} from '../application/useCases'
import {
  CreateUserDto,
  CreateUserResponseDto,
  DeleteUserDto,
  FindUserDto,
  FindUserResponseDto,
  ListUsersDto,
  ListUsersResponseDto,
  UpdateUserDto,
  UpdateUserResponseDto
} from './dtos'

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
  DeleteUserDto
)
@Controller()
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
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
    summary: 'Create new user',
    description: 'Create a new user with email and optional name'
  })
  @ApiCreateResponse(CreateUserResponseDto, 'User', true)
  @ApiBody({ type: CreateUserDto })
  @Implement(usersContractWithPaths.users.create)
  createUser() {
    return implement(usersContractWithPaths.users.create).handler(
      async ({ input }) => {
        const user = await this.createUserUseCase.execute({
          name: input.name ?? null,
          email: input.email,
          emailVerified: input.emailVerified,
          image: input.image ?? null
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
