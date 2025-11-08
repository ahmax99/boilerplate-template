import { Module } from '@nestjs/common'

import { TODO_REPOSITORY } from './application/ports/todoRepository.port'
import {
  CreateTodoUseCase,
  DeleteTodoUseCase,
  GetTodoUseCase,
  ListTodosUseCase,
  UpdateTodoUseCase
} from './application/useCases'
import { InMemoryTodoRepository } from './infrastructure/adapters/inMemoryTodo.repository'
import { TodosController } from './presentation/todos.controller'

@Module({
  controllers: [TodosController],
  providers: [
    CreateTodoUseCase,
    ListTodosUseCase,
    GetTodoUseCase,
    UpdateTodoUseCase,
    DeleteTodoUseCase,
    { provide: TODO_REPOSITORY, useClass: InMemoryTodoRepository }
  ]
})
export class TodosModule {}
