import type { UserEntity } from '../../domain/entities/user.entity'

export interface FindAllUsersParams {
  limit?: number
  offset?: number
}

export interface CreateUserParams {
  email: string
  name?: string
}

export interface UpdateUserParams {
  id: number
  email?: string
  name?: string
}

export interface UserRepositoryPort {
  findAll(params: FindAllUsersParams): Promise<UserEntity[]>
  findById(id: number): Promise<UserEntity | null>
  findByEmail(email: string): Promise<UserEntity | null>
  create(params: CreateUserParams): Promise<UserEntity>
  update(params: UpdateUserParams): Promise<UserEntity>
  delete(id: number): Promise<void>
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')
