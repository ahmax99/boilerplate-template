import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTodoDto {
  @ApiProperty({
    description: 'Title of the todo',
    example: 'Complete project',
    type: String
  })
  readonly title!: string

  @ApiPropertyOptional({
    description: 'Detailed description of the todo',
    example: 'Finish the API documentation',
    type: String,
    nullable: true
  })
  readonly description?: string

  @ApiProperty({
    description: 'Whether the todo is completed',
    example: false,
    type: Boolean
  })
  readonly isDone!: boolean

  @ApiProperty({
    description: 'ID of the user who owns this todo',
    example: 'gNgOqyvp5NiRSGbsI5YVndCPUpg8XUAZ',
    type: String
  })
  readonly userId!: string
}

export class CreateTodoResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the todo',
    example: 'kL8mN9pQ2rS3tU4vW5xY6zA7bC8dE9fG',
    type: String
  })
  readonly id!: string

  @ApiProperty({
    description: 'Title of the todo',
    example: 'Complete project',
    type: String
  })
  readonly title!: string

  @ApiPropertyOptional({
    description: 'Detailed description of the todo',
    example: 'Finish the API documentation',
    type: String,
    nullable: true
  })
  readonly description!: string | null

  @ApiProperty({
    description: 'Whether the todo is completed',
    example: false,
    type: Boolean
  })
  readonly isDone!: boolean

  @ApiProperty({
    description: 'ID of the user who owns this todo',
    example: 'gNgOqyvp5NiRSGbsI5YVndCPUpg8XUAZ',
    type: String
  })
  readonly userId!: string

  @ApiProperty({
    description: 'Timestamp when the todo was created',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time'
  })
  readonly createdAt!: Date
}
