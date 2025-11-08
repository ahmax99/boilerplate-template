import { Inject, Injectable } from '@nestjs/common'
import { ORPCError } from '@orpc/nest'

import type { DeleteTodoDto } from '../../presentation/dtos/deleteTodo.dto'
import {
  TODO_REPOSITORY,
  type TodoRepositoryPort
} from '../ports/todoRepository.port'

@Injectable()
export class DeleteTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepositoryPort
  ) {}

  async execute(dto: DeleteTodoDto) {
    const todo = await this.todoRepository.findById(dto.id)

    if (!todo) throw new ORPCError('NOT_FOUND', { message: 'Todo not found' })

    await this.todoRepository.delete(dto.id)
  }
}
