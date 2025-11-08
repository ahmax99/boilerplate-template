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
    id: number
    email: string
    name: string | null
  }): UserEntity {
    const userId = new UserId(prismaUser.id.toString())
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

  async findById(id: number) {
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
        email: params.email,
        name: params.name
      }
    })

    return this.toDomain(user)
  }

  async save(entity: UserEntity) {
    const id = Number.parseInt(entity.getId().getValue(), 10)

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: entity.getEmail().getValue(),
        name: entity.getName()
      }
    })

    return this.toDomain(user)
  }

  async delete(id: number) {
    await this.prisma.user.delete({
      where: { id }
    })
  }
}
