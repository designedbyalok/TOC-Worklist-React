import { Avatar } from '../../../components/Avatar/Avatar';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { Icon } from '../../../components/Icon/Icon';
import styles from './PatientHeader.module.css';

export function PatientHeader({ patient }) {
  if (!patient) return null;

  return (
    <div className={styles.header}>
      <Avatar variant="patient" initials={patient.initials || '??'} />
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{patient.name}</span>
          <span className={styles.memberId}>{patient.memberId}</span>
        </div>
        <div className={styles.meta}>
          <span>{patient.gender} &bull; {patient.age}</span>
          {patient.language && <span className={styles.langBadge}>{patient.language.toUpperCase()}</span>}
          {patient.facility && <><span className={styles.sep}>&bull;</span><span>{patient.facility}</span></>}
          {patient.lace && (
            <span className={styles.laceBadge} data-lace={patient.lace?.toLowerCase()}>
              LACE: {patient.lace}
            </span>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <ActionButton icon="solar:phone-linear" size="L" tooltip="Call" />
        <span className={styles.divider} />
        <ActionButton icon="solar:chat-round-line-linear" size="L" tooltip="Chat" />
        <span className={styles.divider} />
        <ActionButton icon="solar:clipboard-text-linear" size="L" tooltip="Tasks" />
        <span className={styles.divider} />
        <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More" />
      </div>
    </div>
  );
}
