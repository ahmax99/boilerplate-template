import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 1,
    type: Number
  })
  readonly id!: number

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'user@example.com',
    type: String
  })
  readonly email?: string

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    type: String,
    nullable: true
  })
  readonly name?: string
}

export class UpdateUserResponseDto {
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
