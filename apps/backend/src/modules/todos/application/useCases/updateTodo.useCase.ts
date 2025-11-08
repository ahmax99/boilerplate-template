import { Inject, Injectable } from '@nestjs/common'
import { ORPCError } from '@orpc/nest'

import type { UpdateTodoDto } from '../../presentation/dtos/updateTodo.dto'
import {
  TODO_REPOSITORY,
  type TodoRepositoryPort
} from '../ports/todoRepository.port'

@Injectable()
export class UpdateTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepositoryPort
  ) {}

  async execute(dto: UpdateTodoDto) {
    const todo = await this.todoRepository.findById(dto.id)

    if (!todo) throw new ORPCError('NOT_FOUND', { message: 'Todo not found.' })

    if (dto.title !== undefined) todo.updateTitle(dto.title)

    if (dto.description !== undefined) todo.updateDescription(dto.description)

    if (dto.isDone !== undefined)
      dto.isDone ? todo.markAsDone() : todo.markAsUndone()

    return this.todoRepository.save(todo)
  }
}
