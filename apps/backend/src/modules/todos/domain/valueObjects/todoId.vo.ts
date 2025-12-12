import { v4 as uuid } from 'uuid'

export class TodoId {
  private readonly value: string

  constructor(id?: string) {
    this.value = id ?? uuid()
  }

  getValue(): string {
    return this.value
  }

  equals(other: TodoId) {
    return this.value === other.value
  }
}
