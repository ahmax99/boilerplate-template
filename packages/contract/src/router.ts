import { todosContract } from './contracts/todos.contract.js'
import { usersContract } from './contracts/users.contract.js'

export const appContract = {
  ...usersContract,
  ...todosContract
}

export type AppContract = typeof appContract
