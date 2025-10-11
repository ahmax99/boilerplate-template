import { cn } from '@/lib/utils'

export type IconSize = 3 | 4 | 5 | 6 | 7

const sizeClasses = {
  3: 'size-3',
  4: 'size-4',
  5: 'size-5',
  6: 'size-6',
  7: 'size-7'
}

interface IconWrapperProps {
  size?: IconSize
  children: React.ReactNode
  className?: string
}

export function IconWrapper({
  size = 5,
  className,
  children
}: Readonly<IconWrapperProps>) {
  const iconSizeClass = sizeClasses[size]

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        iconSizeClass,
        className
      )}
    >
      {children}
    </div>
  )
}
