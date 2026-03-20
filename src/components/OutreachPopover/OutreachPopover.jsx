import { Icon } from '../Icon/Icon';
import styles from './OutreachPopover.module.css';

const ATTEMPT_DATA = [
  { date: '11/10', time: '12:30 PM', ord: '3rd' },
  { date: '11/08', time: '02:15 PM', ord: '2nd' },
  { date: '11/06', time: '09:00 AM', ord: '1st' },
];

export function OutreachPopover({ patient, pos, onMouseEnter, onMouseLeave }) {
  if (!patient) return null;
  const dots = patient.outreachDots || ['pending','pending','pending'];
  const items = dots.map((d, i) => {
    if (d === 'pending') return null;
    const a = ATTEMPT_DATA[i] || ATTEMPT_DATA[2];
    const isSuccess = d === 'success';
    return (
      <div key={i} className={styles.item}>
        <div className={`${styles.icon} ${isSuccess ? styles.success : styles.failed}`}>
          <Icon name="solar:phone-calling-bold" size={14} />
        </div>
        <div className={styles.detail}>
          <div className={styles.meta}>{a.date} • {a.time} • {patient.assignee}</div>
          <div className={styles.desc}>Outgoing Call ({a.ord} Outreach)</div>
          <div className={`${styles.outcome} ${isSuccess ? styles.success : styles.failed}`}>
            {isSuccess ? 'Spoke with patient' : 'No Answer/Left Voicemail'}
          </div>
        </div>
      </div>
    );
  }).filter(Boolean);

  if (!items.length) return null;

  return (
    <div
      className={styles.popover}
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.header}>Outreach Activity</div>
      {items}
      <div className={styles.footer}><a>View All →</a></div>
    </div>
  );
}
