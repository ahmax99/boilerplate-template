import { randomInt } from 'node:crypto'

export class TodoId {
  private readonly value: number

  constructor(id?: number) {
    this.value = id ?? randomInt(1, 1000000)
  }

  getValue(): number {
    return this.value
  }

  equals(other: TodoId) {
    return this.value === other.value
  }
}
