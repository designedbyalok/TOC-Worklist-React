import { useState } from 'react';
import { Icon } from '../../../../../components/Icon/Icon';
import { DownChevronIcon } from '../../../../../components/Icon/DownChevronIcon';
import { ActionButton } from '../../../../../components/ActionButton/ActionButton';
import { Avatar } from '../../../../../components/Avatar/Avatar';
import { Badge } from '../../../../../components/Badge/Badge';
import styles from './PopulationGroupsWidget.module.css';

const GROUPS = [
  { id: 1, title: 'PHQ-8 completed every 3 months' },
  { id: 2, title: 'Exercise interventions for fall prevention in community-dwelling older adults' },
  { id: 3, title: 'Screen for hepatitis C virus infection in adolescents and adults' },
  { id: 4, title: 'Screen for hepatitis C virus infection in adolescents and adults' },
  { id: 5, title: 'Screen for hepatitis C virus infection in adolescents and adults' },
];

export function PopulationGroupsWidget() {
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
          <span className={styles.title}>Population Groups</span>
        </button>

        {!collapsed && (
          <div className={styles.headerRight}>
            <Badge variant="toc-new" label="View By: Active" trailingIcon="solar:alt-arrow-down-linear" />
            <span className={styles.divider} />
            <ActionButton icon="solar:add-circle-linear" size="S" tooltip="Add" />
          </div>
        )}
      </div>

      {!collapsed && (
        <div className={styles.body}>
          {GROUPS.map(group => (
            <div key={group.id} className={styles.item}>
              <Avatar
                variant="generic"
                size="32px"
                backgroundColor="var(--primary-50)"
                borderColor="var(--neutral-100)"
                icon={<Icon name="solar:users-group-rounded-linear" size={16} color="var(--primary-300)" />}
              />
              <div className={styles.itemContent}>
                <span className={styles.itemTitle}>{group.title}</span>
                <span className={styles.itemMeta}>Join Date: 06/30/2023 • Automation</span>
              </div>
            </div>
          ))}

          <button className={styles.viewMoreBtn}>
            View More
            <Icon name="solar:alt-arrow-down-linear" size={11} color="var(--primary-300, #8c5ae2)" />
          </button>
        </div>
      )}
    </div>
  );
}
