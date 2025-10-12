import { Module } from '@nestjs/common'

import { ORPCModule } from '@orpc/nest'

import { TodosController } from './todos/todos.controller'
import { TodosService } from './todos/todos.service'
import { UsersController } from './users/users.controller'
import { UsersService } from './users/users.service'

@Module({
  imports: [
    ORPCModule.forRoot({
      eventIteratorKeepAliveInterval: 5000
    })
  ],
  controllers: [UsersController, TodosController],
  providers: [UsersService, TodosService]
})
export class AppModule {}
