import { TodoId } from '../valueObjects'

export class TodoEntity {
  constructor(
    private readonly id: TodoId,
    private title: string,
    private description: string | null,
    private isDone: boolean,
    private readonly userId: number,
    private readonly createdAt: Date
  ) {}

  static create(
    title: string,
    userId: number,
    description?: string,
    isDone = false
  ) {
    return new TodoEntity(
      new TodoId(),
      title.trim(),
      description?.trim() ?? null,
      isDone,
      userId,
      new Date()
    )
  }

  getId(): TodoId {
    return this.id
  }

  getTitle(): string {
    return this.title
  }

  getDescription(): string | null {
    return this.description
  }

  getIsDone(): boolean {
    return this.isDone
  }

  getUserId(): number {
    return this.userId
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  updateTitle(newTitle: string) {
    this.title = newTitle.trim()
  }

  updateDescription(newDescription: string | null) {
    this.description = newDescription ? newDescription.trim() : null
  }

  markAsDone() {
    this.isDone = true
  }

  markAsUndone() {
    this.isDone = false
  }
}
