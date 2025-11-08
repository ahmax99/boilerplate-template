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
} from '../../shared/decorators'
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
// biome-ignore lint/style/useImportType: keep class available at runtime for NestJS DI
import { TodosService } from './todos.service'

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
  constructor(private readonly todosService: TodosService) {}

  @ApiOperation({
    summary: 'List todos'
  })
  @ApiListResponse(ListTodosResponseDto, 'Successfully retrieved todos list')
  @ApiBody({ type: ListTodosDto })
  @Implement(todosContractWithPaths.todos.list)
  listTodos() {
    return implement(todosContractWithPaths.todos.list).handler(
      async ({ input }) => {
        const where = input.userId ? { userId: input.userId } : undefined
        const result = await this.todosService.findAll({
          where,
          skip: input.offset,
          take: input.limit
        })
        return result
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
      async ({ input }) => this.todosService.findOne({ id: input.id })
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
      async ({ input }) => this.todosService.create(input)
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
        const { id, ...data } = input
        return this.todosService.update({ id }, data)
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
        await this.todosService.delete({ id: input.id })
      }
    )
  }
}
