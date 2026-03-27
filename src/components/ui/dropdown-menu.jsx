import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

/* ── Content panel: Figma spec ──
   bg: white, border: 0.5px #E9ECF1, radius: 4px
   shadow: 0 12px 60px -15px rgba(0,0,0,0.06), padding: 8px */
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[180px] overflow-hidden rounded-[4px] border-[0.5px] border-[var(--neutral-100)] bg-white p-[8px] shadow-[0_12px_60px_-15px_rgba(0,0,0,0.06)]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

/* ── Menu item: 32px height, 4px gap, 8px px, 4px radius ── */
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-[4px] h-[32px] rounded-[4px] px-[8px] text-[14px] font-normal text-[var(--neutral-500)] leading-[1.2] outline-none transition-colors hover:bg-[var(--neutral-50)] focus:bg-[var(--neutral-50)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    style={{ fontFamily: "'Inter', sans-serif" }}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

/* ── Checkbox item ── */
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-[4px] h-[32px] rounded-[4px] px-[8px] pl-[28px] text-[14px] font-normal text-[var(--neutral-500)] leading-[1.2] outline-none transition-colors hover:bg-[var(--neutral-50)] focus:bg-[var(--neutral-50)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    style={{ fontFamily: "'Inter', sans-serif" }}
    checked={checked}
    {...props}
  >
    <span className="absolute left-[8px] flex h-[16px] w-[16px] items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

/* ── Radio item ── */
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-[4px] h-[32px] rounded-[4px] px-[8px] pl-[28px] text-[14px] font-normal text-[var(--neutral-500)] leading-[1.2] outline-none transition-colors hover:bg-[var(--neutral-50)] focus:bg-[var(--neutral-50)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    style={{ fontFamily: "'Inter', sans-serif" }}
    {...props}
  >
    <span className="absolute left-[8px] flex h-[16px] w-[16px] items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <span className="h-[8px] w-[8px] rounded-full bg-[var(--primary-300)]" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

/* ── Section label: grey-300, 14px medium ── */
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-[8px] py-[4px] text-[14px] font-medium text-[var(--neutral-300)] leading-[1.2]',
      inset && 'pl-8',
      className
    )}
    style={{ fontFamily: "'Inter', sans-serif" }}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

/* ── Divider: 0.5px grey-150 ── */
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('my-[4px] h-[0.5px] bg-[var(--neutral-150)]', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({ className, ...props }) => (
  <span className={cn('ml-auto text-[12px] tracking-widest text-[var(--neutral-200)]', className)} {...props} />
)
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

/* ── Sub-menu trigger (with right chevron) ── */
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-[4px] h-[32px] rounded-[4px] px-[8px] text-[14px] font-normal text-[var(--neutral-500)] leading-[1.2] outline-none hover:bg-[var(--neutral-50)] focus:bg-[var(--neutral-50)] data-[state=open]:bg-[var(--neutral-50)]',
      inset && 'pl-8',
      className
    )}
    style={{ fontFamily: "'Inter', sans-serif" }}
    {...props}
  >
    {children}
    <svg width="6" height="6" viewBox="0 0 6 6" className="ml-auto shrink-0 opacity-60">
      <path d="M2 1L4.5 3L2 5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[160px] overflow-hidden rounded-[4px] border-[0.5px] border-[var(--neutral-100)] bg-white p-[8px] shadow-[0_12px_60px_-15px_rgba(0,0,0,0.06)]',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
