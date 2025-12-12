import { Email, UserId } from '../valueObjects'

export class UserEntity {
  constructor(
    private readonly id: UserId,
    private name: string | null,
    private email: Email,
    private emailVerified: boolean,
    private image: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(
    email: string,
    name?: string | null,
    emailVerified?: boolean,
    image?: string | null
  ) {
    return new UserEntity(
      new UserId(),
      name?.trim() ?? null,
      new Email(email),
      emailVerified ?? false,
      image ?? null,
      new Date(),
      new Date()
    )
  }

  getId(): UserId {
    return this.id
  }

  getName(): string | null {
    return this.name
  }

  getEmail(): Email {
    return this.email
  }

  getEmailVerified(): boolean {
    return this.emailVerified
  }

  getImage(): string | null {
    return this.image
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  updateName(newName: string | null) {
    this.name = newName ? newName.trim() : null
    this.updatedAt = new Date()
  }

  updateEmail(newEmail: string) {
    this.email = new Email(newEmail)
    this.updatedAt = new Date()
  }

  updateEmailVerified(verified: boolean) {
    this.emailVerified = verified
    this.updatedAt = new Date()
  }

  updateImage(newImage: string | null) {
    this.image = newImage
    this.updatedAt = new Date()
  }
}
