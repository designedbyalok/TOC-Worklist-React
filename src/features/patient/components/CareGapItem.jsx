import { Icon } from '../../../components/Icon/Icon';
import styles from './CareGapItem.module.css';

export function CareGapItem({ item, selected, onSelect }) {
  return (
    <div className={`${styles.row} ${selected ? styles.rowSelected : ''}`} onClick={() => onSelect?.(item.id)}>
      <input type="checkbox" className={styles.checkbox} checked={selected} onChange={() => onSelect?.(item.id)} onClick={e => e.stopPropagation()} />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{item.title}</span>
          {item.urgent && <Icon name="solar:danger-triangle-bold" size={14} color="var(--status-error)" />}
        </div>
        {item.diagnosis && <span className={styles.diagnosis}>{item.diagnosis}</span>}
      </div>
      <span className={`${styles.badge} ${item.status === 'Open' ? styles.badgeOpen : styles.badgeClosed}`}>
        {item.status}
      </span>
    </div>
  );
}
