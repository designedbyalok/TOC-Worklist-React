import { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Fold Health Input — single source-of-truth text input control.
 *
 * Matches Figma Fold-Pixel design node 25:21239 exactly.
 *
 * Design tokens:
 *   Height:       32px
 *   Border:       0.5px solid var(--neutral-150) (#D0D6E1)
 *   Radius:       6px
 *   Padding:      0 8px
 *   Font:         Inter 14px 400 #3A485F
 *   Placeholder:  #8A94A8
 *   Focus:        border var(--primary-300), ring 2px rgba(140,90,226,.12)
 *   Disabled:     background var(--neutral-50), opacity 0.6, cursor not-allowed
 *   Error:        border var(--status-error), background var(--status-error-light)
 *
 * @param {object}   props
 * @param {string}   [props.variant]     – 'default' | 'error'
 * @param {string}   [props.className]   – Extra class on the input
 * @param {boolean}  [props.disabled]    – Disable interaction
 * @param {boolean}  [props.readOnly]    – Read-only state
 */
export const Input = forwardRef(function Input({ variant = 'default', className, ...props }, ref) {
  const cls = [
    styles.input,
    variant === 'error' ? styles.inputError : '',
    className || '',
  ].filter(Boolean).join(' ');

  return <input ref={ref} className={cls} {...props} />;
});
