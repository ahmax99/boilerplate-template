import { Inject, Injectable } from '@nestjs/common'
import { ORPCError } from '@orpc/nest'

import type { UserEntity } from '../../domain/entities/user.entity'
import type { CreateUserDto } from '../../presentation/dtos/createUser.dto'
import {
  USER_REPOSITORY,
  type UserRepositoryPort
} from '../ports/userRepository.port'

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(dto.email)

    if (existingUser)
      throw new ORPCError('CONFLICT', {
        message: 'User with this email already exists.',
        status: 409
      })

    return this.userRepository.create({
      email: dto.email,
      name: dto.name
    })
  }
}
