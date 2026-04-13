import { useState, useRef, useEffect } from 'react';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './ThemePicker.module.css';

/**
 * ThemePicker — dropdown-based theme selector.
 *
 * Built as a dropdown (rather than a segmented control) so additional themes
 * can be added later — e.g. high-contrast, custom brand palettes — without the
 * row blowing out horizontally inside the profile popover.
 *
 * Reads/writes the current theme via useAppStore. All color transitions are
 * handled by the global 200ms cascade in index.css when token values flip
 * under [data-theme="<name>"].
 */
const OPTIONS = [
  { value: 'light',  label: 'Light',        icon: 'solar:sun-2-linear' },
  { value: 'dark',   label: 'Dark',         icon: 'solar:moon-stars-linear' },
  { value: 'blue',   label: 'Blue',         icon: 'solar:palette-linear' },
  { value: 'plum',   label: 'Astrana Plum', icon: 'solar:crown-star-linear' },
  { value: 'system', label: 'System',       icon: 'solar:monitor-smartphone-linear' },
];

export function ThemePicker() {
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const current = OPTIONS.find(o => o.value === theme) || OPTIONS[0];

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={wrapRef}>
      <div className={styles.label}>Theme</div>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Theme"
        onClick={() => setOpen(o => !o)}
      >
        <span className={styles.triggerLeft}>
          <Icon name={current.icon} size={14} color="currentColor" />
          <span>{current.label}</span>
        </span>
        <Icon name="solar:alt-arrow-down-linear" size={12} color="currentColor" />
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label="Theme">
          {OPTIONS.map(opt => {
            const active = theme === opt.value;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`${styles.item} ${active ? styles.itemActive : ''}`}
                  onClick={() => { setTheme(opt.value); setOpen(false); }}
                >
                  <Icon name={opt.icon} size={14} color="currentColor" />
                  <span>{opt.label}</span>
                  {active && (
                    <span className={styles.check} aria-hidden="true">
                      <Icon name="solar:check-read-linear" size={14} color="var(--primary-300)" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
