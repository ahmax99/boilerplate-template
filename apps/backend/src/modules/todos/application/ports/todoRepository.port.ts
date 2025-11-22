import type { TodoEntity } from '../../domain/entities/todo.entity'

export interface FindAllTodosParams {
  userId?: string
  limit?: number
  offset?: number
}

export interface CreateTodoParams {
  title: string
  description?: string
  isDone: boolean
  userId: string
}

export interface TodoRepositoryPort {
  findAll(params: FindAllTodosParams): Promise<TodoEntity[]>
  findById(id: string): Promise<TodoEntity | null>
  create(params: CreateTodoParams): Promise<TodoEntity>
  save(entity: TodoEntity): Promise<TodoEntity>
  delete(id: string): Promise<void>
}

export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY')
