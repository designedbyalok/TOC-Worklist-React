import { Icon } from '../Icon/Icon';
import styles from './SearchIconButton.module.css';

/**
 * Reusable search trigger button matching Figma icon action button.
 */
export function SearchIconButton({ className, ...props }) {
  const cls = [styles.root, className || ''].filter(Boolean).join(' ');

  return (
    <button type="button" className={cls} {...props}>
      <Icon name="solar:magnifer-linear" size={16} color="currentColor" />
    </button>
  );
}
