import { applyDecorators, type Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse
} from '@nestjs/swagger'

// biome-ignore lint/suspicious/noExplicitAny: Generic decorator requires any for flexibility
export const ApiListResponse = <TModel extends Type<any>>(
  model: TModel,
  description = 'Successfully retrieved list'
) =>
  applyDecorators(
    ApiOkResponse({
      description,
      type: [model]
    })
  )

// biome-ignore lint/suspicious/noExplicitAny: Generic decorator requires any for flexibility
export const ApiFindResponse = <TModel extends Type<any>>(
  model: TModel,
  resourceName: string
) =>
  applyDecorators(
    ApiOkResponse({
      description: `${resourceName} found successfully`,
      type: model
    }),
    ApiNotFoundResponse({ description: `${resourceName} not found` })
  )

// biome-ignore lint/suspicious/noExplicitAny: Generic decorator requires any for flexibility
export const ApiCreateResponse = <TModel extends Type<any>>(
  model: TModel,
  resourceName: string,
  includeConflict = false
) => {
  const decorators = [
    ApiCreatedResponse({
      description: `${resourceName} created successfully`,
      type: model
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' })
  ]

  if (includeConflict)
    decorators.push(
      ApiConflictResponse({ description: `${resourceName} already exists` })
    )

  return applyDecorators(...decorators)
}

// biome-ignore lint/suspicious/noExplicitAny: Generic decorator requires any for flexibility
export const ApiUpdateResponse = <TModel extends Type<any>>(
  model: TModel,
  resourceName: string
) =>
  applyDecorators(
    ApiOkResponse({
      description: `${resourceName} updated successfully`,
      type: model
    }),
    ApiNotFoundResponse({ description: `${resourceName} not found` }),
    ApiBadRequestResponse({ description: 'Invalid input data' })
  )

export const ApiDeleteResponse = (resourceName: string) =>
  applyDecorators(
    ApiNotFoundResponse({ description: `${resourceName} not found` })
  )
