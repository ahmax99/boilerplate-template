import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'

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
    name: string | null
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
  }): UserEntity {
    const userId = new UserId(prismaUser.id)
    const email = new Email(prismaUser.email)

    return new UserEntity(
      userId,
      prismaUser.name,
      email,
      prismaUser.emailVerified,
      prismaUser.image,
      prismaUser.createdAt,
      prismaUser.updatedAt
    )
  }

  async findAll(params: FindAllUsersParams) {
    const users = await this.prisma.getClient().user.findMany({
      skip: params.offset,
      take: params.limit
    })

    return users.map((user) => this.toDomain(user))
  }

  async findById(id: string) {
    const user = await this.prisma.getClient().user.findUnique({
      where: { id }
    })

    return user ? this.toDomain(user) : null
  }

  async findByEmail(email: string) {
    const user = await this.prisma.getClient().user.findUnique({
      where: { email }
    })

    return user ? this.toDomain(user) : null
  }

  async create(params: CreateUserParams) {
    const user = await this.prisma.getClient().user.create({
      data: {
        id: uuid(),
        name: params.name,
        email: params.email,
        emailVerified: params.emailVerified ?? false,
        image: params.image ?? null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return this.toDomain(user)
  }

  async save(entity: UserEntity) {
    const id = entity.getId().getValue()

    const user = await this.prisma.getClient().user.update({
      where: { id },
      data: {
        name: entity.getName(),
        email: entity.getEmail().getValue(),
        emailVerified: entity.getEmailVerified(),
        image: entity.getImage(),
        updatedAt: entity.getUpdatedAt()
      }
    })

    return this.toDomain(user)
  }

  async delete(id: string) {
    await this.prisma.getClient().user.delete({
      where: { id }
    })
  }
}
