import { Email, UserId } from '../valueObjects'

export class UserEntity {
  constructor(
    private readonly id: UserId,
    private email: Email,
    private name: string | null
  ) {}

  static create(email: string, name?: string) {
    return new UserEntity(new UserId(), new Email(email), name?.trim() ?? null)
  }

  getId(): UserId {
    return this.id
  }

  getEmail(): Email {
    return this.email
  }

  getName(): string | null {
    return this.name
  }

  updateEmail(newEmail: string) {
    this.email = new Email(newEmail)
  }

  updateName(newName: string | null) {
    this.name = newName ? newName.trim() : null
  }
}
