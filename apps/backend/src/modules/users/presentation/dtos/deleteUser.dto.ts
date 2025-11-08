import { ApiProperty } from '@nestjs/swagger'

export class DeleteUserDto {
  @ApiProperty({
    description: 'User ID to delete',
    example: 1,
    type: Number
  })
  readonly id!: number
}
