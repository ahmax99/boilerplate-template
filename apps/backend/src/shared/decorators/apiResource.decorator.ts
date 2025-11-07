import { applyDecorators, type Type } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'

// biome-ignore lint/suspicious/noExplicitAny: Generic decorator requires any for flexibility
export const ApiResource = (tag: string, ...models: Type<any>[]) =>
  applyDecorators(ApiTags(tag), ApiExtraModels(...models))
