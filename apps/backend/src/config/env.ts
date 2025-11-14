import { Configuration, Value } from '@itgorillaz/configify'
import { IsInt, IsNotEmpty, IsPositive, IsUrl } from 'class-validator'

@Configuration()
export class Env {
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  @Value('BACKEND_PORT', { parse: (value) => +value })
  port!: number

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @Value('WEB_URL')
  webUrl!: string
}
