import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class FindTodoDto {
  @ApiProperty({
    description: 'Todo ID to find',
    example: 1,
    type: Number
  })
  readonly id!: number
}

export class FindTodoResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the todo',
    example: 1,
    type: Number
  })
  readonly id!: number

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
    example: 1,
    type: Number
  })
  readonly userId!: number

  @ApiProperty({
    description: 'Timestamp when the todo was created',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time'
  })
  readonly createdAt!: Date
}
