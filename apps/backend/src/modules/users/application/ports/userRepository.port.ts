import type { UserEntity } from '../../domain/entities/user.entity'

export interface FindAllUsersParams {
  limit?: number
  offset?: number
}

export interface UserRepositoryPort {
  findAll(params: FindAllUsersParams): Promise<UserEntity[]>
  findById(id: string): Promise<UserEntity | null>
  findByEmail(email: string): Promise<UserEntity | null>
  save(entity: UserEntity): Promise<UserEntity>
  delete(id: string): Promise<void>
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')
