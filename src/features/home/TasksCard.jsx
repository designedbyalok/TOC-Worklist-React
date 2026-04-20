import { Icon } from '../../components/Icon/Icon';
import styles from './HomeView.module.css';

const TASKS = [
  { id: 1, title: 'Please follow up with the patient regarding their allergy update', date: '30 Oct 2023', due: 'Due Tomorrow', dueClass: 'urgent' },
  { id: 2, title: 'Patient Assessment', date: '30 Oct 2023', due: 'Due in 3 Days', dueClass: 'soon' },
  { id: 3, title: 'Medication Administration', date: '30 Oct 2023', due: 'Due in 6 Days', dueClass: 'later' },
  { id: 4, title: 'Create Care Plan', date: '30 Oct 2023', due: 'Completed by Dr. Robert Wilson', dueClass: 'done' },
  { id: 5, title: 'Send Patient Education', date: '30 Oct 2023', due: 'Completed by Dr. Robert Wilson', dueClass: 'done' },
];

export function TasksCard({ dragHandleClassName }) {
  return (
    <div className={styles.card}>
      <div className={[styles.cardHeader, dragHandleClassName].filter(Boolean).join(' ')}>
        <div className={styles.cardTitle}>
          <Icon name="solar:checklist-minimalistic-linear" size={14} color="var(--primary-300)" />
          TASKS
          <span className={styles.countChip}>{TASKS.length}</span>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.iconBtn} aria-label="Filter"><Icon name="solar:filter-linear" size={14} /></button>
        </div>
      </div>
      <div className={styles.cardBody}>
        {TASKS.map(t => (
          <div key={t.id} className={styles.taskRow}>
            <div className={styles.taskCheck} />
            <div className={styles.taskBody}>
              <div className={styles.taskTitle}>{t.title}</div>
              <div className={styles.taskMeta}>
                <Icon name="solar:flag-linear" size={11} className={styles.priorityFlag} />
                <span>{t.date}</span>
                <span>•</span>
                <span className={[styles.taskDue, styles[t.dueClass]].filter(Boolean).join(' ')}>{t.due}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
