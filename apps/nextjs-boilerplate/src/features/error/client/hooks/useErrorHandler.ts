'use client'

import { ERROR_DEFINITIONS } from '@shared/config'
import { toast } from 'sonner'

import type { AppError } from '../../lib/AppError'
import { useErrorStore } from '../stores/useErrorStore'

export const useErrorHandler = () => (error: AppError | string) => {
  const { setError } = useErrorStore.getState()
  if (typeof error === 'string') return toast.error(error)

  switch (error.code) {
    case 'NOT_FOUND':
    case 'FORBIDDEN':
    case 'UNAUTHORIZED':
    case 'BAD_REQUEST':
    case 'RATE_LIMIT_EXCEEDED':
      return toast.error(error.message ?? ERROR_DEFINITIONS[error.code].message)
    case 'INTERNAL_ERROR':
      setError(error)
      break
    default:
      error.code satisfies never
      setError(error)
  }
}
