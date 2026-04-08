import { Icon } from '../../../components/Icon/Icon';
import { ProgramActivityCard } from './ProgramActivityCard';
import { PROGRAM_ACTIVITY_BY_MONTH, CM_FILTERS } from '../data/programActivityMock';
import styles from './CareManagementView.module.css';

export function CareManagementView() {
  return (
    <div className={styles.view}>
      {/* Filters */}
      <div className={styles.filters}>
        {CM_FILTERS.map(f => (
          <button key={f.label} className={`${styles.filterBtn} ${f.active ? styles.filterActive : ''}`}>
            {f.label}
            {f.value && <span className={styles.filterValue}>{f.value}</span>}
            <Icon name="solar:alt-arrow-down-linear" size={10} color={f.active ? 'var(--primary-300)' : 'var(--neutral-200)'} />
          </button>
        ))}
      </div>

      {/* Monthly sections */}
      <div className={styles.timeline}>
        {PROGRAM_ACTIVITY_BY_MONTH.map(month => (
          <div key={month.month} className={styles.monthSection}>
            <div className={styles.monthHeader}>
              <span className={styles.monthLine} />
              <span className={styles.monthTitle}>{month.month}</span>
              <span className={styles.monthLine} />
            </div>
            {month.cards.map(card => (
              <ProgramActivityCard key={card.id} card={card} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
