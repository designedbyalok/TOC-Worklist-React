import { useAppStore } from '../../../store/useAppStore';
import { Icon } from '../../../components/Icon/Icon';
import styles from './IcdRow.module.css';

const TYPE_CLASS = {
  Suspect: 'typeSuspect',
  Recapture: 'typeRecapture',
  Manual: 'typeManual',
};

// Derive a deterministic likelihood score (50–95) from the ICD code so each
// card shows stable numbers across reloads without adding a data field.
function likelihoodFor(code = '') {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) | 0;
  return 50 + (Math.abs(h) % 46);
}

function LikelihoodBadge({ score }) {
  const high = score >= 75;
  return (
    <span className={`${styles.likelihood} ${high ? styles.likelihoodHigh : styles.likelihoodMed}`}>
      <Icon
        name="solar:arrow-up-linear"
        size={10}
        color={high ? 'var(--neutral-0)' : 'var(--neutral-0)'}
      />
      {score}
    </span>
  );
}

export function IcdRow({ icd }) {
  const showToast = useAppStore(s => s.showToast);
  const likelihood = likelihoodFor(icd.code);

  const handleAccept = (e) => {
    e.stopPropagation();
    showToast('Accept — coming in Phase 3');
  };
  const handleDismiss = (e) => {
    e.stopPropagation();
    showToast('Dismiss — coming in Phase 3');
  };
  const handleMore = (e) => {
    e.stopPropagation();
    showToast('More — coming in Phase 3');
  };

  return (
    <div className={styles.row}>
      <div className={styles.codeCol}>
        <div className={styles.codeLine}>
          <span className={styles.code}>{icd.code}</span>
          {icd.type && (
            <span className={`${styles.typeTag} ${styles[TYPE_CLASS[icd.type]] || ''}`}>
              {icd.type}
            </span>
          )}
          <LikelihoodBadge score={likelihood} />
        </div>
        <div className={styles.desc}>{icd.desc}</div>
      </div>

      <div className={styles.evidenceCol}>
        <Icon name="solar:file-text-linear" size={14} color="var(--neutral-300)" />
        <span className={styles.evidenceCount}>{icd.docs ?? 0}</span>
      </div>

      <div className={styles.actionsCol}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={handleAccept}
          aria-label="Accept"
          title="Accept"
        >
          <Icon name="solar:check-read-linear" size={14} color="var(--neutral-400)" />
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={handleDismiss}
          aria-label="Dismiss"
          title="Dismiss"
        >
          <Icon name="solar:close-square-linear" size={14} color="var(--neutral-400)" />
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={handleMore}
          aria-label="More"
          title="More"
        >
          <Icon name="solar:menu-dots-bold" size={14} color="var(--neutral-400)" />
        </button>
      </div>
    </div>
  );
}
