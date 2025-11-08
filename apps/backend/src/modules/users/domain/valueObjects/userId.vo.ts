import { randomInt } from 'node:crypto'

export class UserId {
  private readonly value: number

  constructor(id?: number) {
    this.value = id ?? randomInt(1, 1000000)
  }

  getValue(): number {
    return this.value
  }

  equals(other: UserId) {
    return this.value === other.value
  }
}
