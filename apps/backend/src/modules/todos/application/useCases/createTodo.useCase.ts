import { Inject, Injectable } from '@nestjs/common'

import { TodoEntity } from '../../domain/entities/todo.entity'
import type { CreateTodoDto } from '../../presentation/dtos/createTodo.dto'
import {
  TODO_REPOSITORY,
  type TodoRepositoryPort
} from '../ports/todoRepository.port'

@Injectable()
export class CreateTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepositoryPort
  ) {}

  async execute(dto: CreateTodoDto) {
    const todo = TodoEntity.create(
      dto.title,
      dto.userId,
      dto.description,
      dto.isDone
    )

    return this.todoRepository.create({
      title: todo.getTitle(),
      description: todo.getDescription() ?? undefined,
      isDone: todo.getIsDone(),
      userId: todo.getUserId()
    })
  }
}
