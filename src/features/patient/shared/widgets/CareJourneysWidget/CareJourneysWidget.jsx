import { useState, Fragment } from 'react';
import { Icon } from '../../../../../components/Icon/Icon';
import { DownChevronIcon } from '../../../../../components/Icon/DownChevronIcon';
import { ActionButton } from '../../../../../components/ActionButton/ActionButton';
import { Badge } from '../../../../../components/Badge/Badge';
import styles from './CareJourneysWidget.module.css';

const JOURNEYS = [
  {
    id: 1,
    name: 'Wearable Journey',
    date: '11/18/2025',
    type: 'Fixed',
    progress: 0,
    total: 7,
    unit: 'Days',
    status: 'Assigned',
    badgeVariant: 'toc-oncall',
  },
  {
    id: 2,
    name: 'Hypertension Journey',
    date: '11/18/2025',
    type: 'Rolling',
    progress: 30,
    total: 180,
    unit: 'Days',
    status: 'Active',
    badgeVariant: 'toc-enrolled',
  },
  {
    id: 3,
    name: 'Wearable Journey',
    date: '11/18/2025',
    type: 'Fixed',
    progress: 1,
    total: 7,
    unit: 'Days',
    status: 'Stopped',
    badgeVariant: 'status-failed',
  },
  {
    id: 4,
    name: 'Social Education Journey',
    date: '11/18/2025',
    type: 'Rolling',
    progress: 1,
    total: 7,
    unit: 'Days',
    status: 'Paused',
    badgeVariant: 'toc-attempted',
  },
];

export function CareJourneysWidget() {
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
          <span className={styles.title}>Care Journeys</span>
        </button>
        {!collapsed && (
          <ActionButton icon="solar:add-circle-linear" size="S" tooltip="Add" />
        )}
      </div>

      {!collapsed && (
        <div className={styles.body}>
          <div className={styles.table}>
            {/* Column headers */}
            <span className={`${styles.colLabel} ${styles.colName}`}>Journey Name</span>
            <span className={`${styles.colLabel} ${styles.colStatus}`}>Status</span>

            {/* Divider spans both columns */}
            <div className={styles.dividerLine} />

            {/* Data rows — flat children so they share the grid's column tracks */}
            {JOURNEYS.map((j, idx) => {
              const pct = j.total > 0 ? (j.progress / j.total) * 100 : 0;
              const isFirst = idx === 0;
              return (
                <Fragment key={j.id}>
                  <div className={`${styles.rowLeft} ${isFirst ? styles.rowFirst : ''}`}>
                    <span className={styles.journeyName}>{j.name}</span>
                    <span className={styles.journeyMeta}>{j.date} • {j.type}</span>
                    <div className={styles.progressRow}>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={styles.progressLabel}>{j.progress}/{j.total} {j.unit}</span>
                    </div>
                  </div>
                  <div className={`${styles.statusCell} ${isFirst ? styles.rowFirst : ''}`}>
                    <Badge variant={j.badgeVariant} label={j.status} style={{ fontWeight: 400 }} />
                  </div>
                </Fragment>
              );
            })}
          </div>

          <button className={styles.completedLink}>
            Completed Journeys
            <Icon name="solar:alt-arrow-right-linear" size={11} color="var(--primary-300, #8c5ae2)" />
          </button>
        </div>
      )}
    </div>
  );
}
