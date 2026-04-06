import { forwardRef } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './ActionButton.module.css';

/**
 * Fold Health ActionButton — square icon-only toolbar/action button.
 *
 * Matches Figma Fold-Pixel-1.0 node 25:25238 exactly.
 *
 * Used for toolbar icons (search, filter, history, export), table row actions,
 * and any place a compact icon-only button is needed with optional badges.
 *
 * @param {object}   props
 * @param {string}   [props.icon]                      – Solar icon name (e.g. "solar:filter-linear")
 * @param {React.ReactNode} [props.children]            – Custom icon element (used instead of icon prop)
 * @param {'S'|'L'|'XL'} [props.size='L']              – S=16px icon, L=20px icon, XL=32px icon
 * @param {'active'|'disabled'|'error'} [props.state='active']
 * @param {string}   [props.tooltip]                    – Tooltip text (styled bubble on hover)
 * @param {boolean}  [props.notification=false]          – Show orange notification badge
 * @param {string}   [props.count]                      – Badge count text (shows grey count badge)
 * @param {boolean}  [props.dot=false]                  – Show red status dot
 * @param {boolean}  [props.chevron=false]              – Show dropdown chevron
 * @param {boolean}  [props.chevronOpen=false]          – Rotate chevron when open
 * @param {string}   [props.className]                  – Extra class
 * @param {string}   [props.iconColor]                  – Override icon color
 */
export const ActionButton = forwardRef(function ActionButton({
  icon,
  children,
  size = 'L',
  state = 'active',
  tooltip,
  notification = false,
  count,
  dot = false,
  chevron = false,
  chevronOpen = false,
  className,
  iconColor,
  ...rest
}, ref) {
  const iconSize = size === 'S' ? 16 : size === 'XL' ? 32 : 20;
  const sizeClass = size === 'S' ? styles.sizeS : size === 'XL' ? styles.sizeXL : styles.sizeL;
  const stateClass = state === 'disabled' ? styles.disabled : state === 'error' ? styles.error : styles.active;

  const resolvedColor = iconColor || (
    state === 'disabled' ? 'var(--neutral-150)'
    : state === 'error' ? 'var(--status-error)'
    : 'var(--neutral-300)'
  );

  const cls = [
    styles.root,
    sizeClass,
    stateClass,
    className || '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      ref={ref}
      className={cls}
      disabled={state === 'disabled'}
      aria-label={tooltip}
      {...rest}
    >
      {children || <Icon name={icon} size={iconSize} color={resolvedColor} />}

      {/* Styled tooltip bubble */}
      {tooltip && (
        <span className={styles.tooltip}>{tooltip}</span>
      )}

      {/* Notification badge (orange with count) */}
      {notification && (
        <span className={`${styles.badge} ${styles.badgeNotification}`}>
          {count || ''}
        </span>
      )}

      {/* Count badge (grey with number) */}
      {!notification && count && (
        <span className={`${styles.badge} ${styles.badgeCount}`}>
          {count}
        </span>
      )}

      {/* Status dot */}
      {dot && !notification && !count && (
        <span className={styles.dot} />
      )}

      {/* Dropdown chevron */}
      {chevron && (
        <Icon
          name="solar:alt-arrow-down-linear"
          size={10}
          color={resolvedColor}
          className={`${styles.chevron} ${chevronOpen ? styles.chevronOpen : ''}`}
        />
      )}
    </button>
  );
});
