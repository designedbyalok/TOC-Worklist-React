import { Icon } from '../Icon/Icon';
import styles from './Drawer.module.css';

/**
 * Shared Drawer shell — the standard floating right-side panel.
 *
 * Props:
 *  - title        (ReactNode)  Header title text / element
 *  - onClose      (function)   Called when overlay or close button is clicked
 *  - headerRight  (ReactNode)  Extra elements rendered to the left of the close button
 *  - footer       (ReactNode)  Optional sticky footer content
 *  - children     (ReactNode)  Scrollable body content
 *  - className    (string)     Extra class on the panel root (rare)
 *
 * Design tokens (DO NOT change without design review):
 *  - Width: 700px
 *  - Inset: 8px (top, right, bottom) — gives the floating look
 *  - Border-radius: 16px (all corners)
 *  - Shadow: 0 8px 32px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.04)
 *  - Header padding: 20px 24px 16px
 *  - Body padding: 0 24px 24px (scrollable)
 *  - Footer padding: 16px 24px (if present)
 *  - Animation: slideIn .25s ease (translateX)
 */
export function Drawer({ title, onClose, headerRight, footer, children, className, bodyClassName, headerStyle, titleStyle }) {
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={`${styles.panel}${className ? ` ${className}` : ''}`}>
        <div className={styles.header} style={headerStyle}>
          <h2 className={styles.headerTitle} style={titleStyle}>{title}</h2>
          <div className={styles.headerRight}>
            {headerRight}
            <button className={styles.closeBtn} onClick={onClose}>
              <Icon name="solar:close-square-linear" size={20} />
            </button>
          </div>
        </div>
        <div className={`${styles.body}${bodyClassName ? ` ${bodyClassName}` : ''}`}>
          {children}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );
}
