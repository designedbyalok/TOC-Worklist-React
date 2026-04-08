import { Icon } from '../../../components/Icon/Icon';
import styles from './TimelineItem.module.css';

const ICON_MAP = {
  document: 'solar:document-text-linear',
  clipboard: 'solar:clipboard-text-linear',
  call: 'solar:phone-linear',
};

export function TimelineItem({ item }) {
  const iconName = ICON_MAP[item.iconType] || 'solar:document-text-linear';
  return (
    <div className={styles.row}>
      <div className={styles.iconWrap} style={{ background: item.iconBg }}>
        <Icon name={iconName} size={14} color={item.iconColor} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.time}>{item.date ? `${item.date} \u2022 ` : ''}{item.time}</span>
          <span className={styles.coordinator}>{item.coordinator}</span>
        </div>
        <div className={styles.titleRow}>
          <span className={styles.title}>{item.title}</span>
          {item.status && <span className={styles.status} style={{ color: item.statusType === 'success' ? 'var(--status-success)' : 'var(--neutral-300)' }}>{item.status}</span>}
        </div>
      </div>
    </div>
  );
}
