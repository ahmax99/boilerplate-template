import { Controller } from '@nestjs/common'

import { Implement, implement } from '@orpc/nest'

import { todosContract } from './todo.contract'
import { TodosService } from './todos.service'

@Controller()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Implement(todosContract)
  async todos() {
    return {
      todos: {
        list: implement(todosContract.todos.list).handler(async ({ input }) => {
          return await this.todosService.findAll(input)
        }),

        find: implement(todosContract.todos.find).handler(async ({ input }) => {
          return await this.todosService.findOne(input.id)
        }),

        create: implement(todosContract.todos.create).handler(
          async ({ input }) => {
            return await this.todosService.create(input)
          }
        ),

        update: implement(todosContract.todos.update).handler(
          async ({ input }) => {
            const { id, ...data } = input
            return await this.todosService.update(id, data)
          }
        ),

        delete: implement(todosContract.todos.delete).handler(
          async ({ input }) => {
            return await this.todosService.delete(input.id)
          }
        )
      }
    }
  }
}
