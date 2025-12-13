import { Injectable } from '@nestjs/common'
import { nanoid } from 'nanoid'

// biome-ignore lint/style/useImportType: PrismaService needed at runtime for DI
import { PrismaService } from '../../../../database/prisma.service'
import type {
  CreateTodoParams,
  FindAllTodosParams,
  TodoRepositoryPort
} from '../../application/ports/todoRepository.port'
import { TodoEntity } from '../../domain/entities/todo.entity'
import { TodoId } from '../../domain/valueObjects'

@Injectable()
export class InMemoryTodoRepository implements TodoRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaTodo: {
    id: string
    title: string
    description: string | null
    isDone: boolean
    userId: string
    createdAt: Date
  }): TodoEntity {
    const todoId = new TodoId(prismaTodo.id)

    return new TodoEntity(
      todoId,
      prismaTodo.title,
      prismaTodo.description,
      prismaTodo.isDone,
      prismaTodo.userId,
      prismaTodo.createdAt
    )
  }

  async findAll(params: FindAllTodosParams) {
    const todos = await this.prisma.getClient().todo.findMany({
      where: params.userId ? { userId: params.userId } : undefined,
      skip: params.offset,
      take: params.limit
    })

    return todos.map((todo) => this.toDomain(todo))
  }

  async findById(id: string) {
    const todo = await this.prisma.getClient().todo.findUnique({
      where: { id }
    })

    return todo ? this.toDomain(todo) : null
  }

  async create(params: CreateTodoParams) {
    const todo = await this.prisma.getClient().todo.create({
      data: {
        id: nanoid(),
        title: params.title,
        description: params.description,
        isDone: params.isDone,
        userId: params.userId,
        createdAt: new Date()
      }
    })

    return this.toDomain(todo)
  }

  async save(entity: TodoEntity) {
    const id = entity.getId().getValue()

    const todo = await this.prisma.getClient().todo.update({
      where: { id },
      data: {
        title: entity.getTitle(),
        description: entity.getDescription(),
        isDone: entity.getIsDone()
      }
    })

    return this.toDomain(todo)
  }

  async delete(id: string) {
    await this.prisma.getClient().todo.delete({
      where: { id }
    })
  }
}
