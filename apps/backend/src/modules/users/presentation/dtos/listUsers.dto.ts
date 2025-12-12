import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ListUsersDto {
  @ApiPropertyOptional({
    description: 'Maximum number of users to return',
    example: 10,
    minimum: 1,
    maximum: 100,
    type: Number
  })
  readonly limit?: number

  @ApiPropertyOptional({
    description: 'Number of users to skip',
    example: 0,
    minimum: 0,
    type: Number
  })
  readonly offset?: number
}

export class ListUsersResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  readonly id!: string

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    type: String,
    nullable: true
  })
  readonly name!: string | null

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    type: String
  })
  readonly email!: string

  @ApiProperty({
    description: 'Whether the email is verified',
    example: false,
    type: Boolean
  })
  readonly emailVerified!: boolean

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/avatar.jpg',
    type: String,
    nullable: true
  })
  readonly image!: string | null

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time'
  })
  readonly createdAt!: Date

  @ApiProperty({
    description: 'Timestamp when the user was last updated',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time'
  })
  readonly updatedAt!: Date
}
