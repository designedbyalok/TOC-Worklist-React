import { useState } from 'react';
import { Icon } from '../../../../../components/Icon/Icon';
import { DownChevronIcon } from '../../../../../components/Icon/DownChevronIcon';
import { ActionButton } from '../../../../../components/ActionButton/ActionButton';
import { Avatar } from '../../../../../components/Avatar/Avatar';
import { Switch } from '../../../../../components/Switch/Switch';
import styles from './ActiveAutomationsWidget.module.css';

const AUTOMATIONS = [
  {
    id: 1,
    title: 'Send email when task is delayed',
    description:
      'When a task is delayed beyond due date, send a reminder email to assigned person as well as everyone who is part of pool.',
    defaultOn: true,
  },
  {
    id: 2,
    title: 'Send Task Completion Email',
    description: 'When a task is complete, inform everyone in task pool via email.',
    defaultOn: false,
  },
];

export function ActiveAutomationsWidget() {
  const [collapsed, setCollapsed] = useState(false);
  const [states, setStates] = useState(() => {
    const map = {};
    AUTOMATIONS.forEach(a => { map[a.id] = a.defaultOn; });
    return map;
  });

  const handleToggle = (id, val) => setStates(prev => ({ ...prev, [id]: val }));

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <button className={styles.titleBtn} onClick={() => setCollapsed(v => !v)}>
          <DownChevronIcon
            size={13}
            color="var(--neutral-400)"
            style={collapsed ? { transform: 'rotate(-90deg)' } : undefined}
          />
          <span className={styles.title}>Active Automations</span>
        </button>
        {!collapsed && (
          <ActionButton icon="solar:refresh-linear" size="S" tooltip="Refresh" />
        )}
      </div>

      {!collapsed && (
        <div className={styles.body}>
          {AUTOMATIONS.map(a => (
            <div key={a.id} className={styles.item}>
              <Avatar
                variant="generic"
                size="32px"
                backgroundColor="var(--primary-50)"
                borderColor="var(--neutral-100)"
                icon={<Icon name="solar:bolt-linear" size={16} color="var(--primary-300)" />}
              />

              <div className={styles.itemContent}>
                <span className={styles.itemTitle}>{a.title}</span>
                <span className={styles.itemDesc}>{a.description}</span>
              </div>

              <div className={styles.itemActions}>
                <ActionButton icon="solar:eye-linear" size="S" />
                <Switch checked={states[a.id]} onChange={val => handleToggle(a.id, val)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
