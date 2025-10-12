import { Injectable, NotFoundException } from '@nestjs/common'

import { User, Prisma } from '@repo/database'

import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<User[]> {
    return this.prisma.user.findMany(params)
  }

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.findUnique({ where })

    if (!user) throw new NotFoundException('User not found')

    return user
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    const user = await this.prisma.user.update({ where, data })

    if (!user) throw new NotFoundException('User not found')

    return user
  }

  async delete(
    where: Prisma.UserWhereUniqueInput
  ): Promise<{ success: boolean }> {
    const user = await this.prisma.user.delete({ where })

    if (!user) throw new NotFoundException('User not found')

    return { success: true }
  }
}
