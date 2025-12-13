import { nanoid } from 'nanoid'

export class TodoId {
  private readonly value: string

  constructor(id?: string) {
    this.value = id ?? nanoid()
  }

  getValue(): string {
    return this.value
  }

  equals(other: TodoId) {
    return this.value === other.value
  }
}
