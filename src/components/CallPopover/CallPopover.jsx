import { useEffect, useRef } from 'react';
import { Icon } from '../Icon/Icon';
import { Avatar } from '../Avatar/Avatar';
import { useAppStore } from '../../store/useAppStore';
import styles from './CallPopover.module.css';

const LANG_MAP = { en: 'English', es: 'Spanish', zh: 'Chinese', yue: 'Cantonese' };

export function CallPopover() {
  const callPopoverPatient = useAppStore(s => s.callPopoverPatient);
  const patients = useAppStore(s => s.patients);
  const closeCallPopover = useAppStore(s => s.closeCallPopover);
  const startActiveCall = useAppStore(s => s.startActiveCall);
  const showToast = useAppStore(s => s.showToast);
  const btnRef = useAppStore(s => s.callPopoverBtnRef);
  const popRef = useRef(null);

  const p = patients.find(x => x.id === callPopoverPatient);

  useEffect(() => {
    if (!p) return;
    const handler = (e) => {
      if (popRef.current && !popRef.current.contains(e.target) &&
          btnRef?.current && !btnRef.current.contains(e.target)) {
        closeCallPopover();
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [p, closeCallPopover, btnRef]);

  if (!p) return null;

  // Position near button
  const btnRect = btnRef?.current?.getBoundingClientRect();
  let top = 100, left = 100;
  if (btnRect) {
    top = btnRect.bottom + 8;
    left = btnRect.right - 360;
    if (left < 8) left = 8;
  }

  return (
    <div
      ref={popRef}
      className={styles.popover}
      style={{ top, left }}
      onClick={e => e.stopPropagation()}
    >
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Call {p.name}</div>
          <div className={styles.sub}>Prefer time 10 AM - 5 PM | M-F</div>
          <div className={styles.sub}>Speaks: {LANG_MAP[p.language] || 'English'}</div>
        </div>
        <button className={styles.closeBtn} onClick={closeCallPopover}>
          <Icon name="solar:close-linear" size={18} />
        </button>
      </div>

      <div className={styles.sectionLabel}>Patient Numbers</div>

      <label className={styles.number} style={{ borderLeft: '3px solid var(--primary-300)', background: 'var(--primary-50)' }}>
        <input type="radio" name="callNum" defaultChecked />
        <div className={styles.numberInfo}>
          <div className={styles.numberValue}>(581) 824-1591</div>
          <div className={styles.numberLabel}>Primary</div>
        </div>
        <div className={styles.tags}>
          <span className={`${styles.tag} ${styles.mostUsed}`}>Most Used</span>
          <span className={`${styles.tag} ${styles.lastUsed}`}>Last Used</span>
        </div>
      </label>
      <label className={styles.number}>
        <input type="radio" name="callNum" />
        <div className={styles.numberInfo}>
          <div className={styles.numberValue}>(581) 824-1592</div>
          <div className={styles.numberLabel}>Alternate • Used once</div>
        </div>
      </label>
      <label className={styles.number}>
        <input type="radio" name="callNum" />
        <div className={styles.numberInfo}>
          <div className={styles.numberValue}>(581) 824-1593</div>
          <div className={styles.numberLabel}>Son • Albert Flores</div>
        </div>
      </label>

      <div className={styles.via}>
        Call Via <span className={styles.viaLink}>⇆ Switch Number</span>
      </div>
      <div className={styles.caller}>
        <Avatar variant="assignee" initials="RF" />
        <div className={styles.callerInfo}>
          <div className={styles.callerName}>Richard Floyd</div>
          <div className={styles.callerPhone}>(584) 451-7666</div>
        </div>
        <span className={`${styles.tag} ${styles.lastUsed}`}>Last Used</span>
      </div>
      <button
        className={styles.callBtn}
        onClick={() => {
          closeCallPopover();
          startActiveCall(p.id);
          showToast(`Calling ${p.name}...`);
        }}
      >
        <Icon name="solar:phone-calling-bold" size={18} />
        Call Now
      </button>
    </div>
  );
}
