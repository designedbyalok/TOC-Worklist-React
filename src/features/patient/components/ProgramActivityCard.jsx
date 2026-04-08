import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Avatar } from '../../../components/Avatar/Avatar';
import { TimelineItem } from './TimelineItem';
import styles from './ProgramActivityCard.module.css';

const STATUS_STYLES = {
  success: { bg: 'var(--status-success-light)', border: 'rgba(0,155,83,0.2)', color: 'var(--status-success)' },
  error: { bg: 'var(--status-error-light)', border: 'rgba(215,40,37,0.1)', color: 'var(--status-error)' },
  primary: { bg: 'var(--primary-50)', border: 'rgba(140,90,226,0.2)', color: 'var(--primary-300)' },
};

export function ProgramActivityCard({ card }) {
  const [expanded, setExpanded] = useState(card.expanded || false);
  const statusStyle = STATUS_STYLES[card.statusType] || STATUS_STYLES.success;

  return (
    <div className={styles.card}>
      <div className={styles.dateCol}>
        <span className={styles.date}>{card.date}</span>
        <span className={styles.dayBadge}>{card.day}</span>
        <div className={styles.dotLine}>
          <span className={styles.dot} />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.header} onClick={() => setExpanded(v => !v)}>
          <div className={styles.headerLeft}>
            <Icon name={expanded ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-right-linear'} size={14} color="var(--neutral-300)" />
            <span className={styles.program}>{card.program}</span>
            <span className={styles.statusBadge} style={{ background: statusStyle.bg, borderColor: statusStyle.border, color: statusStyle.color }}>
              {card.status}
            </span>
          </div>
          <div className={styles.avatarStack}>
            {card.avatars.map((a, i) => (
              <div key={i} className={styles.avatarWrap} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: card.avatars.length - i }}>
                {a.variant === 'count' ? (
                  <span className={styles.avatarCount}>{a.initials}</span>
                ) : (
                  <Avatar variant="assignee" initials={a.initials} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.activities}>{card.activities}</div>
        {expanded && card.timelineItems?.length > 0 && (
          <div className={styles.timeline}>
            {card.timelineItems.map((item, i) => <TimelineItem key={i} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
