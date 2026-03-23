import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon';
import styles from './ConfirmDialog.module.css';

/**
 * Reusable confirmation dialog — matches Fold Health design system.
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
  const panelRef = useRef(null);

  // Trap focus & close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && onCancel) onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  // Auto-focus the cancel button
  useEffect(() => {
    if (panelRef.current) panelRef.current.querySelector('button')?.focus();
  }, []);

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <Icon name={icon} size={24} color={iconColor} />
        </div>
        <div className={styles.textBlock}>
          <div className={styles.title}>{title}</div>
          {description && <div className={styles.description}>{description}</div>}
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={`${styles.confirmBtn} ${variant === 'error' ? styles.confirmBtnError : styles.confirmBtnPrimary}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
