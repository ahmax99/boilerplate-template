import { Configuration, Value } from '@itgorillaz/configify'
import { IsNotEmpty, IsUrl } from 'class-validator'

@Configuration()
export class Env {
  @IsNotEmpty()
  @Value('NODE_ENV')
  nodeEnv!: 'development' | 'production' | 'mock'

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
