import { Injectable, NotFoundException } from '@nestjs/common'

import { Todo, Prisma } from '@repo/database'

import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.TodoWhereUniqueInput
    where?: Prisma.TodoWhereInput
    orderBy?: Prisma.TodoOrderByWithRelationInput
  }): Promise<Todo[]> {
    return this.prisma.todo.findMany(params)
  }

  async findOne(where: Prisma.TodoWhereUniqueInput): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({ where })

    if (!todo) throw new NotFoundException('Todo not found')

    return todo
  }

  async create(data: Prisma.TodoUncheckedCreateInput): Promise<Todo> {
    return this.prisma.todo.create({ data })
  }

  async update(
    where: Prisma.TodoWhereUniqueInput,
    data: Prisma.TodoUpdateInput
  ): Promise<Todo> {
    try {
      return await this.prisma.todo.update({ where, data })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        throw new NotFoundException('Todo not found')
      throw error
    }
  }

  async delete(
    where: Prisma.TodoWhereUniqueInput
  ): Promise<{ success: boolean }> {
    try {
      await this.prisma.todo.delete({ where })
      return { success: true }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        throw new NotFoundException('Todo not found')
      throw error
    }
  }
}
