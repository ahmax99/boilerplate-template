import { Configuration, Value } from '@itgorillaz/configify'
import { IsNotEmpty, IsUrl } from 'class-validator'

@Configuration()
export class Env {
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @Value('WEB_URL')
  webUrl!: string

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @Value('BASE_URL')
  baseUrl!: string

  get port(): number {
    const url = new URL(this.baseUrl)
    return Number.parseInt(url.port, 10)
  }

  @IsNotEmpty()
  @Value('DATABASE_URL')
  databaseUrl!: string
}
