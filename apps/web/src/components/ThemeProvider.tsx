'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children,
  ...props
}: Readonly<React.ComponentProps<typeof NextThemesProvider>>) {
  const providerProps: React.ComponentProps<typeof NextThemesProvider> = {
    attribute: 'class',
    defaultTheme: 'system',
    enableSystem: true,
    disableTransitionOnChange: true,
    ...props
  }

  return <NextThemesProvider {...providerProps}>{children}</NextThemesProvider>
}
