import { Module } from '@nestjs/common'

import { ORPCModule } from '@orpc/nest'

import { DatabaseModule } from './database/database.module'
import { TodosController } from './modules/todos/todos.controller'
import { TodosService } from './modules/todos/todos.service'
import { UsersController } from './modules/users/users.controller'
import { UsersService } from './modules/users/users.service'

@Module({
  imports: [
    DatabaseModule,
    ORPCModule.forRoot({
      eventIteratorKeepAliveInterval: 5000
    })
  ],
  controllers: [UsersController, TodosController],
  providers: [UsersService, TodosService]
})
export class AppModule {}
