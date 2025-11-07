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
    example: 1,
    type: Number
  })
  readonly id!: number

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    type: String
  })
  readonly email!: string

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    type: String,
    nullable: true
  })
  readonly name!: string | null
}
