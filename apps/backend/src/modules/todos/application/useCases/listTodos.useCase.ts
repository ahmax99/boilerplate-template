import { Inject, Injectable } from '@nestjs/common'

import type { ListTodosDto } from '../../presentation/dtos/listTodos.dto'
import {
  TODO_REPOSITORY,
  type TodoRepositoryPort
} from '../ports/todoRepository.port'

@Injectable()
export class ListTodosUseCase {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepositoryPort
  ) {}

  async execute(dto: ListTodosDto) {
    return this.todoRepository.findAll({
      userId: dto.userId,
      limit: dto.limit,
      offset: dto.offset
    })
  }
}
