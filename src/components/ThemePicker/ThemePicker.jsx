import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './ThemePicker.module.css';

/**
 * ThemePicker — segmented 3-button control for Light / Dark / System.
 * Reads and writes the current theme setting via useAppStore.
 * All color transitions are handled by the global 200ms cascade in index.css
 * (every property on every element transitions its background/color/border
 * when the token values change under [data-theme="dark"]).
 */
const OPTIONS = [
  { value: 'light',  label: 'Light',  icon: 'solar:sun-2-linear' },
  { value: 'dark',   label: 'Dark',   icon: 'solar:moon-stars-linear' },
  { value: 'system', label: 'System', icon: 'solar:monitor-smartphone-linear' },
];

export function ThemePicker() {
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>Theme</div>
      <div className={styles.segmented} role="radiogroup" aria-label="Theme">
        {OPTIONS.map(opt => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={opt.label}
              className={`${styles.option} ${active ? styles.active : ''}`}
              onClick={() => setTheme(opt.value)}
            >
              <span className={styles.iconWrap}>
                <Icon name={opt.icon} size={14} color="currentColor" />
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
