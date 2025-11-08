import { Inject, Injectable } from '@nestjs/common'
import { ORPCError } from '@orpc/nest'

import type { UpdateUserDto } from '../../presentation/dtos/updateUser.dto'
import {
  USER_REPOSITORY,
  type UserRepositoryPort
} from '../ports/userRepository.port'

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: UpdateUserDto) {
    const user = await this.userRepository.findById(dto.id)

    if (!user) throw new ORPCError('NOT_FOUND', { message: 'User not found.' })

    return this.userRepository.update({
      id: dto.id,
      email: dto.email,
      name: dto.name
    })
  }
}
