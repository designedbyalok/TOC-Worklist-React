import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-[var(--neutral-100)]', className)} {...props} />
}

export { Skeleton }
