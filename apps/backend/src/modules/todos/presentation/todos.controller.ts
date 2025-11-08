import { Controller } from '@nestjs/common'
import { ApiBody, ApiOperation } from '@nestjs/swagger'
import { Implement, implement, populateContractRouterPaths } from '@orpc/nest'
import { todosContract } from '@repo/contract'

import {
  ApiCreateResponse,
  ApiDeleteResponse,
  ApiFindResponse,
  ApiListResponse,
  ApiResource,
  ApiUpdateResponse
} from '../../../shared/decorators'
// biome-ignore lint/style/useImportType: keep class available at runtime for NestJS DI
import {
  CreateTodoUseCase,
  DeleteTodoUseCase,
  GetTodoUseCase,
  ListTodosUseCase,
  UpdateTodoUseCase
} from '../application/useCases'
import {
  CreateTodoDto,
  CreateTodoResponseDto,
  DeleteTodoDto,
  DeleteTodoResponseDto,
  FindTodoDto,
  FindTodoResponseDto,
  ListTodosDto,
  ListTodosResponseDto,
  UpdateTodoDto,
  UpdateTodoResponseDto
} from './dtos'

const todosContractWithPaths = populateContractRouterPaths(todosContract)

@ApiResource(
  'Todos',
  ListTodosDto,
  ListTodosResponseDto,
  FindTodoDto,
  FindTodoResponseDto,
  CreateTodoDto,
  CreateTodoResponseDto,
  UpdateTodoDto,
  UpdateTodoResponseDto,
  DeleteTodoDto,
  DeleteTodoResponseDto
)
@Controller()
export class TodosController {
  constructor(
    private readonly createTodoUseCase: CreateTodoUseCase,
    private readonly listTodosUseCase: ListTodosUseCase,
    private readonly getTodoUseCase: GetTodoUseCase,
    private readonly updateTodoUseCase: UpdateTodoUseCase,
    private readonly deleteTodoUseCase: DeleteTodoUseCase
  ) {}

  @ApiOperation({
    summary: 'List todos'
  })
  @ApiListResponse(ListTodosResponseDto, 'Successfully retrieved todos list')
  @ApiBody({ type: ListTodosDto })
  @Implement(todosContractWithPaths.todos.list)
  listTodos() {
    return implement(todosContractWithPaths.todos.list).handler(
      async ({ input }) => {
        const todos = await this.listTodosUseCase.execute({
          userId: input.userId,
          limit: input.limit,
          offset: input.offset
        })

        return todos.map((todo) => ({
          id: Number.parseInt(todo.getId().getValue(), 10),
          title: todo.getTitle(),
          description: todo.getDescription(),
          isDone: todo.getIsDone(),
          userId: todo.getUserId(),
          createdAt: todo.getCreatedAt()
        }))
      }
    )
  }

  @ApiOperation({
    summary: 'Find todo by ID'
  })
  @ApiFindResponse(FindTodoResponseDto, 'Todo')
  @ApiBody({ type: FindTodoDto })
  @Implement(todosContractWithPaths.todos.find)
  findTodo() {
    return implement(todosContractWithPaths.todos.find).handler(
      async ({ input }) => {
        const todo = await this.getTodoUseCase.execute({ id: input.id })

        return {
          id: Number.parseInt(todo.getId().getValue(), 10),
          title: todo.getTitle(),
          description: todo.getDescription(),
          isDone: todo.getIsDone(),
          userId: todo.getUserId(),
          createdAt: todo.getCreatedAt()
        }
      }
    )
  }

  @ApiOperation({
    summary: 'Create new todo'
  })
  @ApiCreateResponse(CreateTodoResponseDto, 'Todo')
  @ApiBody({ type: CreateTodoDto })
  @Implement(todosContractWithPaths.todos.create)
  createTodo() {
    return implement(todosContractWithPaths.todos.create).handler(
      async ({ input }) => {
        const todo = await this.createTodoUseCase.execute({
          title: input.title,
          description: input.description ?? undefined,
          isDone: input.isDone,
          userId: input.userId
        })

        return {
          id: Number.parseInt(todo.getId().getValue(), 10),
          title: todo.getTitle(),
          description: todo.getDescription(),
          isDone: todo.getIsDone(),
          userId: todo.getUserId(),
          createdAt: todo.getCreatedAt()
        }
      }
    )
  }

  @ApiOperation({
    summary: 'Update todo'
  })
  @ApiUpdateResponse(UpdateTodoResponseDto, 'Todo')
  @ApiBody({ type: UpdateTodoDto })
  @Implement(todosContractWithPaths.todos.update)
  updateTodo() {
    return implement(todosContractWithPaths.todos.update).handler(
      async ({ input }) => {
        const todo = await this.updateTodoUseCase.execute({
          id: input.id,
          title: input.title,
          description: input.description ?? undefined,
          isDone: input.isDone
        })

        return {
          id: Number.parseInt(todo.getId().getValue(), 10),
          title: todo.getTitle(),
          description: todo.getDescription(),
          isDone: todo.getIsDone(),
          userId: todo.getUserId(),
          createdAt: todo.getCreatedAt()
        }
      }
    )
  }

  @ApiOperation({
    summary: 'Delete todo'
  })
  @ApiDeleteResponse('Todo')
  @ApiBody({ type: DeleteTodoDto })
  @Implement(todosContractWithPaths.todos.delete)
  deleteTodo() {
    return implement(todosContractWithPaths.todos.delete).handler(
      async ({ input }) => {
        await this.deleteTodoUseCase.execute({ id: input.id })
      }
    )
  }
}
