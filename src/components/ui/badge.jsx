import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border-primary/20',
        destructive: 'bg-error-light text-error border-[rgba(215,40,37,0.2)]',
        success: 'bg-success-light text-success border-[rgba(0,155,83,0.2)]',
        warning: 'bg-warning-light text-warning border-[rgba(217,165,11,0.2)]',
        outline: 'border-border text-foreground',
        muted: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
