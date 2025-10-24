'use client'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

import { env } from '@/config/env'

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers = ({ children, ...props }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false
          }
        }
      })
  )
  const providerProps: React.ComponentProps<typeof NextThemesProvider> = {
    attribute: 'class',
    defaultTheme: 'system',
    enableSystem: true,
    disableTransitionOnChange: true,
    ...props
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider {...providerProps}>{children}</NextThemesProvider>
      {env.NEXT_PUBLIC_NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
