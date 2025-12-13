import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'gNgOqyvp5NiRSGbsI5YVndCPUpg8XUAZ',
    type: String
  })
  readonly id!: string

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    type: String,
    nullable: true
  })
  readonly name?: string | null

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'user@example.com',
    type: String
  })
  readonly email?: string

  @ApiPropertyOptional({
    description: 'Whether the email is verified',
    example: true,
    type: Boolean
  })
  readonly emailVerified?: boolean

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/avatar.jpg',
    type: String,
    nullable: true
  })
  readonly image?: string | null
}

export class UpdateUserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'gNgOqyvp5NiRSGbsI5YVndCPUpg8XUAZ',
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
    example: true,
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
