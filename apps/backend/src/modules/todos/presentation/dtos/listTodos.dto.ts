import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ListTodosDto {
  @ApiPropertyOptional({
    description: 'Filter todos by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  readonly userId?: string

  @ApiPropertyOptional({
    description: 'Maximum number of todos to return',
    example: 10,
    minimum: 1,
    maximum: 100,
    type: Number
  })
  readonly limit?: number

  @ApiPropertyOptional({
    description: 'Number of todos to skip',
    example: 0,
    minimum: 0,
    type: Number
  })
  readonly offset?: number
}

export class ListTodosResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the todo',
    example: '123e4567-e89b-12d3-a456-426614174000',
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
    example: '123e4567-e89b-12d3-a456-426614174000',
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
