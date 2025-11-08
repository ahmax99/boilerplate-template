import type { TodoEntity } from '../../domain/entities/todo.entity'

export interface FindAllTodosParams {
  userId?: number
  limit?: number
  offset?: number
}

export interface CreateTodoParams {
  title: string
  description?: string
  isDone: boolean
  userId: number
}

export interface TodoRepositoryPort {
  findAll(params: FindAllTodosParams): Promise<TodoEntity[]>
  findById(id: number): Promise<TodoEntity | null>
  create(params: CreateTodoParams): Promise<TodoEntity>
  save(entity: TodoEntity): Promise<TodoEntity>
  delete(id: number): Promise<void>
}

export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY')
