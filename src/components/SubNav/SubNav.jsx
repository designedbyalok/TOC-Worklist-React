import { Icon } from '../Icon/Icon';
import styles from './SubNav.module.css';

const MY_LISTS = [
  { label: 'Day Optimizer', count: 89 },
  { label: 'Review HRA', count: 85 },
  { label: 'IP Visits', count: 92 },
  { label: 'High Risk', count: 114 },
  { label: 'High Cost', count: 110 },
];

const SHARED_LISTS = [
  { label: 'SNP', count: 84 },
  { label: 'AWV', count: 133 },
  { label: 'TOC', count: 72, active: true },
  { label: 'High Utilizers', count: 98 },
  { label: 'DM', count: 57 },
];

export function SubNav({ collapsed }) {
  return (
    <aside className={[styles.subnav, collapsed ? styles.collapsed : ''].filter(Boolean).join(' ')}>
      <div className={styles.sectionLabel}>
        Worklists
        <button title="Add"><Icon name="solar:add-circle-linear" size={18} /></button>
      </div>
      <div className={styles.subLabel}>My Lists</div>
      {MY_LISTS.map(item => (
        <div key={item.label} className={styles.item}>
          {item.label}
          <span className={styles.count}>{item.count}</span>
        </div>
      ))}
      <div className={styles.subLabel} style={{ marginTop: 8 }}>Shared Lists</div>
      {SHARED_LISTS.map(item => (
        <div key={item.label} className={[styles.item, item.active ? styles.active : ''].filter(Boolean).join(' ')}>
          {item.label}
          <span className={styles.count}>{item.count}</span>
        </div>
      ))}
      <div className={styles.sectionLabel} style={{ marginTop: 8 }}>Patients</div>
      <div className={styles.item}>My Patients</div>
      <div className={styles.item}>All Patients</div>
      <div className={styles.sectionLabel} style={{ marginTop: 8 }}>Population Groups</div>
      <div className={styles.sectionLabel} style={{ marginTop: 4 }}>Leads &amp; Contacts</div>
    </aside>
  );
}
