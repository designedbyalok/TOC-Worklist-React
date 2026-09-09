import { DownChevronIcon } from '../../../components/Icon/DownChevronIcon';
import styles from './DiagPanel.module.css';

export function IcdSection({ title, count, open, onToggle, badge, children }) {
  return (
    <section className={styles.icdSection}>
      <button type="button" className={styles.icdSectionHeader} onClick={onToggle}>
        <span className={styles.icdSectionTitle}>
          {title} ({count})
        </span>
        {badge}
        <DownChevronIcon
          size={12}
          color="var(--neutral-300)"
          style={!open ? { transform: 'rotate(-90deg)' } : undefined}
        />
      </button>
      {open && (
        <div className={styles.icdSectionBody}>
          {children}
        </div>
      )}
    </section>
  );
}

export function SectionEmpty({ label }) {
  return <div className={styles.icdSectionEmpty}>{label}</div>;
}
