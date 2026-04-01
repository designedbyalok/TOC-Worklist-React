import { forwardRef } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './Button.module.css';

/**
 * Fold Health Button — single source-of-truth button control.
 *
 * Matches Figma Fold-Pixel-1.0 node 25:155 exactly.
 *
 * @param {object}   props
 * @param {'primary'|'secondary'|'tertiary'|'ghost'|'alt'|'success'|'danger'|'dangerFilled'|'info'} [props.variant='primary']
 * @param {'S'|'L'|'XL'}  [props.size='L']         – S=24px, L=32px, XL=52px (mobile)
 * @param {string}   [props.leadingIcon]             – Solar icon name for leading icon
 * @param {string}   [props.trailingIcon]            – Solar icon name for trailing icon
 * @param {boolean}  [props.iconOnly=false]          – Square icon-only button (no text)
 * @param {boolean}  [props.fullWidth=false]          – Full-width button
 * @param {boolean}  [props.disabled=false]
 * @param {string}   [props.className]               – Extra class on the button
 * @param {string}   [props.type='button']
 * @param {React.ReactNode} props.children           – Button text / content
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'L',
    leadingIcon,
    trailingIcon,
    iconOnly = false,
    fullWidth = false,
    disabled = false,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  const sizeClass = size === 'S' ? styles.sizeS : size === 'XL' ? styles.sizeXL : styles.sizeL;
  const iconSize = size === 'S' ? 14 : size === 'XL' ? 24 : 16;

  // Determine icon color based on variant
  const iconColor = (() => {
    if (disabled) return 'var(--neutral-150)';
    switch (variant) {
      case 'primary':
      case 'dangerFilled':
      case 'info':
        return '#fff';
      case 'secondary':
      case 'ghost':
        return 'var(--neutral-300)';
      case 'tertiary':
      case 'alt':
        return 'var(--primary-300)';
      case 'success':
        return 'var(--status-success)';
      case 'danger':
        return 'var(--status-error)';
      default:
        return 'currentColor';
    }
  })();

  const cls = [
    styles.btn,
    sizeClass,
    styles[variant] || styles.primary,
    iconOnly ? styles.iconOnly : '',
    fullWidth ? styles.fullWidth : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} type={type} className={cls} disabled={disabled} {...rest}>
      {leadingIcon && (
        <Icon name={leadingIcon} size={iconSize} color={iconColor} className={styles.icon} />
      )}
      {!iconOnly && children}
      {trailingIcon && (
        <Icon name={trailingIcon} size={iconSize} color={iconColor} className={styles.icon} />
      )}
    </button>
  );
});
