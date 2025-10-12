import { todosContract } from './contracts/todos.contract'
import { usersContract } from './contracts/users.contract'

export const appContract = {
  ...usersContract,
  ...todosContract
}

export type AppContract = typeof appContract
