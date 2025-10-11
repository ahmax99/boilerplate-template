'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { IconWrapper } from '@/components/atoms'
import { cn } from '@/lib/utils'

const checkboxBase =
  // layout & sizing
  'flex size-4 shrink-0 items-center justify-center ' +
  // appearance
  'peer rounded-[4px] border shadow-xs ' +
  // colors & theming
  'border-input dark:bg-input/30 ' +
  // states
  'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary ' +
  // focus
  'focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-1 ' +
  // validation
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ' +
  // disabled
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  // transitions
  'transition-shadow'

export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(checkboxBase, className)}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex items-center justify-center text-current transition-none"
        data-slot="checkbox-indicator"
      >
        <IconWrapper size={4}>
          <CheckIcon />
        </IconWrapper>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
