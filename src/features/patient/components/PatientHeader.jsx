import { useState } from 'react';
import { Avatar } from '../../../components/Avatar/Avatar';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { Icon } from '../../../components/Icon/Icon';
import { CONDITION_TAGS, HEADER_METRICS } from '../data/overviewMock';
import styles from './PatientHeader.module.css';

export function PatientHeader({ patient }) {
  const [tags, setTags] = useState(CONDITION_TAGS);
  if (!patient) return null;

  const m = HEADER_METRICS;

  return (
    <div className={styles.header}>
      {/* Row 1: Core info + clinical metrics + actions */}
      <div className={styles.row1}>
        <Avatar variant="patient" initials={patient.initials || '??'} />
        <div className={styles.nameBlock}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{patient.name}</span>
            <Icon name="solar:pen-2-linear" size={14} color="var(--neutral-200)" />
          </div>
          <div className={styles.meta}>
            <span>{patient.gender} &bull; {patient.dob || '9/14/1968'} ({patient.age})</span>
          </div>
        </div>

        <span className={styles.divider} />

        {/* Clinical metrics */}
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Consent</span>
            <span className={styles.metricValue}>{m.consent}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Acuity</span>
            <span className={`${styles.metricBadge} ${styles.badgeError}`}>{m.acuity}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>RAF</span>
            <span className={styles.metricValue}>
              {m.raf} <span className={styles.rafChange}>
                {m.rafChange} <Icon name="solar:arrow-up-linear" size={10} color="var(--status-success)" />
              </span>
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Next Appt.</span>
            <span className={styles.metricValue}>{m.nextAppt}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Last Contact</span>
            <span className={styles.metricValue}>
              <Icon name="solar:phone-linear" size={12} color="var(--status-error)" />
              {m.lastContact}
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Programs</span>
            <div className={styles.programBadges}>
              {m.programs.map(p => <span key={p} className={styles.programBadge}>{p}</span>)}
              {m.programsMore > 0 && <span className={styles.programMore}>+{m.programsMore}</span>}
            </div>
          </div>
        </div>

        <span className={styles.divider} />

        {/* Action buttons */}
        <div className={styles.actions}>
          <ActionButton icon="solar:monitor-linear" size="L" tooltip="EHR" />
          <span className={styles.divider} />
          <ActionButton icon="solar:phone-linear" size="L" tooltip="Call" />
          <span className={styles.divider} />
          <ActionButton icon="solar:letter-linear" size="L" tooltip="Email" />
        </div>
      </div>

      {/* Row 2: Condition tags */}
      <div className={styles.row2}>
        <button className={styles.patientType}>
          New Patient <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--neutral-300)" />
        </button>
        {tags.map((tag, i) => (
          <span key={i} className={styles.tag}>
            {tag.label}
            {tag.removable && (
              <button className={styles.tagClose} onClick={() => setTags(prev => prev.filter((_, j) => j !== i))}>
                <Icon name="solar:close-linear" size={10} color="var(--neutral-300)" />
              </button>
            )}
          </span>
        ))}
        <button className={styles.addTag}>
          <Icon name="solar:add-circle-linear" size={14} color="var(--primary-300)" />
        </button>
      </div>
    </div>
  );
}
