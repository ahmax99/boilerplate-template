'use client'

import { useId, useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { IconWrapper, Input } from '@/components/atoms'
import { cn } from '@/lib/utils'

const toggleButtonBase =
  // positioning & layout
  'absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center ' +
  // appearance
  'rounded-e-md outline-none ' +
  // colors & theming
  'text-muted-foreground/80 hover:text-foreground ' +
  // focus states
  'focus:z-10 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-1 ' +
  // disabled states
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ' +
  // transitions
  'transition-[color,box-shadow]'

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly className?: string
}
export function PasswordInput({
  className,
  value: externalValue,
  onChange: externalOnChange,
  ...props
}: PasswordInputProps) {
  const id = useId()
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const toggleVisibility = () => setIsVisible((prevState) => !prevState)

  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          className={cn('pe-9', className)}
          id={id}
          onChange={externalOnChange}
          type={isVisible ? 'text' : 'password'}
          value={externalValue}
          {...props}
        />
        <button
          aria-controls={id}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          className={toggleButtonBase}
          onClick={toggleVisibility}
          type="button"
        >
          {isVisible ? (
            <IconWrapper size={4}>
              <EyeOffIcon aria-hidden="true" />
            </IconWrapper>
          ) : (
            <IconWrapper size={4}>
              <EyeIcon aria-hidden="true" />
            </IconWrapper>
          )}
        </button>
      </div>
    </div>
  )
}
