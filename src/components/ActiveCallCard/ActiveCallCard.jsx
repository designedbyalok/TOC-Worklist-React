import { Icon } from '../Icon/Icon';
import { Avatar } from '../Avatar/Avatar';
import { useAppStore } from '../../store/useAppStore';
import styles from './ActiveCallCard.module.css';

function formatTimer(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export function ActiveCallCard() {
  const activeCallPatient = useAppStore(s => s.activeCallPatient);
  const activeCallSeconds = useAppStore(s => s.activeCallSeconds);
  const patients = useAppStore(s => s.patients);
  const endActiveCall = useAppStore(s => s.endActiveCall);

  const p = patients.find(x => x.id === activeCallPatient);
  const visible = !!activeCallPatient;

  return (
    <div className={[styles.card, visible ? styles.visible : ''].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <div className={styles.status}>
          <span className={styles.liveDot} />
          Active Call
          <span style={{ color: 'var(--neutral-200)', fontWeight: 400 }}>•</span>
          <span>{formatTimer(activeCallSeconds)}</span>
          <span style={{ color: 'var(--neutral-200)', fontWeight: 400 }}>•</span>
          <Icon name="solar:smile-circle-linear" size={14} color="#059669" />
          <span>{p?.agentAssigned || 'TOC Agent'}</span>
        </div>
        <button className={styles.expandBtn} title="Expand">
          <Icon name="solar:maximize-square-2-linear" size={16} />
        </button>
      </div>

      {p && (
        <div className={styles.patient}>
          <Avatar variant="callCard" initials={p.initials} />
          <div>
            <div className={styles.patientName}>
              {p.name}
              <a href="#" onClick={e => e.preventDefault()}>↗</a>
            </div>
            <div className={styles.patientMeta}>(125) 648-4230 ({p.gender} • {p.age})</div>
          </div>
        </div>
      )}

      <div className={styles.divider} />

      <div className={styles.actions}>
        <button className={styles.actionBtn} title="Mute">
          <Icon name="solar:microphone-slash-linear" size={18} />
        </button>
        <div className={styles.sep} />
        <button className={styles.actionBtn} title="Hold">
          <Icon name="solar:pause-linear" size={18} />
        </button>
        <div className={styles.sep} />
        <button className={styles.actionBtn} title="Transfer">
          <Icon name="solar:transfer-horizontal-linear" size={18} />
        </button>
        <div className={styles.sep} />
        <button className={styles.actionBtn} title="Add Participant">
          <Icon name="solar:user-plus-linear" size={18} />
        </button>
        <div className={styles.sep} />
        <button className={styles.actionBtn} title="Keypad">
          <Icon name="solar:keyboard-linear" size={18} />
        </button>
        <div className={styles.sep} />
        <button className={styles.actionBtn} title="More">
          <Icon name="solar:menu-dots-linear" size={18} />
        </button>
        <div className={styles.sep} />
        <button className={styles.endBtn} title="End Call" onClick={endActiveCall}>
          <Icon name="solar:end-call-linear" size={18} />
        </button>
      </div>
    </div>
  );
}
