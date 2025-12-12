import { v4 as uuid } from 'uuid'

export class UserId {
  private readonly value: string

  constructor(id?: string) {
    this.value = id ?? uuid()
  }

  getValue(): string {
    return this.value
  }

  equals(other: UserId) {
    return this.value === other.value
  }
}
