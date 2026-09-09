import { useState } from 'react';
import { Icon } from '../../../../../components/Icon/Icon';
import { DownChevronIcon } from '../../../../../components/Icon/DownChevronIcon';
import { ActionButton } from '../../../../../components/ActionButton/ActionButton';
import { Avatar } from '../../../../../components/Avatar/Avatar';
import { Badge } from '../../../../../components/Badge/Badge';
import styles from './InsuranceWidget.module.css';

const POLICIES = [
  {
    id: 1,
    name: 'BlueCross Blue Shield',
    status: 'Insured',
    badgeVariant: 'toc-enrolled',
    relationship: 'Self',
  },
  {
    id: 2,
    name: 'American Heritage-Workplace Division',
    status: 'Expired',
    badgeVariant: 'status-failed',
    relationship: 'Mother',
  },
];

export function InsuranceWidget() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <button className={styles.titleBtn} onClick={() => setCollapsed(v => !v)}>
          <DownChevronIcon
            size={13}
            color="var(--neutral-300)"
            style={collapsed ? { transform: 'rotate(-90deg)' } : undefined}
          />
          <span className={styles.title}>Insurance</span>
        </button>

        {!collapsed && (
          <div className={styles.headerRight}>
            <span className={styles.lastChecked}>Last Checked: 02/19/2024</span>
            <ActionButton icon="solar:refresh-linear" size="S" tooltip="Refresh" />
            <span className={styles.divider} />
            <ActionButton icon="solar:add-circle-linear" size="S" tooltip="Add" />
          </div>
        )}
      </div>

      {!collapsed && (
        <div className={styles.body}>
          {POLICIES.map(policy => (
            <div key={policy.id} className={styles.item}>
              <Avatar
                variant="generic"
                size="32px"
                backgroundColor="var(--neutral-50)"
                borderColor="var(--neutral-100)"
                icon={<Icon name="solar:umbrella-linear" size={16} color="var(--neutral-300)" />}
              />

              <div className={styles.itemContent}>
                <span className={styles.itemName}>{policy.name}</span>
                <div className={styles.itemMeta}>
                  <Badge variant={policy.badgeVariant} label={policy.status} />
                  <span className={styles.relationship}>• {policy.relationship}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
