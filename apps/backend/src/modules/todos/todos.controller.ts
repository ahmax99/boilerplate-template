import { Controller } from '@nestjs/common'

import { Implement, implement, populateContractRouterPaths } from '@orpc/nest'
import { todosContract } from '@repo/contract'

import { TodosService } from './todos.service'

const todosContractWithPaths = populateContractRouterPaths(todosContract)

@Controller()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Implement(todosContractWithPaths.todos.list)
  listTodos() {
    return implement(todosContractWithPaths.todos.list).handler(({ input }) => {
      const where = input.userId ? { userId: input.userId } : undefined
      return this.todosService.findAll({
        where,
        skip: input.offset,
        take: input.limit
      })
    })
  }

  @Implement(todosContractWithPaths.todos.find)
  findTodo() {
    return implement(todosContractWithPaths.todos.find).handler(({ input }) =>
      this.todosService.findOne({ id: input.id })
    )
  }

  @Implement(todosContractWithPaths.todos.create)
  createTodo() {
    return implement(todosContractWithPaths.todos.create).handler(({ input }) =>
      this.todosService.create(input)
    )
  }

  @Implement(todosContractWithPaths.todos.update)
  updateTodo() {
    return implement(todosContractWithPaths.todos.update).handler(
      ({ input }) => {
        const { id, ...data } = input
        return this.todosService.update({ id }, data)
      }
    )
  }

  @Implement(todosContractWithPaths.todos.delete)
  deleteTodo() {
    return implement(todosContractWithPaths.todos.delete).handler(({ input }) =>
      this.todosService.delete({ id: input.id })
    )
  }
}
