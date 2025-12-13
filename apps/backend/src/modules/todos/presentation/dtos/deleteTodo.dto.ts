import { ApiProperty } from '@nestjs/swagger'

export class DeleteTodoDto {
  @ApiProperty({
    description: 'Todo ID to delete',
    example: 'kL8mN9pQ2rS3tU4vW5xY6zA7bC8dE9fG',
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
