import { Icon } from '../../components/Icon/Icon';
import styles from './HomeView.module.css';

const NOTES = [
  { id: 1, text: 'url: https://athena.qa.foldhealth.io/#/members/patient', meta: '07-01-2024, 7:30 pm' },
  { id: 2, text: 'need to follow up with Dr. Mike regarding the surgery', meta: '06-29-2024, 7:30 pm' },
];

export function QuickNotesCard({ dragHandleClassName }) {
  return (
    <div className={styles.card}>
      <div className={[styles.cardHeader, dragHandleClassName].filter(Boolean).join(' ')}>
        <div className={styles.cardTitle}>
          <Icon name="solar:notes-linear" size={14} color="var(--secondary-300)" />
          Quick Notes
        </div>
        <div className={styles.cardActions}>
          <button className={styles.iconBtn} aria-label="Add note"><Icon name="solar:add-circle-linear" size={14} /></button>
        </div>
      </div>
      <div className={[styles.cardBody, styles.notesBody].join(' ')}>
        {NOTES.map(n => (
          <div key={n.id} className={styles.stickyNote}>
            <div>{n.text}</div>
            <div className={styles.stickyMeta}>{n.meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
