import { ApiProperty } from '@nestjs/swagger'

export class DeleteTodoDto {
  @ApiProperty({
    description: 'Todo ID to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  readonly id!: string
}

export class DeleteTodoResponseDto {
  @ApiProperty({
    description: 'Indicates whether the deletion was successful',
    example: true,
    type: Boolean
  })
  readonly success!: boolean
}
