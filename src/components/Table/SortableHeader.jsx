import { Icon } from '../Icon/Icon';
import styles from './SortableHeader.module.css';

/**
 * SortableHeader — clickable table header cell with sort indicator.
 *
 * Props:
 *  - label       (string)  Column display name
 *  - sortKey     (string)  The key this column sorts by
 *  - currentKey  (string)  Currently active sort key
 *  - currentDir  ('asc'|'desc')  Current sort direction
 *  - onSort      (function) Called with sortKey on click
 *  - align       ('left'|'right'|'center')  Text alignment (default: left)
 *  - className   (string)  Extra class
 *  - style       (object)  Inline styles
 *
 * If sortKey is not provided, renders a plain (non-sortable) header.
 */
export function SortableHeader({ label, sortKey, currentKey, currentDir, onSort, align = 'left', className, style }) {
  const isSortable = !!sortKey && !!onSort;
  const isActive = isSortable && currentKey === sortKey;

  return (
    <th
      className={`${styles.th} ${isSortable ? styles.sortable : ''} ${isActive ? styles.active : ''} ${className || ''}`}
      style={{ textAlign: align, ...style }}
      onClick={isSortable ? () => onSort(sortKey) : undefined}
    >
      <span className={styles.label}>
        {label}
        {isSortable && (
          <span className={styles.sortIcon}>
            {isActive ? (
              <Icon
                name={currentDir === 'asc' ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'}
                size={12}
                color="var(--primary-300)"
              />
            ) : (
              <Icon name="solar:sort-vertical-linear" size={12} color="var(--neutral-200)" />
            )}
          </span>
        )}
      </span>
    </th>
  );
}
