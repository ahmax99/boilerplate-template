import { randomUUID } from 'node:crypto'

export class TodoId {
  private readonly value: string

  constructor(id?: string) {
    this.value = id || randomUUID()
  }

  getValue(): string {
    return this.value
  }

  equals(other: TodoId) {
    return this.value === other.value
  }
}
