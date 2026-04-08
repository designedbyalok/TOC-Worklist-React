import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { CareGapItem } from './CareGapItem';
import styles from './CareGapSection.module.css';

export function CareGapSection({ section, selectedGaps, onToggleGap }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.section}>
      <button className={styles.header} onClick={() => setCollapsed(v => !v)}>
        <Icon name={collapsed ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-down-linear'} size={14} color="var(--neutral-300)" />
        <span className={styles.title}>{section.title}</span>
        <span className={styles.count}>{section.items.length}</span>
      </button>
      {!collapsed && (
        <div className={styles.items}>
          {section.items.map(item => (
            <CareGapItem key={item.id} item={item} selected={selectedGaps.includes(item.id)} onSelect={onToggleGap} />
          ))}
        </div>
      )}
    </div>
  );
}
