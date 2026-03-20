import { useRef } from 'react';
import { Icon } from '../Icon/Icon';
import { Avatar } from '../Avatar/Avatar';
import { CreateNewPopover } from '../CreateNewPopover/CreateNewPopover';
import { useAppStore } from '../../store/useAppStore';
import styles from './TopBar.module.css';

export function TopBar() {
  const toggleSubnav = useAppStore(s => s.toggleSubnav);
  const subnavCollapsed = useAppStore(s => s.subnavCollapsed);
  const showCreateNew = useAppStore(s => s.showCreateNew);
  const setShowCreateNew = useAppStore(s => s.setShowCreateNew);
  const btnRef = useRef(null);

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.iconBtn}
          title="Toggle panel"
          onClick={toggleSubnav}
        >
          <Icon
            name={subnavCollapsed ? 'solar:alt-arrow-right-linear' : 'solar:sidebar-minimalistic-linear'}
            size={20}
          />
        </button>
        <nav className={styles.breadcrumb}>
          <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Population</a>
          <span className={styles.sep}>/</span>
          <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Worklists</a>
          <span className={styles.sep}>/</span>
          <span className={styles.breadcrumbCurrent}>TOC</span>
        </nav>
      </div>

      <div className={styles.center}>
        <div className={styles.searchBox}>
          <Icon name="solar:magnifer-linear" size={18} color="var(--neutral-200)" />
          <input type="text" placeholder="Search Patients or Members" />
        </div>
        <button className={styles.askUnity}>
          <Icon name="solar:bolt-bold" size={18} />
          Ask Unity
        </button>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} title="Notifications">
          <span className={styles.notifDot} />
          <Icon name="solar:bell-outline" size={20} />
        </button>
        <div className={styles.createNewWrap}>
          <button
            ref={btnRef}
            className={styles.btnPrimary}
            onClick={() => setShowCreateNew(!showCreateNew)}
          >
            <Icon name="solar:add-circle-bold" size={18} />
            Create New
          </button>
          {showCreateNew && (
            <CreateNewPopover onClose={() => setShowCreateNew(false)} anchorRef={btnRef} />
          )}
        </div>
        <button className={styles.btnSecondary}>Schedule</button>
        <Avatar variant="provider" initials="RF" />
      </div>
    </header>
  );
}
