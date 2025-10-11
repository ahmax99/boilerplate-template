'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Switch } from '@/components/atoms'

export function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  return (
    <div>
      <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
        <Switch
          aria-label="Toggle dark mode"
          checked={isDark}
          className="peer absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
          onCheckedChange={(checked) => {
            setTheme(checked ? 'dark' : 'light')
          }}
        />
        <span className="pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full peer-data-[state=unchecked]:rtl:-translate-x-full">
          <MoonIcon aria-hidden="true" size={16} />
        </span>
        <span className="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=unchecked]:invisible peer-data-[state=checked]:-translate-x-full peer-data-[state=checked]:rtl:translate-x-full">
          <SunIcon aria-hidden="true" size={16} />
        </span>
      </div>
    </div>
  )
}
