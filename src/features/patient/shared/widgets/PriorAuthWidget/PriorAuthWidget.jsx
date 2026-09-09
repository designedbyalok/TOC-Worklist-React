import { useState } from 'react';
import { DownChevronIcon } from '../../../../../components/Icon/DownChevronIcon';
import { ActionButton } from '../../../../../components/ActionButton/ActionButton';
import { Badge } from '../../../../../components/Badge/Badge';
import styles from './PriorAuthWidget.module.css';

export function PriorAuthWidget() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <button className={styles.titleBtn} onClick={() => setCollapsed(v => !v)}>
          <DownChevronIcon
            size={13}
            color="var(--neutral-400)"
            style={collapsed ? { transform: 'rotate(-90deg)' } : undefined}
          />
          <span className={styles.title}>Prior Authorization Requests</span>
        </button>
        {!collapsed && (
          <ActionButton icon="solar:add-circle-linear" size="S" tooltip="Add" />
        )}
      </div>

      {!collapsed && (
        <div className={styles.body}>
          <div className={styles.table}>
            {/* Column headers */}
            <span className={`${styles.colLabel} ${styles.colName}`}>Auth Number</span>
            <span className={`${styles.colLabel} ${styles.colStatus}`}>Status</span>

            {/* Data row — flat children share the grid column tracks */}
            <div className={styles.authInfo}>
              <span className={styles.authNumber}>19112102700142400000</span>
              <span className={styles.authDate}>Auth Date: 11/18/23</span>
            </div>
            <div className={styles.statusCell}>
              <Badge variant="status-review" label="Insurer Review" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
