import { Inject, Injectable } from '@nestjs/common'
import { ORPCError } from '@orpc/nest'

import type { FindTodoDto } from '../../presentation/dtos/findTodo.dto'
import {
  TODO_REPOSITORY,
  type TodoRepositoryPort
} from '../ports/todoRepository.port'

@Injectable()
export class GetTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepositoryPort
  ) {}

  async execute(dto: FindTodoDto) {
    const todo = await this.todoRepository.findById(dto.id)

    if (!todo) throw new ORPCError('NOT_FOUND', { message: 'Todo not found.' })

    return todo
  }
}
