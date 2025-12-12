import { ApiProperty } from '@nestjs/swagger'

export class DeleteUserDto {
  @ApiProperty({
    description: 'User ID to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  readonly id!: string
}
