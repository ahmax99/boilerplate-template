import { ApiProperty } from '@nestjs/swagger'

export class DeleteUserDto {
  @ApiProperty({
    description: 'User ID to delete',
    example: 1,
    type: Number
  })
  readonly id!: number
}

export class DeleteUserResponseDto {
  @ApiProperty({
    description: 'Indicates whether the deletion was successful',
    example: true,
    type: Boolean
  })
  readonly success!: boolean
}
