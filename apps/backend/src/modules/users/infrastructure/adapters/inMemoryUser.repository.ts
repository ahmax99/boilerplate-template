import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'

// biome-ignore lint/style/useImportType: PrismaService needed at runtime for DI
import { PrismaService } from '../../../../database/prisma.service'
import type {
  CreateUserParams,
  FindAllUsersParams,
  UserRepositoryPort
} from '../../application/ports/userRepository.port'
import { UserEntity } from '../../domain/entities/user.entity'
import { Email, UserId } from '../../domain/valueObjects'

@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaUser: {
    id: string
    email: string
    name: string
  }): UserEntity {
    const userId = new UserId(prismaUser.id)
    const email = new Email(prismaUser.email)
    const name = prismaUser.name

    return new UserEntity(userId, email, name)
  }

  async findAll(params: FindAllUsersParams) {
    const users = await this.prisma.user.findMany({
      skip: params.offset,
      take: params.limit
    })

    return users.map((user) => this.toDomain(user))
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    return user ? this.toDomain(user) : null
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })

    return user ? this.toDomain(user) : null
  }

  async create(params: CreateUserParams) {
    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: params.email,
        name: params.name ?? 'User',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return this.toDomain(user)
  }

  async save(entity: UserEntity) {
    const id = entity.getId().getValue()

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: entity.getEmail().getValue(),
        name: entity.getName() ?? 'User',
        updatedAt: new Date()
      }
    })

    return this.toDomain(user)
  }

  async delete(id: string) {
    await this.prisma.user.delete({
      where: { id }
    })
  }
}
