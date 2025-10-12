import { Module } from '@nestjs/common'

import { ORPCModule } from '@orpc/nest'

import { DatabaseModule } from './database/prisma.module'
import { TodosModule } from './modules/todos/todos.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    TodosModule,
    ORPCModule.forRoot({
      eventIteratorKeepAliveInterval: 5000
    })
  ]
})
export class AppModule {}
