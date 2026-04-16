import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { getActivityForMember } from '../data/activity';
import styles from './ActivityTimeline.module.css';

// Map activity entry type → icon + color treatment
const TYPE_ICON = {
  outreach:     { icon: 'solar:phone-calling-linear',       tone: 'neutral' },
  status_dos:   { icon: 'solar:settings-linear',            tone: 'neutral' },
  status_hcc:   { icon: 'solar:settings-linear',            tone: 'neutral' },
  accept:       { icon: 'solar:check-circle-linear',        tone: 'success' },
  dismiss:      { icon: 'solar:close-circle-linear',        tone: 'error' },
  delete:       { icon: 'solar:trash-bin-minimalistic-linear', tone: 'error' },
  upload:       { icon: 'solar:upload-linear',              tone: 'neutral' },
  create:       { icon: 'solar:add-circle-linear',          tone: 'warning' },
  assign_coder: { icon: 'solar:user-plus-linear',           tone: 'neutral' },
};

function TimelineItem({ entry, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const spec = TYPE_ICON[entry.t] || TYPE_ICON.outreach;
  const hasDetails = Array.isArray(entry.details) && entry.details.length > 0;

  return (
    <div className={styles.item}>
      <div className={styles.railCol}>
        {!isFirst && <span className={styles.railTop} />}
        <span className={`${styles.iconBox} ${styles[`tone_${spec.tone}`]}`}>
          <Icon name={spec.icon} size={14} />
        </span>
        {!isLast && <span className={styles.railBottom} />}
      </div>
      <div className={styles.content}>
        <div className={styles.meta}>
          {entry.date && <span>{entry.date}</span>}
          {entry.time && <span>&middot; {entry.time}</span>}
          {entry.by && <span>&middot; {entry.by}{entry.role ? ` (${entry.role})` : ''}</span>}
          {entry.dos && <span>&middot; DOS {entry.dos}</span>}
        </div>
        <div className={styles.headline}>{entry.headline}</div>
        {entry.tag && <div className={styles.tag}>{entry.tag}</div>}
        {entry.file && (
          <div className={styles.fileCard}>
            <Icon name="solar:document-text-linear" size={14} color="var(--neutral-300)" />
            <span className={styles.fileName}>{entry.file}</span>
            {entry.fileType && <span className={styles.fileType}>{entry.fileType}</span>}
          </div>
        )}
        {hasDetails && (
          <button
            type="button"
            className={styles.detailsToggle}
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
          >
            <Icon
              name="solar:alt-arrow-right-linear"
              size={11}
              color="var(--primary-300)"
              className={expanded ? styles.chevOpen : ''}
            />
            {expanded ? 'Hide details' : 'Show details'}
          </button>
        )}
        {expanded && hasDetails && (
          <div className={styles.details}>
            {entry.details.map((d, i) => (
              <div key={i} className={styles.detailRow}>
                {d.icd && <code className={styles.detailCode}>{d.icd}</code>}
                {d.from && <span className={styles.transPillFrom}>{d.from}</span>}
                {d.from && d.to && (
                  <Icon name="solar:arrow-right-linear" size={11} color="var(--neutral-300)" />
                )}
                {d.to && <span className={styles.transPillTo}>{d.to}</span>}
                {d.reason && <span className={styles.detailReason}>&ldquo;{d.reason}&rdquo;</span>}
                {d.note && <span className={styles.detailNote}>{d.note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityTimeline({ member }) {
  const entries = getActivityForMember(member?.name) || [];

  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon name="solar:history-linear" size={32} color="var(--neutral-200)" />
        <p>No activity recorded yet.</p>
      </div>
    );
  }

  const visibleEntries = entries.filter(e => e.t !== 'group');

  return (
    <div className={styles.timeline}>
      {entries.map((entry, i) => {
        if (entry.t === 'group') {
          return (
            <div key={`g-${i}`} className={styles.groupHeader}>
              {entry.label}
            </div>
          );
        }
        // Compute first/last among non-group entries for rail rendering
        const idxInVisible = visibleEntries.indexOf(entry);
        return (
          <TimelineItem
            key={`e-${i}`}
            entry={entry}
            isFirst={idxInVisible === 0}
            isLast={idxInVisible === visibleEntries.length - 1}
          />
        );
      })}
    </div>
  );
}
