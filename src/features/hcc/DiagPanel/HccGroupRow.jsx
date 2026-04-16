import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { IcdRow } from './IcdRow';
import styles from './HccGroupRow.module.css';

// Default provider shown on each card until per-HCC data lands.
const DEFAULT_PROVIDER = 'Robert Langdon';

export function HccCard({ hccTitle, icds, rafImpact = 0.166, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  const allResolved =
    icds.length > 0 && icds.every(i => ['Accepted', 'Dismissed'].includes(i.status));
  const hasOverride = icds.some(i => i.dismissReason);
  const stateLabel = allResolved ? 'Closed' : 'Open';

  return (
    <section className={styles.card}>
      <button
        type="button"
        className={styles.cardHeader}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className={styles.cardHeaderTop}>
          <span className={styles.cardTitle}>{hccTitle}</span>
          <Icon
            name="solar:alt-arrow-down-linear"
            size={16}
            color="var(--neutral-300)"
            className={open ? styles.chevOpen : ''}
          />
        </div>
        <div className={styles.cardHeaderBottom}>
          <span className={`${styles.statePill} ${allResolved ? styles.statePillClosed : styles.statePillOpen}`}>
            {stateLabel}
          </span>
          <span className={styles.providerChip} onClick={(e) => e.stopPropagation()}>
            <span className={styles.providerAvatar}>
              <Icon name="solar:user-linear" size={10} color="var(--neutral-300)" />
            </span>
            {DEFAULT_PROVIDER}
            <Icon name="solar:alt-arrow-down-linear" size={12} color="var(--neutral-300)" />
          </span>
          <span className={styles.rafInfo}>
            <span className={styles.rafLabel}>RAF:</span>
            <span className={styles.rafValue}>
              {Number(rafImpact).toFixed(3)}
            </span>
            <Icon name="solar:arrow-up-linear" size={12} color="var(--status-success)" />
          </span>
          {hasOverride && (
            <span className={styles.overrideChip}>
              <Icon name="solar:refresh-linear" size={10} color="var(--primary-300)" />
              Overrides
            </span>
          )}
        </div>
      </button>
      {open && (
        <div className={styles.cardBody}>
          <div className={styles.columnHeaders}>
            <span>ICD Code &amp; Description</span>
            <span className={styles.colEvidence}>Evidence</span>
            <span className={styles.colActions}>Actions</span>
          </div>
          <div className={styles.icdList}>
            {icds.map((icd, i) => (
              <IcdRow key={`${icd.code}-${i}`} icd={icd} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* Keep the old name available so existing imports don't break */
export { HccCard as HccGroupRow };
