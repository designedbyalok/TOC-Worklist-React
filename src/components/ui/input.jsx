import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'h-9 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-normal text-foreground placeholder:text-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
