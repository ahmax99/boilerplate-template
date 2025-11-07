import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class FindUserDto {
  @ApiProperty({
    description: 'User ID to find',
    example: 1,
    type: Number
  })
  readonly id!: number
}

export class FindUserResponseDto {
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
