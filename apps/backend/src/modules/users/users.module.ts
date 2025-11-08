import { Module } from '@nestjs/common'

import { USER_REPOSITORY } from './application/ports/userRepository.port'
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  ListUsersUseCase,
  UpdateUserUseCase
} from './application/useCases'
import { InMemoryUserRepository } from './infrastructure/adapters/inMemoryUser.repository'
import { UsersController } from './presentation/users.controller'

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository }
  ]
})
export class UsersModule {}
