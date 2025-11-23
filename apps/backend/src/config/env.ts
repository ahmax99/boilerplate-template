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

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @Value('BASE_URL')
  baseUrl!: string

  @IsNotEmpty()
  @Value('BETTER_AUTH_SECRET')
  betterAuthSecret!: string

  @IsNotEmpty()
  @Value('GOOGLE_CLIENT_ID')
  googleClientId!: string

  @IsNotEmpty()
  @Value('GOOGLE_CLIENT_SECRET')
  googleClientSecret!: string

  @IsNotEmpty()
  @Value('GITHUB_CLIENT_ID')
  githubClientId!: string

  @IsNotEmpty()
  @Value('GITHUB_CLIENT_SECRET')
  githubClientSecret!: string
}
