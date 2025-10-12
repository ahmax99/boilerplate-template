import { Controller } from '@nestjs/common'

import { Implement, implement } from '@orpc/nest'

import { todosContract } from './todo.contract'
import { TodosService } from './todos.service'

@Controller()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Implement(todosContract.todos.list)
  listTodos() {
    return implement(todosContract.todos.list).handler(({ input }) => {
      const where = input.userId ? { userId: input.userId } : undefined
      return this.todosService.findAll({
        where,
        skip: input.offset,
        take: input.limit
      })
    })
  }

  @Implement(todosContract.todos.find)
  findTodo() {
    return implement(todosContract.todos.find).handler(({ input }) =>
      this.todosService.findOne({ id: input.id })
    )
  }

  @Implement(todosContract.todos.create)
  createTodo() {
    return implement(todosContract.todos.create).handler(({ input }) =>
      this.todosService.create(input)
    )
  }

  @Implement(todosContract.todos.update)
  updateTodo() {
    return implement(todosContract.todos.update).handler(({ input }) => {
      const { id, ...data } = input
      return this.todosService.update({ id }, data)
    })
  }

  @Implement(todosContract.todos.delete)
  deleteTodo() {
    return implement(todosContract.todos.delete).handler(({ input }) =>
      this.todosService.delete({ id: input.id })
    )
  }
}
