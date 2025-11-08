import { Inject, Injectable } from '@nestjs/common'
import { ORPCError } from '@orpc/nest'

import type { FindUserDto } from '../../presentation/dtos/findUser.dto'
import {
  USER_REPOSITORY,
  type UserRepositoryPort
} from '../ports/userRepository.port'

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: FindUserDto) {
    let user = null

    if (dto.id) {
      user = await this.userRepository.findById(dto.id)
    } else if (dto.email) {
      user = await this.userRepository.findByEmail(dto.email)
    } else {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Either id or email must be provided.'
      })
    }

    if (!user) throw new ORPCError('NOT_FOUND', { message: 'User not found.' })

    return user
  }
}
