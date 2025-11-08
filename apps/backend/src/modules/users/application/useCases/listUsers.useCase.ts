import { Inject, Injectable } from '@nestjs/common'

import type { ListUsersDto } from '../../presentation/dtos/listUsers.dto'
import {
  USER_REPOSITORY,
  type UserRepositoryPort
} from '../ports/userRepository.port'

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: ListUsersDto) {
    return this.userRepository.findAll({ limit: dto.limit, offset: dto.offset })
  }
}
