import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '../ui/alert-dialog';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';

/**
 * Reusable confirmation dialog — matches Fold Health design system.
 * Uses Button component for consistent styling across the app.
 *
 * @param {object}   props
 * @param {string}   props.icon        – Iconify name for the top icon
 * @param {string}   props.iconColor   – Icon color
 * @param {string}   props.title       – Dialog heading
 * @param {string}   props.description – Supporting text
 * @param {string}   props.confirmLabel – Label for the primary action button
 * @param {string}   props.cancelLabel  – Label for the cancel button
 * @param {'error'|'primary'} props.variant – Button variant
 * @param {function} props.onConfirm   – Called when user clicks the primary action
 * @param {function} props.onCancel    – Called when user clicks cancel or overlay
 * @param {boolean}  props.loading     – If true, disable buttons and show loading text
 */
export function ConfirmDialog({
  icon = 'solar:danger-triangle-linear',
  iconColor = 'var(--status-error)',
  title = 'Are you sure?',
  description = '',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'error',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) onCancel?.(); }}>
      <AlertDialogContent
        className="flex flex-col items-center gap-4 p-5 max-w-[340px]"
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-6 h-6 shrink-0">
          <Icon name={icon} size={24} color={iconColor} />
        </div>

        {/* Text */}
        <AlertDialogHeader className="items-center text-center gap-1">
          <AlertDialogTitle className="text-base font-medium text-[var(--neutral-400)] leading-tight">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm font-normal text-[var(--neutral-200)] leading-snug">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {/* Actions — using Button component */}
        <AlertDialogFooter className="flex-row justify-center w-full gap-2 mt-0">
          <Button
            variant="secondary"
            size="L"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'error' ? 'danger' : 'primary'}
            size="L"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Processing\u2026' : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
