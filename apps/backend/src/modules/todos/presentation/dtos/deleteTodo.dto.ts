import { ApiProperty } from '@nestjs/swagger'

export class DeleteTodoDto {
  @ApiProperty({
    description: 'Todo ID to delete',
    example: 1,
    type: Number
  })
  readonly id!: number
}

export class DeleteTodoResponseDto {
  @ApiProperty({
    description: 'Indicates whether the deletion was successful',
    example: true,
    type: Boolean
  })
  readonly success!: boolean
}
