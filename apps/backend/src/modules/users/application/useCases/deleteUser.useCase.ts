import { Inject, Injectable } from '@nestjs/common'
import { ORPCError } from '@orpc/nest'

import type { DeleteUserDto } from '../../presentation/dtos/deleteUser.dto'
import {
  USER_REPOSITORY,
  type UserRepositoryPort
} from '../ports/userRepository.port'

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: DeleteUserDto) {
    const user = await this.userRepository.findById(dto.id)

    if (!user) throw new ORPCError('NOT_FOUND', { message: 'User not found' })

    await this.userRepository.delete(dto.id)
  }
}
