import { Injectable } from '@nestjs/common'

import { PrismaClient } from '@repo/database'

@Injectable()
export class TodosService {
  private readonly prisma = new PrismaClient()

  async findAll(params: { userId?: number; limit?: number; offset?: number }) {
    const { userId, limit = 50, offset = 0 } = params
    return this.prisma.todo.findMany({
      where: userId ? { userId } : undefined,
      take: limit,
      skip: offset
    })
  }

  async findOne(id: number) {
    const todo = await this.prisma.todo.findUnique({
      where: { id }
    })

    if (!todo) throw new Error(`Todo with id ${id} not found`)

    return todo
  }

  async create(data: {
    title: string
    description: string | null
    isDone: boolean
    userId: number
  }) {
    return this.prisma.todo.create({
      data
    })
  }

  async update(
    id: number,
    data: { title?: string; description?: string | null; isDone?: boolean }
  ) {
    return this.prisma.todo.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    await this.prisma.todo.delete({
      where: { id }
    })
    return { success: true }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect()
  }
}
