import { Controller } from '@nestjs/common'
import { Implement, implement, populateContractRouterPaths } from '@orpc/nest'
import { todosContract } from '@repo/contract'

// biome-ignore lint/style/useImportType: prevent class to exists at runtime
import { TodosService } from './todos.service'

const todosContractWithPaths = populateContractRouterPaths(todosContract)

@Controller()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

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

  @Implement(todosContractWithPaths.todos.find)
  findTodo() {
    return implement(todosContractWithPaths.todos.find).handler(
      async ({ input }) => this.todosService.findOne({ id: input.id })
    )
  }

  @Implement(todosContractWithPaths.todos.create)
  createTodo() {
    return implement(todosContractWithPaths.todos.create).handler(
      async ({ input }) => this.todosService.create(input)
    )
  }

  @Implement(todosContractWithPaths.todos.update)
  updateTodo() {
    return implement(todosContractWithPaths.todos.update).handler(
      async ({ input }) => {
        const { id, ...data } = input
        return this.todosService.update({ id }, data)
      }
    )
  }

  @Implement(todosContractWithPaths.todos.delete)
  deleteTodo() {
    return implement(todosContractWithPaths.todos.delete).handler(
      async ({ input }) => this.todosService.delete({ id: input.id })
    )
  }
}
