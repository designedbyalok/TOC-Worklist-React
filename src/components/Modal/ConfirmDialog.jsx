import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../ui/alert-dialog';
import { Icon } from '../Icon/Icon';

/**
 * Reusable confirmation dialog — matches Fold Health design system.
 * Backed by shadcn AlertDialog (Radix) in controlled mode.
 *
 * @param {object}   props
 * @param {string}   props.icon        – Iconify name for the top icon (default: warning)
 * @param {string}   props.iconColor   – Icon color (default: #D72825)
 * @param {string}   props.title       – Dialog heading
 * @param {string}   props.description – Supporting text
 * @param {string}   props.confirmLabel – Label for the primary action button (default: "Delete")
 * @param {string}   props.cancelLabel  – Label for the cancel button (default: "Cancel")
 * @param {'error'|'primary'} props.variant – Button variant (default: "error")
 * @param {function} props.onConfirm   – Called when user clicks the primary action
 * @param {function} props.onCancel    – Called when user clicks cancel or overlay
 * @param {boolean}  props.loading     – If true, disable buttons and show "..." on confirm
 */
export function ConfirmDialog({
  icon = 'solar:danger-triangle-linear',
  iconColor = '#D72825',
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
      <AlertDialogContent className="flex flex-col items-center gap-4 p-5 max-w-[340px]">
        {/* Icon */}
        <div className="flex items-center justify-center w-6 h-6 shrink-0">
          <Icon name={icon} size={24} color={iconColor} />
        </div>

        {/* Text */}
        <AlertDialogHeader className="items-center text-center gap-1">
          <AlertDialogTitle className="text-base font-medium text-[#3A485F] leading-tight">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm font-normal text-[#8A94A8] leading-snug">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {/* Actions */}
        <AlertDialogFooter className="flex-row justify-center w-full max-w-[320px] gap-2 mt-0">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium font-['Inter'] bg-white border border-[#E9ECF1] text-[#3A485F] hover:bg-[#F6F7F8] hover:border-[#D0D6E1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              variant === 'error'
                ? 'bg-[#FFF5F5] border border-[#E9ECF1] text-[#D72825] hover:bg-[#FFEDED] hover:border-[#D72825]'
                : 'bg-[#8C5AE2] border border-[#8C5AE2] text-white hover:bg-[#7B4BD4]'
            }`}
          >
            {loading ? 'Deleting\u2026' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
