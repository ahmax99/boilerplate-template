import { ApiProperty } from '@nestjs/swagger'

export class DeleteUserDto {
  @ApiProperty({
    description: 'User ID to delete',
    example: 'gNgOqyvp5NiRSGbsI5YVndCPUpg8XUAZ',
    type: String
  })
  readonly id!: string
}
