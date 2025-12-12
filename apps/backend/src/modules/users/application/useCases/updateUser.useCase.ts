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

    if (dto.name !== undefined) user.updateName(dto.name)
    if (dto.email !== undefined) user.updateEmail(dto.email)
    if (dto.emailVerified !== undefined)
      user.updateEmailVerified(dto.emailVerified)
    if (dto.image !== undefined) user.updateImage(dto.image)

    return this.userRepository.save(user)
  }
}
