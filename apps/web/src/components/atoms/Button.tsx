import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import { type IconSize, IconWrapper } from './IconWrapper'

const buttonBase =
  // layout & typography
  'inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap font-medium text-sm transition-all ' +
  // border
  'rounded-md ' +
  // disabled
  'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed ' +
  // aria-invalid
  'aria-invalid:ring-destructive dark:aria-invalid:ring-destructive aria-invalid:border-destructive'

const buttonVariants = cva(buttonBase, {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      outline: 'border bg-background dark:bg-input dark:border-input',
      secondary: 'bg-secondary text-secondary-foreground',
      ghost:
        'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent',
      link: 'text-primary underline-offset-4 hover:underline'
    },
    size: {
      default: 'h-9 rounded-md px-4 py-2',
      sm: 'h-8 rounded-sm gap-1.5 px-3',
      lg: 'h-10 rounded-lg px-6'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
})

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  iconSize?: 'sm' | 'lg' | 'default'
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  isLoading?: boolean
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  iconSize = 'default',
  type = 'button',
  startIcon,
  endIcon,
  isLoading,
  children,
  ...props
}: Readonly<ButtonProps>) {
  const classes = cn(buttonVariants({ variant, size }), className)

  const withLeadingIcon = Boolean(startIcon)
  const withTrailingIcon = Boolean(endIcon)

  const getIconSize = (): IconSize => {
    if (iconSize === 'sm') return 3
    if (iconSize === 'lg') return 7
    return 5
  }

  return (
    <button
      className={classes}
      disabled={isLoading || props.disabled}
      type={type}
      {...props}
    >
      {withLeadingIcon && (
        <IconWrapper size={getIconSize()}>{startIcon}</IconWrapper>
      )}
      {isLoading ? <Loader2 className="animate-spin" /> : children}
      {withTrailingIcon && (
        <IconWrapper size={getIconSize()}>{endIcon}</IconWrapper>
      )}
    </button>
  )
}
