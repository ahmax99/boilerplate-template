import { Injectable } from '@nestjs/common'

import { PrismaClient } from '@repo/database'

@Injectable()
export class UsersService {
  private readonly prisma = new PrismaClient()

  async findAll(params: { limit?: number; offset?: number }) {
    const { limit = 50, offset = 0 } = params
    return this.prisma.user.findMany({
      take: limit,
      skip: offset,
      include: { todos: true }
    })
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { todos: true }
    })

    if (!user) throw new Error(`User with id ${id} not found`)

    return user
  }

  async create(data: { email: string; name: string | null }) {
    return this.prisma.user.create({
      data,
      include: { todos: true }
    })
  }

  async update(id: number, data: { email?: string; name?: string | null }) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { todos: true }
    })
  }

  async delete(id: number) {
    await this.prisma.user.delete({
      where: { id }
    })
    return { success: true }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect()
  }
}
