'use client'

import { useEffect, useState } from 'react'

import { catchSyncError } from '@/features/error/utils/catchError'
import { captureError } from '@/features/error-tracking/utils/captureError'

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    if (globalThis.window === undefined) return defaultValue

    const result = catchSyncError(() => {
      const stored = globalThis.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    })

    if (result.isErr()) {
      captureError(result.error)
      return defaultValue
    }

    return result.value
  })

  useEffect(() => {
    if (globalThis.window === undefined) return

    const result = catchSyncError(() =>
      globalThis.localStorage.setItem(key, JSON.stringify(value))
    )

    if (result.isErr()) captureError(result.error)
  }, [key, value])

  return [value, setValue] as const
}
